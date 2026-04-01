import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { LayoutDashboard, Users, LogOut, ShieldCheck } from "lucide-react";

function ZoboMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="8"  r="4" fill="#FFFFFF" />
      <circle cx="8"  cy="28" r="4" fill="#FFFFFF" />
      <circle cx="32" cy="28" r="4" fill="#FFFFFF" />
      <circle cx="20" cy="20" r="3" fill="#4FD1C7" />
      <line x1="20" y1="12" x2="20" y2="17" stroke="#FFFFFF" strokeWidth="1.5" />
      <line x1="17" y1="22" x2="10" y2="26" stroke="#FFFFFF" strokeWidth="1.5" />
      <line x1="23" y1="22" x2="30" y2="26" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1F2937] flex flex-col h-full">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2.5">
            <ZoboMark />
            <div>
              <span className="text-lg font-bold text-white block">Zobo Jobs</span>
              <span className="text-xs text-[#4FD1C7] font-semibold tracking-wider">ADMIN</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-white/40" />
            Overview
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4 text-white/40" />
            Companies
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#4FD1C7]/20 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#4FD1C7]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.user.name || "Admin"}</p>
              <p className="text-xs text-white/40 truncate">{session.user.email}</p>
            </div>
          </div>
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-white/50 hover:text-red-400 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
