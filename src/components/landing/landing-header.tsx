"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

/** Z mark — COLLINS landing (Deep Onyx / steel) */
function ZoboMarkWhite({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="8" r="4" fill="#140700" />
      <circle cx="8" cy="28" r="4" fill="#140700" />
      <circle cx="32" cy="28" r="4" fill="#140700" />
      <circle cx="20" cy="20" r="3" fill="#514c49" />
      <line x1="20" y1="12" x2="20" y2="17" stroke="#140700" strokeWidth="1.5" />
      <line x1="17" y1="22" x2="10" y2="26" stroke="#140700" strokeWidth="1.5" />
      <line x1="23" y1="22" x2="30" y2="26" stroke="#140700" strokeWidth="1.5" />
    </svg>
  );
}

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navItems = [
    { label: "How it works", href: "#how-it-works" },
    { label: "See it in action", href: "#features" },
    { label: "Cost Calculator", href: "#costcalculator" },
    { label: "Security", href: "#security" },
    { label: "Contact", href: "mailto:support@zobojobs.com" },
  ];

  return (
    <header
      className={`landing-collins fixed left-0 right-0 top-0 z-50 transition-[background-color,border-color] duration-200 ${
        scrolled
          ? "border-b border-[#cccccc] bg-[#f8f8f7]/95 backdrop-blur-md"
          : "border-b border-transparent bg-[#f8f8f7]/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <ZoboMarkWhite  />
          <span className="ld-font-display text-lg font-normal tracking-tight text-[#140700] md:text-xl">
            Zobo
          </span>
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="ld-body text-[#5e5855] transition-colors ld-nav-link hover:bg-transparent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-3">
          <Link href="/login" className="ld-btn-ghost px-5 py-2.5 text-sm">
            Sign in
          </Link>
          <Link href="/signup" className="ld-btn-primary px-5 py-2.5 text-sm">
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-none p-2 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="h-6 w-6 text-[#140700]" />
          ) : (
            <Menu className="h-6 w-6 text-[#140700]" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#cccccc] bg-[#f8f8f7] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="ld-body rounded-none px-2 py-3 text-[#140700]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-[#cccccc] pt-4">
              <Link
                href="/login"
                className="ld-btn-ghost w-full justify-center py-3 text-center"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="ld-btn-primary w-full justify-center py-3 text-center"
                onClick={() => setMobileOpen(false)}
              >
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
