import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPrismaConnectionError } from "@/lib/prisma-connection-error";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Database, Trophy, Users } from "lucide-react";
import CopyButton from "@/components/dashboard/copy-button";
import { cn, getScoreBg } from "@/lib/utils";
import JobActions from "@/components/dashboard/job-actions";
import InviteCandidatesModal from "@/components/dashboard/invite-candidates-modal";
import ResendInviteButton from "@/components/dashboard/resend-invite-button";

interface CandidateWithInterview {
  id: string;
  name: string;
  email: string;
  status: string;
  resendCount: number;
  createdAt: Date;
  interview: {
    scores: { overall: number } | null;
    status: string;
    summary: string | null;
    recommendation: boolean | null;
    completedAt: Date | null;
  } | null;
}

function candidateStatusBadgeVariant(
  status: string
): "success" | "default" | "secondary" {
  if (status === "COMPLETED") return "success";
  if (status === "INVITED") return "default";
  return "secondary";
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  let job: Awaited<ReturnType<typeof prisma.job.findFirst<{
    include: {
      candidates: { include: { interview: true }; orderBy: { createdAt: "desc" } };
    };
  }>>> = null;
  let databaseUnreachable = false;

  try {
    job = await prisma.job.findFirst({
      where: { id, createdById: session!.user!.id! },
      include: {
        candidates: {
          include: { interview: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (err) {
    if (isPrismaConnectionError(err)) {
      databaseUnreachable = true;
      console.error("[jobs/[id]] database unreachable:", err);
    } else {
      throw err;
    }
  }

  if (databaseUnreachable) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-start gap-2 sm:gap-3">
          <Link href="/jobs" className="shrink-0 pt-0.5">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Job</h1>
            <p className="mt-1 text-sm text-gray-500">Details unavailable</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <Database className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-900">Can&apos;t reach the database</p>
            <p className="mt-1 text-sm leading-relaxed text-red-800">
              The app could not connect to your database server. If you use Railway, open your project and
              confirm the MySQL service is running (not stopped or sleeping). Copy the current{" "}
              <code className="rounded bg-red-100 px-1 py-0.5 text-xs">DATABASE_URL</code> from the service
              into <code className="rounded bg-red-100 px-1 py-0.5 text-xs">.env.local</code>, then restart
              the dev server. Reload this page once the connection works.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) notFound();

  const completed = job.candidates.filter((c) => c.status === "COMPLETED");
  const pending = job.candidates.filter((c) => c.status !== "COMPLETED");

  const ranked = [...completed].sort((a, b) => {
    const scoreA = (a.interview?.scores as { overall?: number } | null)?.overall ?? 0;
    const scoreB = (b.interview?.scores as { overall?: number } | null)?.overall ?? 0;
    return scoreB - scoreA;
  });

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const allCandidatesOrdered: CandidateWithInterview[] = [
    ...top3,
    ...rest,
    ...pending,
  ] as CandidateWithInterview[];
  const completionRate = job.candidates.length > 0
    ? Math.round((completed.length / job.candidates.length) * 100)
    : 0;

  const interviewUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/interview/${job.interviewLink}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-2 sm:gap-3">
          <Link href="/jobs" className="shrink-0 pt-0.5">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 gap-y-2">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{job.title}</h1>
              <Badge variant={job.status === "ACTIVE" ? "success" : "secondary"}>
                {job.status.toLowerCase()}
              </Badge>
            </div>
            <p className="mt-1 break-words text-sm text-gray-500">
              {(job.requiredSkills as string[]).join(" · ")} · {job.yearsExperience}+ years
            </p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:justify-end">
          <InviteCandidatesModal jobId={job.id} triggerClassName="w-full justify-center sm:w-auto" />
          <div className="flex w-full justify-end sm:w-auto sm:shrink-0">
            <JobActions jobId={job.id} currentStatus={job.status} />
          </div>
        </div>
      </div>

      {/* Interview Link */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <p className="mb-1 text-sm font-semibold text-indigo-900">Interview Link</p>
          <code className="break-all text-xs text-indigo-700 sm:text-sm">{interviewUrl}</code>
        </div>
        <div className="shrink-0">
          <CopyButton text={interviewUrl} />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {[
          { label: "Total Candidates", value: job.candidates.length, icon: Users },
          { label: "Completed", value: completed.length, icon: Users },
          { label: "Pending", value: pending.length, icon: Users },
          { label: "Completion Rate", value: `${completionRate}%`, icon: Users },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 sm:p-5">
              <p className="mb-1 text-xs font-medium uppercase text-gray-400">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Candidates */}
      {top3.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Trophy className="w-5 h-5" />
              Top Candidates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {top3.map((candidate, index) => {
              const scores = candidate.interview?.scores as { overall?: number } | null;
              const overall = scores?.overall ?? 0;
              return (
                <div
                  key={candidate.id}
                  className="flex flex-col gap-3 border-b border-yellow-100 px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        index === 0
                          ? "bg-yellow-400 text-yellow-900"
                          : index === 1
                            ? "bg-gray-300 text-gray-700"
                            : "bg-orange-300 text-orange-900"
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{candidate.name}</p>
                      <p className="truncate text-sm text-gray-500">{candidate.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={cn("rounded-full px-3 py-1 text-sm font-bold", getScoreBg(overall))}>
                      {Math.round(overall)}% overall
                    </span>
                    {candidate.interview?.recommendation && (
                      <Badge variant="success">Recommended</Badge>
                    )}
                    <Link href={`/candidates/${candidate.id}`} className="w-full sm:w-auto">
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* All Candidates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Candidates ({job.candidates.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {job.candidates.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No candidates yet</p>
              <p className="text-gray-400 text-sm mb-4">Share the interview link or invite candidates directly</p>
              <div className="flex items-center justify-center gap-3">
                <CopyButton text={interviewUrl} label="Copy Interview Link" />
                <InviteCandidatesModal jobId={job.id} />
              </div>
            </div>
          ) : (
            <>
              {/* Mobile: stacked rows */}
              <div className="divide-y divide-gray-100 md:hidden">
                {allCandidatesOrdered.map((candidate) => {
                  const scores = candidate.interview?.scores as { overall?: number } | null;
                  const overall = scores?.overall;
                  return (
                    <div key={candidate.id} className="space-y-3 px-4 py-4">
                      <div className="min-w-0">
                        <p className="text-base font-semibold leading-snug text-gray-900">{candidate.name}</p>
                        <p className="mt-0.5 break-all text-sm text-gray-500">{candidate.email}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 gap-y-2">
                          <Badge variant={candidateStatusBadgeVariant(candidate.status)}>
                            {candidate.status.toLowerCase()}
                          </Badge>
                          {overall !== undefined ? (
                            <span className={cn("rounded-full px-2.5 py-0.5 text-sm font-bold", getScoreBg(overall))}>
                              {Math.round(overall)}%
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">No score</span>
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(candidate.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {candidate.status === "COMPLETED" ? (
                        <Link href={`/candidates/${candidate.id}`} className="block">
                          <Button size="sm" variant="outline" className="w-full">
                            View profile
                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <ResendInviteButton candidateId={candidate.id} resendCount={candidate.resendCount} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* md+: table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[40rem]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400 sm:px-6">Candidate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400 sm:px-6">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400 sm:px-6">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400 sm:px-6">Date</th>
                      <th className="px-4 py-3 sm:px-6" />
                    </tr>
                  </thead>
                  <tbody>
                    {allCandidatesOrdered.map((candidate) => {
                      const scores = candidate.interview?.scores as { overall?: number } | null;
                      const overall = scores?.overall;
                      return (
                        <tr key={candidate.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3 sm:px-6 sm:py-4">
                            <p className="max-w-[10rem] truncate text-sm font-semibold text-gray-900 sm:max-w-xs">{candidate.name}</p>
                            <p className="max-w-[12rem] truncate text-xs text-gray-400">{candidate.email}</p>
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4">
                            <Badge variant={candidateStatusBadgeVariant(candidate.status)}>
                              {candidate.status.toLowerCase()}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                            {overall !== undefined ? (
                              <span className={cn("rounded-full px-2 py-0.5 text-sm font-bold", getScoreBg(overall))}>
                                {Math.round(overall)}%
                              </span>
                            ) : (
                              <span className="text-sm text-gray-300">—</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-400 sm:px-6 sm:py-4">
                            {new Date(candidate.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right sm:px-6 sm:py-4">
                            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                              {candidate.status !== "COMPLETED" && (
                                <ResendInviteButton candidateId={candidate.id} resendCount={candidate.resendCount} />
                              )}
                              {candidate.status === "COMPLETED" && (
                                <Link href={`/candidates/${candidate.id}`}>
                                  <Button size="sm" variant="ghost">
                                    View →
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
