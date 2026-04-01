import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Clock, CheckCircle, Ban, ArrowRight } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const [pending, approved, suspended, total] = await Promise.all([
    prisma.user.count({ where: { role: "USER", status: "PENDING" } }),
    prisma.user.count({ where: { role: "USER", status: "APPROVED" } }),
    prisma.user.count({ where: { role: "USER", status: "SUSPENDED" } }),
    prisma.user.count({ where: { role: "USER" } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    where: { role: "USER" },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const stats = [
    { label: "Total Companies",    value: total,     icon: Users,         color: "text-[#1F2937]",  bg: "bg-[#1F2937]/10" },
    { label: "Pending Approval",   value: pending,   icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50"     },
    { label: "Approved",           value: approved,  icon: CheckCircle,   color: "text-emerald-600",bg: "bg-emerald-50"   },
    { label: "Suspended",          value: suspended, icon: Ban,           color: "text-red-500",    bg: "bg-red-50"       },
  ];

  const statusStyle: Record<string, { label: string; className: string }> = {
    PENDING:   { label: "Pending",   className: "bg-amber-100 text-amber-700" },
    APPROVED:  { label: "Approved",  className: "bg-emerald-100 text-emerald-700" },
    SUSPENDED: { label: "Suspended", className: "bg-red-100 text-red-600" },
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 mt-1">Manage company accounts and approvals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{s.label}</span>
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent registrations */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="text-base font-semibold text-gray-900">Recent Registrations</h2>
          <Link href="/admin/users" className="text-sm text-[#4FD1C7] font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Registered</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((u) => {
              const s = statusStyle[u.status] ?? statusStyle.PENDING;
              return (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{u.company || u.name || "—"}</p>
                    <p className="text-xs text-gray-400">{u.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.className}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/users/${u.id}`} className="text-sm text-[#1F2937] font-medium hover:text-[#4FD1C7] transition-colors">
                      Review →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
