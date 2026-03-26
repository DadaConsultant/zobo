import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, TrendingUp, Video } from "lucide-react";
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
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/jobs/${candidate.jobId}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
            <Badge variant={candidate.status === "COMPLETED" ? "success" : "secondary"}>
              {candidate.status.toLowerCase()}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            {candidate.email} · {candidate.job.title}
          </p>
        </div>
        {scores && (
          <div className="text-right">
            <div className={cn("text-4xl font-black", getScoreColor(scores.overall))}>
              {Math.round(scores.overall)}%
            </div>
            <p className="text-xs text-gray-400">Overall Score</p>
          </div>
        )}
      </div>

      {candidate.interview?.status !== "COMPLETED" ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">Interview not yet completed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Scores */}
          <div className="col-span-1 space-y-4">
            {/* Recommendation */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  {candidate.interview.recommendation ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="font-semibold text-gray-900">
                    {candidate.interview.recommendation ? "Recommended" : "Not Recommended"}
                  </span>
                </div>
                <p className="text-xs text-gray-400">AI hiring recommendation</p>
              </CardContent>
            </Card>

            {/* Score breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {scoreItems.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
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

            {/* Strengths */}
            {strengths.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-green-700">✓ Strengths</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {strengths.map((s) => (
                    <div key={s} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{s}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Weaknesses */}
            {weaknesses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-red-600">✗ Areas to Improve</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {weaknesses.map((w) => (
                    <div key={w} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{w}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Video + Summary + Transcript */}
          <div className="col-span-2 space-y-4">
            {/* Video recording */}
            {videoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Video className="w-4 h-4" />
                    Interview Recording
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg bg-black"
                    style={{ maxHeight: 360 }}
                  />
                </CardContent>
              </Card>
            )}

            {/* AI Summary */}
            {candidate.interview.summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 leading-relaxed">{candidate.interview.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Transcript */}
            {transcript && transcript.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    Interview Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3 max-h-[500px] overflow-y-auto">
                  {transcript.map((entry, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-3",
                        entry.role === "ai" ? "flex-row" : "flex-row-reverse"
                      )}
                    >
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                          entry.role === "ai"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {entry.role === "ai" ? "Z" : "C"}
                      </div>
                      <div
                        className={cn(
                          "max-w-[80%] px-4 py-2.5 rounded-xl text-sm",
                          entry.role === "ai"
                            ? "bg-indigo-50 text-indigo-900"
                            : "bg-gray-100 text-gray-800"
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
        </div>
      )}
    </div>
  );
}
