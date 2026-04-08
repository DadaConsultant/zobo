import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, TrendingUp, Video, WifiOff } from "lucide-react";
import { cn, getScoreColor } from "@/lib/utils";

interface Scores {
  technical_knowledge: number;
  communication: number;
  problem_solving: number;
  experience_fit: number;
  confidence: number;
  overall: number;
}

interface TranscriptEntry {
  role: "ai" | "candidate";
  content: string;
  timestamp: number;
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const candidate = await prisma.candidate.findFirst({
    where: { id, job: { createdById: session!.user!.id! } },
    include: { job: true, interview: true },
  });

  if (!candidate) notFound();

  const scores = candidate.interview?.scores as Scores | null;
  const transcript = candidate.interview?.transcript as TranscriptEntry[] | null;
  const videoUrl = candidate.interview?.videoUrl ?? null;
  const strengths = (candidate.interview?.strengths ?? []) as string[];
  const weaknesses = (candidate.interview?.weaknesses ?? []) as string[];

  const scoreItems = scores
    ? [
        { label: "Technical Knowledge", value: scores.technical_knowledge },
        { label: "Communication", value: scores.communication },
        { label: "Problem Solving", value: scores.problem_solving },
        { label: "Experience Fit", value: scores.experience_fit },
        { label: "Confidence", value: scores.confidence },
      ]
    : [];

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 space-y-4 sm:mb-8">
        <div className="flex items-start gap-2 sm:gap-3">
          <Link href={`/jobs/${candidate.jobId}`} className="shrink-0 pt-0.5">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 gap-y-2">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{candidate.name}</h1>
              <Badge
                variant={
                  candidate.interview?.status === "COMPLETED"
                    ? "success"
                    : candidate.interview?.status === "ABANDONED"
                      ? "destructive"
                      : "secondary"
                }
              >
                {candidate.interview?.status === "ABANDONED" ? "interrupted" : candidate.status.toLowerCase()}
              </Badge>
            </div>
            <p className="mt-1 break-words text-sm text-gray-500">
              {candidate.email} · {candidate.job.title}
            </p>
          </div>
          {scores && (
            <div className="hidden shrink-0 text-right sm:block">
              <div className={cn("text-3xl font-black lg:text-4xl", getScoreColor(scores.overall))}>
                {Math.round(scores.overall)}%
              </div>
              <p className="text-xs text-gray-400">Overall Score</p>
            </div>
          )}
        </div>
        {scores && (
          <div className="flex items-center gap-3 border-y border-gray-100 py-3 sm:hidden">
            <div className={cn("text-3xl font-black", getScoreColor(scores.overall))}>
              {Math.round(scores.overall)}%
            </div>
            <span className="text-sm text-gray-500">Overall score</span>
          </div>
        )}
      </div>

      {candidate.interview?.status === "ABANDONED" ? (
        // ── Abandoned: show partial data with a clear notice ───────────────
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
            <WifiOff className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Interview was interrupted</p>
              <p className="text-amber-700 text-sm mt-0.5">
                The candidate lost connection or closed the session before completing.
                {scores
                  ? " The data below is a partial AI evaluation based on the responses collected."
                  : " Not enough responses were collected for a full AI evaluation."}
              </p>
            </div>
          </div>

          {(scores || (transcript && transcript.length > 0)) && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              <div className="order-1 flex flex-col gap-4 lg:order-2 lg:col-span-2 lg:gap-6">
                {candidate.interview?.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Partial AI Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="leading-relaxed text-gray-700">{candidate.interview.summary}</p>
                    </CardContent>
                  </Card>
                )}
                {transcript && transcript.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <MessageSquare className="h-4 w-4" />
                        Partial Transcript
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[min(55vh,400px)] space-y-3 overflow-y-auto pt-0 sm:max-h-[400px]">
                      {transcript.map((entry, i) => (
                        <div key={i} className={cn("flex gap-3", entry.role === "ai" ? "flex-row" : "flex-row-reverse")}>
                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                              entry.role === "ai" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {entry.role === "ai" ? "Z" : "C"}
                          </div>
                          <div
                            className={cn(
                              "max-w-[85%] rounded-xl px-3 py-2 text-sm sm:max-w-[80%] sm:px-4 sm:py-2.5",
                              entry.role === "ai" ? "bg-indigo-50 text-indigo-900" : "bg-gray-100 text-gray-800"
                            )}
                          >
                            {entry.content}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="order-2 flex flex-col gap-4 lg:order-1 lg:col-span-1">
                {scores && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        Partial Score Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      {scoreItems.map((item) => (
                        <div key={item.label}>
                          <div className="mb-1.5 flex justify-between text-sm">
                            <span className="text-gray-600">{item.label}</span>
                            <span className={cn("font-bold", getScoreColor(item.value))}>
                              {Math.round(item.value)}
                            </span>
                          </div>
                          <Progress value={item.value} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      ) : candidate.interview?.status !== "COMPLETED" ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">Interview not yet completed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Mobile order: recording + summary + transcript first */}
          <div className="order-1 flex flex-col gap-4 lg:order-2 lg:col-span-2 lg:gap-6">
            {videoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Video className="h-4 w-4" />
                    Interview Recording
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-hidden rounded-lg bg-black">
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      className="max-h-[min(50vh,260px)] w-full object-contain sm:max-h-[min(58vh,360px)] lg:max-h-[360px]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {candidate.interview.summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="leading-relaxed text-gray-700">{candidate.interview.summary}</p>
                </CardContent>
              </Card>
            )}

            {transcript && transcript.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4" />
                    Interview Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[min(55vh,500px)] space-y-3 overflow-y-auto pt-0 sm:max-h-[500px]">
                  {transcript.map((entry, i) => (
                    <div
                      key={i}
                      className={cn("flex gap-3", entry.role === "ai" ? "flex-row" : "flex-row-reverse")}
                    >
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          entry.role === "ai" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {entry.role === "ai" ? "Z" : "C"}
                      </div>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-xl px-3 py-2 text-sm sm:max-w-[80%] sm:px-4 sm:py-2.5",
                          entry.role === "ai" ? "bg-indigo-50 text-indigo-900" : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {entry.content}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="order-2 flex flex-col gap-4 lg:order-1 lg:col-span-1">
            <Card>
              <CardContent className="p-4 sm:p-5">
                <div className="mb-1 flex items-center gap-2">
                  {candidate.interview.recommendation ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className="font-semibold text-gray-900">
                    {candidate.interview.recommendation ? "Recommended" : "Not Recommended"}
                  </span>
                </div>
                <p className="text-xs text-gray-400">AI hiring recommendation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {scoreItems.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <span className={cn("font-bold", getScoreColor(item.value))}>
                        {Math.round(item.value)}
                      </span>
                    </div>
                    <Progress value={item.value} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {strengths.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-green-700">✓ Strengths</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {strengths.map((s) => (
                    <div key={s} className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                      <p className="text-sm text-gray-700">{s}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {weaknesses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-red-600">✗ Areas to Improve</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {weaknesses.map((w) => (
                    <div key={w} className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                      <p className="text-sm text-gray-700">{w}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
