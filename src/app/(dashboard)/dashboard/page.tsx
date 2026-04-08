import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPrismaConnectionError } from "@/lib/prisma-connection-error";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, CheckCircle, TrendingUp, Plus, ArrowRight, Clock, AlertTriangle, Database } from "lucide-react";
import type { Prisma } from "@prisma/client";

type JobWithCount = Prisma.JobGetPayload<{
  include: { _count: { select: { candidates: true } } };
}>;

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  let jobs: JobWithCount[] = [];
  let totalCandidates = 0;
  let completedInterviews = 0;
  let databaseUnreachable = false;

  try {
    const result = await Promise.all([
      prisma.job.findMany({
        where: { createdById: userId },
        include: { _count: { select: { candidates: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.candidate.count({
        where: { job: { createdById: userId } },
      }),
      prisma.interview.count({
        where: {
          status: "COMPLETED",
          candidate: { job: { createdById: userId } },
        },
      }),
    ]);
    jobs = result[0];
    totalCandidates = result[1];
    completedInterviews = result[2];
  } catch (err) {
    if (isPrismaConnectionError(err)) {
      databaseUnreachable = true;
      console.error("[dashboard] database unreachable:", err);
    } else {
      throw err;
    }
  }

  const completionRate =
    totalCandidates > 0 ? Math.round((completedInterviews / totalCandidates) * 100) : 0;

  const stats = [
    { label: "Active Jobs",       value: jobs.filter((j) => j.status === "ACTIVE").length, icon: Briefcase,   color: "text-[#1F2937]",  bg: "bg-[#1F2937]/10" },
    { label: "Total Candidates",  value: totalCandidates,                                  icon: Users,        color: "text-[#0D9488]",  bg: "bg-[#4FD1C7]/15" },
    { label: "Interviews Done",   value: completedInterviews,                              icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-50"     },
    { label: "Completion Rate",   value: `${completionRate}%`,                             icon: TrendingUp,   color: "text-[#1F2937]",  bg: "bg-[#1F2937]/10" },
  ];

  const userStatus = session?.user?.status;
  const isPending   = userStatus === "PENDING";
  const isSuspended = userStatus === "SUSPENDED";
  const isBlocked   = isPending || isSuspended;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Database unreachable (e.g. Railway MySQL stopped or wrong DATABASE_URL) */}
      {databaseUnreachable && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <Database className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-900">Can&apos;t reach the database</p>
            <p className="mt-1 text-sm leading-relaxed text-red-800">
              The app could not connect to your database server. If you use Railway, open your project and
              confirm the MySQL service is running (not stopped or sleeping). Copy the current{" "}
              <code className="rounded bg-red-100 px-1 py-0.5 text-xs">DATABASE_URL</code> from the service
              into <code className="rounded bg-red-100 px-1 py-0.5 text-xs">.env.local</code>, then restart
              the dev server. Stats below are shown as empty until the connection works.
            </p>
          </div>
        </div>
      )}

      {/* Pending / Suspended banner */}
      {isPending && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Account pending approval</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Your account is under review. You will receive an email at <strong>{session?.user?.email}</strong> once
              an admin approves your profile. Job creation will be enabled after approval.
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
              Your account has been suspended. Please contact{" "}
              <a href="mailto:support@zobojobs.com" className="underline font-medium">support@zobojobs.com</a>{" "}
              for assistance.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Welcome back, {session?.user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">Here&apos;s what&apos;s happening with your hiring</p>
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

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 xl:gap-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 sm:p-6">
              <div className="mb-2 flex items-center justify-between sm:mb-3">
                <span className="text-xs font-medium text-gray-500 sm:text-sm">{stat.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 sm:text-3xl">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader className="flex flex-col gap-2 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg sm:text-xl">Recent Jobs</CardTitle>
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-sm font-medium text-[#4FD1C7] hover:underline"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {databaseUnreachable ? (
            <div className="px-6 py-12 text-center">
              <Database className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="font-medium text-gray-500">Recent jobs unavailable</p>
              <p className="mb-4 text-sm text-gray-400">Fix the database connection to load your jobs.</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No jobs yet</p>
              <p className="text-gray-400 text-sm mb-4">Create your first job to start interviewing candidates</p>
              {!isBlocked && (
                <Link href="/jobs/new">
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                    Create First Job
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Mobile: stacked rows (no horizontal scroll) */}
              <div className="divide-y divide-gray-100 md:hidden">
                {jobs.map((job) => (
                  <div key={job.id} className="space-y-3 px-4 py-4">
                    <div className="min-w-0">
                      <p className="text-base font-semibold leading-snug text-gray-900">{job.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 gap-y-2">
                        <Badge
                          variant={
                            job.status === "ACTIVE"
                              ? "success"
                              : job.status === "PAUSED"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {job.status.toLowerCase()}
                        </Badge>
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Users className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          {job._count.candidates}{" "}
                          {job._count.candidates === 1 ? "candidate" : "candidates"}
                        </span>
                        <span className="text-sm text-gray-500">
                          Created {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link href={`/jobs/${job.id}`} className="block">
                      <Button size="sm" variant="outline" className="w-full">
                        View job
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>

              {/* md+: table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[36rem]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400 sm:px-6">Job</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400 sm:px-6">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400 sm:px-6">Candidates</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400 sm:px-6">Created</th>
                      <th className="px-4 py-3 sm:px-6" />
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                        <td className="px-4 py-3 sm:px-6 sm:py-4">
                          <p className="max-w-[10rem] truncate text-sm font-semibold text-gray-900 sm:max-w-xs">{job.title}</p>
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4">
                          <Badge variant={job.status === "ACTIVE" ? "success" : job.status === "PAUSED" ? "warning" : "secondary"}>
                            {job.status.toLowerCase()}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 sm:px-6 sm:py-4">{job._count.candidates}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-400 sm:px-6 sm:py-4">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right sm:px-6 sm:py-4">
                          <Link href={`/jobs/${job.id}`}>
                            <Button size="sm" variant="ghost">
                              View →
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
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
