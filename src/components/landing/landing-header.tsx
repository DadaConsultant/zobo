"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

function ZoboMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="8" r="4" fill="#1A1A1A" />
      <circle cx="8" cy="28" r="4" fill="#1A1A1A" />
      <circle cx="32" cy="28" r="4" fill="#1A1A1A" />
      <circle cx="20" cy="20" r="3" fill="#4FD1C7" />
      <line x1="20" y1="12" x2="20" y2="17" stroke="#1A1A1A" strokeWidth="1.5" />
      <line x1="17" y1="22" x2="10" y2="26" stroke="#1A1A1A" strokeWidth="1.5" />
      <line x1="23" y1="22" x2="30" y2="26" stroke="#1A1A1A" strokeWidth="1.5" />
    </svg>
  );
}

const NAV_LINKS = [
  ["#how-it-works", "How it Works"],
  ["#features", "Features"],
  ["#costcalculator", "Cost Calculator"],
  ["#security", "Security"],
] as const;

export default function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-[#F5F7FA]/92 backdrop-blur-md"
      style={{ WebkitBackdropFilter: "blur(12px)" }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 no-underline">
          <ZoboMark size={32} />
          <span className="truncate text-lg font-bold tracking-tight text-[#1A1A1A] sm:text-xl">
            Zobo Jobs
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex lg:gap-9" aria-label="Primary">
          {NAV_LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="nav-link text-[15px] font-medium text-[#6B7280] no-underline transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="signin-btn text-[15px] font-medium text-[#6B7280] no-underline transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/book-demo"
            className="demo-btn rounded-lg bg-[#1F2937] px-5 py-2.5 text-[15px] font-semibold text-white no-underline transition-colors"
          >
            Get a Demo
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#1A1A1A] lg:hidden"
          aria-expanded={open}
          aria-controls="landing-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        id="landing-mobile-nav"
        className={cn(
          "border-t border-[#E5E7EB] bg-[#F5F7FA] px-4 py-4 lg:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile">
          {NAV_LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-lg px-3 py-3 text-[15px] font-medium text-[#374151] no-underline active:bg-white/80"
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <hr className="my-2 border-[#E5E7EB]" />
          <Link
            href="/login"
            className="signin-btn rounded-lg px-3 py-3 text-[15px] font-medium text-[#6B7280] no-underline"
            onClick={() => setOpen(false)}
          >
            Sign In
          </Link>
          <Link
            href="/book-demo"
            className="demo-btn mt-1 rounded-lg bg-[#1F2937] px-3 py-3 text-center text-[15px] font-semibold text-white no-underline"
            onClick={() => setOpen(false)}
          >
            Get a Demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
