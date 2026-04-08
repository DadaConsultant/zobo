"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Briefcase, LogOut, ShieldCheck } from "lucide-react";

interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface SidebarNavBodyProps {
  user: SidebarUser;
  role?: string | null;
  /** Called when a nav link is activated (e.g. close mobile drawer). */
  onNavigate?: () => void;
}

function ZoboMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="8" r="4" fill="#FFFFFF" />
      <circle cx="8" cy="28" r="4" fill="#FFFFFF" />
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
  { href: "/jobs", label: "Jobs", icon: Briefcase },
];

/**
 * Shared sidebar chrome: logo, nav, user — used on desktop aside and mobile drawer.
 */
export function SidebarNavBody({ user, role, onNavigate }: SidebarNavBodyProps) {
  const pathname = usePathname();

  return (
    <>
      <div className="border-b border-white/10 p-5 sm:p-6">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onNavigate}>
          <ZoboMark />
          <span className="text-lg font-bold text-white">Zobo Jobs</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 sm:p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[#4FD1C7]" : "text-white/40")} />
              {label}
            </Link>
          );
        })}

        {role === "ADMIN" && (
          <>
            <div className="px-3 pb-1 pt-3">
              <span className="text-xs font-bold uppercase tracking-widest text-white/25">Admin</span>
            </div>
            <Link
              href="/admin"
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <ShieldCheck
                className={cn(
                  "h-4 w-4 shrink-0",
                  pathname.startsWith("/admin") ? "text-[#4FD1C7]" : "text-white/40"
                )}
              />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      <div className="border-t border-white/10 p-3 sm:p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-[#4FD1C7]">
            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user.name || "Recruiter"}</p>
            <p className="truncate text-xs text-white/40">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            void signOut({ callbackUrl: "/login" });
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );
}

