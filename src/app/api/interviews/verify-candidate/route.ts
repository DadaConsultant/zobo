import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  assertCandidateEligibleForInterview,
  INTERVIEW_MSG_COMPLETED,
  INTERVIEW_MSG_NOT_REGISTERED,
} from "@/lib/interview-candidate-gate";
import { rateLimitOpenAiInterview } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimitOpenAiInterview(req);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { token, email } = schema.parse(body);

    const job = await prisma.job.findUnique({
      where: { interviewLink: token },
      select: { id: true, status: true },
    });

    if (!job || job.status !== "ACTIVE") {
      return NextResponse.json({ error: "Interview link not found or inactive" }, { status: 404 });
    }

    const gate = await assertCandidateEligibleForInterview(job.id, email);
    if (!gate.ok) {
      if (gate.error === "COMPLETED") {
        return NextResponse.json({ verified: false, code: "COMPLETED", error: INTERVIEW_MSG_COMPLETED }, { status: 403 });
      }
      return NextResponse.json(
        { verified: false, code: "NOT_REGISTERED", error: INTERVIEW_MSG_NOT_REGISTERED },
        { status: 403 }
      );
    }

    return NextResponse.json({
      verified: true,
      name: gate.candidate.name,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("[verify-candidate]", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
