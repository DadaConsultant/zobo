import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Briefcase, Calendar, Mail, Building2, CreditCard } from "lucide-react";
import Link from "next/link";
import AdminStatusButtons from "@/components/admin/status-buttons";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      plan: true,
      status: true,
      createdAt: true,
      jobs: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          _count: { select: { candidates: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) notFound();

  const statusStyle: Record<string, { label: string; dot: string }> = {
    PENDING:   { label: "Pending Approval", dot: "bg-amber-400" },
    APPROVED:  { label: "Approved",         dot: "bg-emerald-400" },
    SUSPENDED: { label: "Suspended",        dot: "bg-red-400" },
  };

  const s = statusStyle[user.status] ?? statusStyle.PENDING;

  return (
    <div className="p-8 max-w-4xl">
      {/* Back */}
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to companies
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#1F2937]/10 rounded-xl flex items-center justify-center text-[#1F2937] font-bold text-xl">
              {(user.company || user.name || "?")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.company || user.name || "Unnamed Company"}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-sm text-gray-500">{s.label}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <AdminStatusButtons userId={user.id} currentStatus={user.status as "PENDING" | "APPROVED" | "SUSPENDED"} />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Account Details</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Company</p>
                <p className="text-sm font-medium text-gray-900">{user.company || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Plan</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{user.plan.toLowerCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Registered</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Activity</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Jobs Created</p>
              <p className="text-2xl font-bold text-gray-900">{user.jobs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs table */}
      {user.jobs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Jobs Posted</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Candidates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {user.jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{job.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      job.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" :
                      job.status === "PAUSED" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {job.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{job._count.candidates}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
