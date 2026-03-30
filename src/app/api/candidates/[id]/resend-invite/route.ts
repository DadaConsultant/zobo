import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInterviewInvite } from "@/lib/email";

const MAX_RESENDS = 1;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      job: { include: { createdBy: true } },
    },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  // Ensure the recruiter owns the job this candidate belongs to
  if (candidate.job.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Block if interview already completed or abandoned
  if (candidate.status === "COMPLETED") {
    return NextResponse.json(
      { error: "Candidate has already completed the interview" },
      { status: 400 }
    );
  }

  // Enforce resend limit
  if (candidate.resendCount >= MAX_RESENDS) {
    return NextResponse.json(
      { error: "Resend limit reached. You can only resend an invitation once." },
      { status: 429 }
    );
  }

  try {
    await sendInterviewInvite({
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      jobTitle: candidate.job.title,
      companyName: candidate.job.createdBy.company || "the company",
      interviewLink: candidate.job.interviewLink,
    });
  } catch (err) {
    console.error(`[resend-invite] Failed to send email to ${candidate.email}:`, err);
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }

  await prisma.candidate.update({
    where: { id },
    data: {
      resendCount: { increment: 1 },
      invitedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, resendCount: candidate.resendCount + 1 });
}
