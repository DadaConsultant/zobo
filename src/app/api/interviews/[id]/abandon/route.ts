import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateInterview, type TranscriptEntry } from "@/lib/openai";
import { rateLimitOpenAiInterview } from "@/lib/rate-limit";

/**
 * POST /api/interviews/[id]/abandon
 *
 * Called in two scenarios:
 *  1. Client-side `navigator.sendBeacon` when the tab closes mid-interview
 *  2. The daily cron job cleaning up stale IN_PROGRESS interviews
 *
 * Behaviour:
 *  - Marks the interview as ABANDONED (idempotent — ignores COMPLETED interviews)
 *  - Saves whatever partial transcript was collected
 *  - Runs a partial AI evaluation if the candidate answered at least 2 questions,
 *    so the recruiter still gets meaningful signal even from an incomplete session
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await rateLimitOpenAiInterview(req);
  if (limited) return limited;

  try {
    const { id } = await params;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { candidate: { include: { job: true } } },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Never downgrade a completed interview
    if (interview.status === "COMPLETED") {
      return NextResponse.json({ skipped: true });
    }

    // Accept partial transcript from the client beacon (may have more recent
    // data than what the /message route last persisted to the DB)
    let transcript: TranscriptEntry[] | null = null;
    try {
      const body = await req.json();
      if (Array.isArray(body.transcript)) {
        transcript = body.transcript as TranscriptEntry[];
      }
    } catch {
      // sendBeacon sometimes sends an empty body — fall back to DB transcript
    }

    const savedTranscript = (transcript ?? interview.transcript ?? []) as TranscriptEntry[];
    const candidateAnswers = savedTranscript.filter((t) => t.role === "candidate");

    // Run partial evaluation if the candidate answered at least 2 questions
    let evaluation = null;
    if (candidateAnswers.length >= 2) {
      try {
        const job = interview.candidate.job;
        evaluation = await evaluateInterview(savedTranscript, {
          title: job.title,
          description: job.description,
          requiredSkills: job.requiredSkills as string[],
          yearsExperience: job.yearsExperience,
        });
      } catch {
        // Partial evaluation is best-effort — don't block saving the status
      }
    }

    await prisma.interview.update({
      where: { id },
      data: {
        status: "ABANDONED",
        transcript: savedTranscript as never,
        ...(evaluation
          ? {
              scores: evaluation.scores as never,
              summary: evaluation.summary,
              strengths: evaluation.strengths as never,
              weaknesses: evaluation.weaknesses as never,
              recommendation: evaluation.recommendation,
            }
          : {}),
      },
    });

    return NextResponse.json({ success: true, partialEvaluation: !!evaluation });
  } catch (error) {
    console.error("Abandon interview error:", error);
    return NextResponse.json({ error: "Failed to abandon interview" }, { status: 500 });
  }
}
