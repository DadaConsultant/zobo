import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, CheckCircle, TrendingUp, Plus, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [jobs, totalCandidates, completedInterviews] = await Promise.all([
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

  const completionRate =
    totalCandidates > 0 ? Math.round((completedInterviews / totalCandidates) * 100) : 0;

  const stats = [
    { label: "Active Jobs",       value: jobs.filter((j) => j.status === "ACTIVE").length, icon: Briefcase,   color: "text-[#1F2937]",  bg: "bg-[#1F2937]/10" },
    { label: "Total Candidates",  value: totalCandidates,                                  icon: Users,        color: "text-[#0D9488]",  bg: "bg-[#4FD1C7]/15" },
    { label: "Interviews Done",   value: completedInterviews,                              icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-50"     },
    { label: "Completion Rate",   value: `${completionRate}%`,                             icon: TrendingUp,   color: "text-[#1F2937]",  bg: "bg-[#1F2937]/10" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your hiring</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="w-4 h-4" />
            Create Job
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Jobs</CardTitle>
          <Link href="/jobs" className="text-sm text-[#4FD1C7] font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No jobs yet</p>
              <p className="text-gray-400 text-sm mb-4">Create your first job to start interviewing candidates</p>
              <Link href="/jobs/new">
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                  Create First Job
                </Button>
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Job</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Candidates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={job.status === "ACTIVE" ? "success" : job.status === "PAUSED" ? "warning" : "secondary"}>
                        {job.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{job._count.candidates}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/jobs/${job.id}`}>
                        <Button size="sm" variant="ghost">View →</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
