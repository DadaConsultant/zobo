import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAIResponse, type TranscriptEntry, type InterviewQuestion } from "@/lib/openai";
import { rateLimitOpenAiInterview } from "@/lib/rate-limit";
import { z } from "zod";

const messageSchema = z.object({
  transcript: z.array(
    z.object({
      role: z.enum(["ai", "candidate"]),
      content: z.string(),
      timestamp: z.number(),
    })
  ),
  currentQuestion: z.object({
    id: z.string(),
    text: z.string(),
    type: z.string(),
    followUpPrompt: z.string().optional(),
  }),
  nextQuestion: z
    .object({
      id: z.string(),
      text: z.string(),
      type: z.string(),
      followUpPrompt: z.string().optional(),
    })
    .nullable(),
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

    if (!interview || interview.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Interview not found or ended" }, { status: 404 });
    }

    const body = await req.json();
    const { transcript, currentQuestion, nextQuestion } = messageSchema.parse(body);

    const job = interview.candidate.job;
    const jobContext = {
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills as string[],
      yearsExperience: job.yearsExperience,
    };

    const aiResponse = await generateAIResponse(
      transcript as TranscriptEntry[],
      currentQuestion as InterviewQuestion,
      nextQuestion as InterviewQuestion | null,
      jobContext
    );

    await prisma.interview.update({
      where: { id },
      data: { transcript: transcript as never },
    });

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Message error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
