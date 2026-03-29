import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInterviewReminder } from "@/lib/email";
import { evaluateInterview, type TranscriptEntry } from "@/lib/openai";

// Vercel calls this route daily at 9am UTC (configured in vercel.json).
// It finds all invited/pending candidates who haven't completed their interview
// and sends a reminder at the 24h and 48h marks.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = { sent: 0, skipped: 0, failed: 0, abandoned: 0 };

  try {
    // ── Auto-abandon stale IN_PROGRESS interviews (older than 90 minutes) ──
    const staleThreshold = new Date(now.getTime() - 90 * 60 * 1000);
    const staleInterviews = await prisma.interview.findMany({
      where: {
        status: "IN_PROGRESS",
        startedAt: { lt: staleThreshold },
      },
      include: { candidate: { include: { job: true } } },
    });

    for (const interview of staleInterviews) {
      const savedTranscript = (interview.transcript ?? []) as TranscriptEntry[];
      const candidateAnswers = savedTranscript.filter((t) => t.role === "candidate");

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
          // Best-effort — don't block the status update
        }
      }

      await prisma.interview.update({
        where: { id: interview.id },
        data: {
          status: "ABANDONED",
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

      results.abandoned++;
    }

    // ── Send reminders to pending / invited candidates ──────────────────────
    // Find all candidates who were invited but haven't completed yet
    const pendingCandidates = await prisma.candidate.findMany({
      where: {
        status: { in: ["INVITED", "PENDING"] },
        invitedAt: { not: null },
        job: { status: "ACTIVE" },
      },
      include: {
        job: {
          include: { createdBy: true },
        },
      },
    });

    for (const candidate of pendingCandidates) {
      if (!candidate.invitedAt) continue;

      const hoursElapsed =
        (now.getTime() - candidate.invitedAt.getTime()) / (1000 * 60 * 60);

      // Send reminder at ~24h (between 20–28h) or ~48h (between 44–52h)
      const is24hWindow = hoursElapsed >= 20 && hoursElapsed <= 28;
      const is48hWindow = hoursElapsed >= 44 && hoursElapsed <= 52;

      if (!is24hWindow && !is48hWindow) {
        results.skipped++;
        continue;
      }

      try {
        await sendInterviewReminder({
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          jobTitle: candidate.job.title,
          companyName: candidate.job.createdBy.company || "the company",
          interviewLink: candidate.job.interviewLink,
        });
        results.sent++;
      } catch (err) {
        console.error(`Failed to send reminder to ${candidate.email}:`, err);
        results.failed++;
      }
    }

    console.log(`Cron reminders: ${JSON.stringify(results)}`);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Cron reminders error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
