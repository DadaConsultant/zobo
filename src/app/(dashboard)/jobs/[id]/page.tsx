import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Users, Copy, Mail } from "lucide-react";
import { cn, getScoreBg } from "@/lib/utils";
import JobActions from "@/components/dashboard/job-actions";
import InviteCandidatesModal from "@/components/dashboard/invite-candidates-modal";

interface CandidateWithInterview {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
  interview: {
    scores: { overall: number } | null;
    status: string;
    summary: string | null;
    recommendation: boolean | null;
    completedAt: Date | null;
  } | null;
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const job = await prisma.job.findFirst({
    where: { id, createdById: session!.user!.id! },
    include: {
      candidates: {
        include: { interview: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

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
  const completionRate = job.candidates.length > 0
    ? Math.round((completed.length / job.candidates.length) * 100)
    : 0;

  const interviewUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/interview/${job.interviewLink}`;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/jobs">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <Badge variant={job.status === "ACTIVE" ? "success" : "secondary"}>
                {job.status.toLowerCase()}
              </Badge>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {(job.requiredSkills as string[]).join(" · ")} · {job.yearsExperience}+ years
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InviteCandidatesModal jobId={job.id} />
          <JobActions jobId={job.id} currentStatus={job.status} />
        </div>
      </div>

      {/* Interview Link */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-900 mb-1">Interview Link</p>
          <code className="text-sm text-indigo-700">{interviewUrl}</code>
        </div>
        <CopyButton text={interviewUrl} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Candidates", value: job.candidates.length, icon: Users },
          { label: "Completed", value: completed.length, icon: Users },
          { label: "Pending", value: pending.length, icon: Users },
          { label: "Completion Rate", value: `${completionRate}%`, icon: Users },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-400 uppercase mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
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
                <div key={candidate.id} className="flex items-center justify-between px-6 py-4 border-b border-yellow-100 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0 ? "bg-yellow-400 text-yellow-900" : index === 1 ? "bg-gray-300 text-gray-700" : "bg-orange-300 text-orange-900"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{candidate.name}</p>
                      <p className="text-sm text-gray-500">{candidate.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn("text-sm font-bold px-3 py-1 rounded-full", getScoreBg(overall))}>
                      {Math.round(overall)}% overall
                    </span>
                    {candidate.interview?.recommendation && (
                      <Badge variant="success">Recommended</Badge>
                    )}
                    <Link href={`/candidates/${candidate.id}`}>
                      <Button size="sm" variant="outline">View Profile</Button>
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
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Candidate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {[...top3, ...rest, ...pending.map(c => c as CandidateWithInterview)].map((candidate) => {
                  const scores = (candidate as CandidateWithInterview).interview?.scores as { overall?: number } | null;
                  const overall = scores?.overall;
                  return (
                    <tr key={candidate.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{candidate.name}</p>
                        <p className="text-xs text-gray-400">{candidate.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          candidate.status === "COMPLETED" ? "success" :
                          candidate.status === "INVITED" ? "default" : "secondary"
                        }>
                          {candidate.status.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {overall !== undefined ? (
                          <span className={cn("text-sm font-bold", getScoreBg(overall), "px-2 py-0.5 rounded-full")}>
                            {Math.round(overall)}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {candidate.status === "COMPLETED" && (
                          <Link href={`/candidates/${candidate.id}`}>
                            <Button size="sm" variant="ghost">View →</Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CopyButton({ text, label = "Copy Link" }: { text: string; label?: string }) {
  return (
    <button
      className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-200 rounded-lg px-3 py-2 transition-colors hover:bg-indigo-50"
      data-copy={text}
    >
      <Copy className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
