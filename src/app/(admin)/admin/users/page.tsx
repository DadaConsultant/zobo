import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle, Ban, Clock } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      plan: true,
      status: true,
      createdAt: true,
      _count: { select: { jobs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusStyle: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    PENDING:   { label: "Pending",   className: "bg-amber-100 text-amber-700",     icon: Clock },
    APPROVED:  { label: "Approved",  className: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    SUSPENDED: { label: "Suspended", className: "bg-red-100 text-red-600",         icon: Ban },
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Companies</h1>
        <p className="text-gray-500 mt-1">{users.length} registered {users.length === 1 ? "company" : "companies"}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company / Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Jobs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Registered</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                  No companies registered yet.
                </td>
              </tr>
            ) : users.map((u) => {
              const s = statusStyle[u.status] ?? statusStyle.PENDING;
              const Icon = s.icon;
              return (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{u.company || "—"}</p>
                    <p className="text-xs text-gray-400">{u.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-500 uppercase">{u.plan}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u._count.jobs}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.className}`}>
                      <Icon className="w-3 h-3" />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/users/${u.id}`} className="text-sm text-[#1F2937] font-medium hover:text-[#4FD1C7] transition-colors whitespace-nowrap">
                      View →
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
