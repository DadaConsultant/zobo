import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { evaluateAndStoreInterviewResult } from "@/lib/persist-interview-evaluation";
import { rateLimitOpenAiInterview } from "@/lib/rate-limit";
import { z } from "zod";

/** Headroom for background evaluation after the response is sent (Vercel serverless). */
export const maxDuration = 60;

const completeSchema = z.object({
  transcript: z.array(
    z.object({
      role: z.enum(["ai", "candidate"]),
      content: z.string(),
      timestamp: z.number(),
    })
  ),
});

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
      include: {
        candidate: {
          include: { job: true },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Idempotent retries: interview already saved — return success without duplicating work.
    if (interview.status === "COMPLETED" && interview.transcript != null) {
      return NextResponse.json({
        success: true,
        evaluationPending: interview.scores == null,
      });
    }

    const body = await req.json();
    const { transcript } = completeSchema.parse(body);

    await prisma.$transaction([
      prisma.interview.update({
        where: { id },
        data: {
          transcript: transcript as never,
          scores: Prisma.DbNull,
          summary: null,
          strengths: [] as never,
          weaknesses: [] as never,
          recommendation: null,
          status: "COMPLETED",
          completedAt: new Date(),
        },
      }),
      prisma.candidate.update({
        where: { id: interview.candidateId },
        data: { status: "COMPLETED" },
      }),
    ]);

    after(async () => {
      await evaluateAndStoreInterviewResult(id);
    });

    return NextResponse.json({ success: true, evaluationPending: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Complete interview error:", error);
    return NextResponse.json({ error: "Failed to complete interview" }, { status: 500 });
  }
}
