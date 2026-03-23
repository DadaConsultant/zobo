import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const startSchema = z.object({
  token: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, name, email } = startSchema.parse(body);

    const job = await prisma.job.findUnique({
      where: { interviewLink: token },
    });

    if (!job || job.status !== "ACTIVE") {
      return NextResponse.json({ error: "Interview link not found or inactive" }, { status: 404 });
    }

    const existing = await prisma.candidate.findUnique({
      where: { email_jobId: { email, jobId: job.id } },
      include: { interview: true },
    });

    if (existing?.interview?.status === "COMPLETED") {
      return NextResponse.json(
        { error: "You have already completed this interview" },
        { status: 400 }
      );
    }

    let candidate = existing;
    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: { name, email, jobId: job.id, status: "PENDING" },
        include: { interview: true },
      });
    }

    let interview = existing?.interview;
    if (!interview) {
      interview = await prisma.interview.create({
        data: { candidateId: candidate.id, strengths: [], weaknesses: [] },
      });
    }

    return NextResponse.json({
      interviewId: interview.id,
      candidateId: candidate.id,
      jobTitle: job.title,
      interviewScript: job.interviewScript,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to start interview" }, { status: 500 });
  }
}
