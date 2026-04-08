"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SidebarNavBody, type SidebarNavBodyProps } from "@/components/dashboard/sidebar";

type DashboardShellProps = SidebarNavBodyProps & {
  children: React.ReactNode;
};

export default function DashboardShell({ user, role, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden h-full w-64 shrink-0 flex-col bg-[#1F2937] md:flex">
        <SidebarNavBody user={user} role={role} />
      </aside>

      {/* Mobile drawer + backdrop */}
      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            id="dashboard-mobile-drawer"
            className="fixed inset-y-0 left-0 z-50 flex h-full w-[min(18rem,88vw)] flex-col bg-[#1F2937] shadow-xl md:hidden"
            aria-modal="true"
            role="dialog"
            aria-label="Main navigation"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-sm font-semibold text-white">Menu</span>
              <button
                type="button"
                className="rounded-lg p-2 text-white/80 hover:bg-white/10"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNavBody user={user} role={role} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 md:hidden">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50"
            aria-expanded={mobileOpen}
            aria-controls="dashboard-mobile-drawer"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="min-w-0 truncate text-base font-bold text-gray-900">
            Zobo Jobs
          </Link>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
