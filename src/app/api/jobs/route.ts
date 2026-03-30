import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInterviewScript } from "@/lib/openai";
import { generateInterviewToken } from "@/lib/utils";
import { z } from "zod";

const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  type: z.string(),
  followUpPrompt: z.string().optional(),
});

const approvedScriptSchema = z.object({
  introduction: z.string(),
  questions: z.array(questionSchema).min(1),
  scoringRubric: z.record(z.string(), z.string()).optional(),
});

const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(50),
  requiredSkills: z.array(z.string()).min(1),
  yearsExperience: z.number().min(0).max(20),
  customQuestions: z.array(z.string()).optional(),
  // When provided the client has already reviewed/edited the GPT output —
  // skip a second generation call and save this script directly.
  approvedScript: approvedScriptSchema.optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.job.findMany({
    where: { createdById: session.user.id },
    include: {
      _count: {
        select: { candidates: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createJobSchema.parse(body);

    const interviewScript = data.approvedScript
      ? data.approvedScript
      : await generateInterviewScript({
          title: data.title,
          description: data.description,
          requiredSkills: data.requiredSkills,
          yearsExperience: data.yearsExperience,
          customQuestions: data.customQuestions,
        });

    const interviewLink = generateInterviewToken(data.title);

    const job = await prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        requiredSkills: data.requiredSkills,
        yearsExperience: data.yearsExperience,
        customQuestions: data.customQuestions || [],
        interviewScript: interviewScript as object,
        interviewLink,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Job creation error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
