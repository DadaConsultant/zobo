"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Briefcase, LogOut, ShieldCheck } from "lucide-react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  role?: string | null;
}

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

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/jobs",      label: "Jobs",     icon: Briefcase },
];

export default function Sidebar({ user, role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1F2937] flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <ZoboMark />
          <span className="text-lg font-bold text-white">Zobo Jobs</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("w-4 h-4", active ? "text-[#4FD1C7]" : "text-white/40")} />
              {label}
            </Link>
          );
        })}

        {role === "ADMIN" && (
          <>
            <div className="pt-3 pb-1 px-3">
              <span className="text-xs font-bold text-white/25 uppercase tracking-widest">Admin</span>
            </div>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <ShieldCheck className={cn("w-4 h-4", pathname.startsWith("/admin") ? "text-[#4FD1C7]" : "text-white/40")} />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-[#4FD1C7] font-semibold text-sm">
            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name || "Recruiter"}</p>
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-red-400 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-white/5"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
