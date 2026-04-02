import { prisma } from "@/lib/prisma";
import type { Candidate, Interview } from "@prisma/client";

export const INTERVIEW_MSG_NOT_REGISTERED =
  "We couldn't start your interview with that email, you are not registered to participate.";

export const INTERVIEW_MSG_COMPLETED = "Interview is now completed and been reviewed.";

type GateError = "NOT_REGISTERED" | "COMPLETED";

export type GateResult =
  | { ok: true; candidate: Candidate; interview: Interview | null }
  | { ok: false; error: GateError };

/**
 * Case-insensitive email match against candidates for this job.
 */
export async function findCandidateForInterview(jobId: string, email: string): Promise<Candidate | null> {
  const normalized = email.trim().toLowerCase();
  const rows = await prisma.candidate.findMany({ where: { jobId } });
  return rows.find((c) => c.email.toLowerCase() === normalized) ?? null;
}

export async function assertCandidateEligibleForInterview(
  jobId: string,
  email: string
): Promise<GateResult> {
  const candidate = await findCandidateForInterview(jobId, email);
  if (!candidate) {
    return { ok: false, error: "NOT_REGISTERED" };
  }

  if (candidate.status === "COMPLETED") {
    return { ok: false, error: "COMPLETED" };
  }

  if (candidate.status !== "INVITED" && candidate.status !== "PENDING") {
    return { ok: false, error: "NOT_REGISTERED" };
  }

  const interview = await prisma.interview.findUnique({
    where: { candidateId: candidate.id },
  });

  if (interview?.status === "COMPLETED") {
    return { ok: false, error: "COMPLETED" };
  }

  return { ok: true, candidate, interview };
}
