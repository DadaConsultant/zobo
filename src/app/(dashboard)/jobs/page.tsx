import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Briefcase, Users, Link2, Clock, AlertTriangle } from "lucide-react";
import CopyButton from "@/components/dashboard/copy-button";

export default async function JobsPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const userStatus = session?.user?.status;
  const isPending = userStatus === "PENDING";
  const isSuspended = userStatus === "SUSPENDED";
  const isBlocked = session?.user?.role !== "ADMIN" && (isPending || isSuspended);

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
      {isPending && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Account pending approval</p>
            <p className="text-sm text-amber-700 mt-0.5">
              You cannot create jobs until an admin approves your company. You will receive an email when your account is ready.
            </p>
          </div>
        </div>
      )}
      {isSuspended && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Account suspended</p>
            <p className="text-sm text-red-700 mt-0.5">
              Job creation is disabled. Contact{" "}
              <a href="mailto:support@zobojobs.com" className="underline font-medium">support@zobojobs.com</a> for help.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-500 mt-1">Manage your job listings and interviews</p>
        </div>
        {isBlocked ? (
          <div title={isPending ? "Awaiting admin approval" : "Account suspended"}>
            <Button disabled className="opacity-50 cursor-not-allowed">
              <Plus className="w-4 h-4" />
              Create Job
            </Button>
          </div>
        ) : (
          <Link href="/jobs/new">
            <Button>
              <Plus className="w-4 h-4" />
              Create Job
            </Button>
          </Link>
        )}
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs yet</h3>
            <p className="text-gray-400 mb-6">Create a job to generate your AI interview link</p>
            {!isBlocked && (
              <Link href="/jobs/new">
                <Button>
                  <Plus className="w-4 h-4" />
                  Create Your First Job
                </Button>
              </Link>
            )}
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
