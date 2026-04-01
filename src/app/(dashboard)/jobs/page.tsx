import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Briefcase, Users, Link2 } from "lucide-react";
import CopyButton from "@/components/dashboard/copy-button";

export default async function JobsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const jobs = await prisma.job.findMany({
    where: { createdById: userId },
    include: {
      _count: { select: { candidates: true } },
      candidates: {
        where: { status: "COMPLETED" },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-500 mt-1">Manage your job listings and interviews</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="w-4 h-4" />
            Create Job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs yet</h3>
            <p className="text-gray-400 mb-6">Create a job to generate your AI interview link</p>
            <Link href="/jobs/new">
              <Button>
                <Plus className="w-4 h-4" />
                Create Your First Job
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const completionRate =
              job._count.candidates > 0
                ? Math.round((job.candidates.length / job._count.candidates) * 100)
                : 0;

            return (
              <div key={job.id} className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-6 flex items-center justify-between hover:border-[#1F2937]/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                    <Badge variant={job.status === "ACTIVE" ? "success" : job.status === "PAUSED" ? "warning" : "secondary"}>
                      {job.status.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-5 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {job._count.candidates} candidates
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" />
                      {completionRate}% completion
                    </span>
                    <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <code className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-100">
                      /interview/{job.interviewLink}
                    </code>
                    <CopyButton
                      text={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/interview/${job.interviewLink}`}
                      label="Copy"
                      variant="icon"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">View Candidates</Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
