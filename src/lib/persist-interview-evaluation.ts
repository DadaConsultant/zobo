import { prisma } from "@/lib/prisma";
import { evaluateInterview, type TranscriptEntry, type JobContext } from "@/lib/openai";

export type EvaluateInterviewOutcome =
  | { ok: true }
  | { skipped: true; reason: "not_found" | "no_transcript" | "already_evaluated" }
  | { error: true; message: string };

/**
 * Run AI evaluation and persist scores/summary. Idempotent: no-op if scores already set.
 * Used by /complete (after the HTTP response) and a cron fallback.
 */
export async function evaluateAndStoreInterviewResult(interviewId: string): Promise<EvaluateInterviewOutcome> {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { candidate: { include: { job: true } } },
  });

  if (!interview) return { skipped: true, reason: "not_found" };
  if (interview.scores != null) return { skipped: true, reason: "already_evaluated" };
  if (interview.transcript == null) return { skipped: true, reason: "no_transcript" };

  const job = interview.candidate.job;
  const jobContext: JobContext = {
    title: job.title,
    description: job.description,
    requiredSkills: job.requiredSkills as string[],
    yearsExperience: job.yearsExperience,
  };

  try {
    const evaluation = await evaluateInterview(
      interview.transcript as unknown as TranscriptEntry[],
      jobContext
    );
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        scores: evaluation.scores as never,
        summary: evaluation.summary,
        strengths: evaluation.strengths as never,
        weaknesses: evaluation.weaknesses as never,
        recommendation: evaluation.recommendation,
      },
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Evaluation failed";
    console.error("evaluateAndStoreInterviewResult failed:", err);
    return { error: true, message };
  }
}
