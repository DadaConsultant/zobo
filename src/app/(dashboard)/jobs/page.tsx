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
    <div className="p-4 sm:p-6 lg:p-8">
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

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Jobs</h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">Manage your job listings and interviews</p>
        </div>
        {isBlocked ? (
          <div className="shrink-0" title={isPending ? "Awaiting admin approval" : "Account suspended"}>
            <Button disabled className="w-full cursor-not-allowed opacity-50 sm:w-auto">
              <Plus className="h-4 w-4" />
              Create Job
            </Button>
          </div>
        ) : (
          <Link href="/jobs/new" className="shrink-0">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
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
              <div
                key={job.id}
                className="flex flex-col gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-colors hover:border-[#1F2937]/30 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2 gap-y-2">
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">{job.title}</h2>
                    <Badge variant={job.status === "ACTIVE" ? "success" : job.status === "PAUSED" ? "warning" : "secondary"}>
                      {job.status.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      {job._count.candidates} candidates
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Link2 className="h-3.5 w-3.5 shrink-0" />
                      {completionRate}% completion
                    </span>
                    <span className="text-xs sm:text-sm">Created {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
                    <code className="break-all rounded border border-gray-100 bg-gray-50 px-2 py-1 text-xs text-gray-600">
                      /interview/{job.interviewLink}
                    </code>
                    <CopyButton
                      text={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/interview/${job.interviewLink}`}
                      label="Copy"
                      variant="icon"
                    />
                  </div>
                </div>
                <div className="flex shrink-0 lg:ml-0">
                  <Link href={`/jobs/${job.id}`} className="w-full lg:w-auto">
                    <Button variant="outline" size="sm" className="w-full lg:w-auto">
                      View Candidates
                    </Button>
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
