import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateInterview, type TranscriptEntry } from "@/lib/openai";
import { z } from "zod";

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

    const body = await req.json();
    const { transcript } = completeSchema.parse(body);

    const job = interview.candidate.job;
    const jobContext = {
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills as string[],
      yearsExperience: job.yearsExperience,
    };

    const evaluation = await evaluateInterview(transcript as TranscriptEntry[], jobContext);

    await prisma.$transaction([
      prisma.interview.update({
        where: { id },
        data: {
          transcript: transcript as never,
          scores: evaluation.scores as never,
          summary: evaluation.summary,
          strengths: evaluation.strengths as never,
          weaknesses: evaluation.weaknesses as never,
          recommendation: evaluation.recommendation,
          status: "COMPLETED",
          completedAt: new Date(),
        },
      }),
      prisma.candidate.update({
        where: { id: interview.candidateId },
        data: { status: "COMPLETED" },
      }),
    ]);

    return NextResponse.json({ success: true, evaluation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Complete interview error:", error);
    return NextResponse.json({ error: "Failed to complete interview" }, { status: 500 });
  }
}
