"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { isConsumerEmailDomain, WORK_EMAIL_REQUIRED_MESSAGE } from "@/lib/work-email";

const COMPANY_SIZES = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1,000 employees" },
  { value: "1000+", label: "1,000+ employees" },
] as const;

export default function BookDemoPage() {
  const formOpenedAtRef = useRef(Date.now());

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    companySize: "",
    jobTitle: "",
    email: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const emailTrim = form.email.trim();
    if (isConsumerEmailDomain(emailTrim)) {
      setError(WORK_EMAIL_REQUIRED_MESSAGE);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/demo-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim() || undefined,
        companyName: form.companyName.trim(),
        companySize: form.companySize,
        jobTitle: form.jobTitle.trim(),
        email: emailTrim,
        companyWebsiteExtra: honeypot,
        formOpenedAt: formOpenedAtRef.current,
      }),
    });

    const data = await res.json().catch(() => ({}));

    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Something went wrong");
      return;
    }

    setDone(true);
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1F2937] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-[#1F2937] rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none" aria-hidden>
                <circle cx="20" cy="8" r="4" fill="#fff" />
                <circle cx="8" cy="28" r="4" fill="#fff" />
                <circle cx="32" cy="28" r="4" fill="#fff" />
                <circle cx="20" cy="20" r="3" fill="#4FD1C7" />
                <line x1="20" y1="12" x2="20" y2="17" stroke="#fff" strokeWidth="1.5" />
                <line x1="17" y1="22" x2="10" y2="26" stroke="#fff" strokeWidth="1.5" />
                <line x1="23" y1="22" x2="30" y2="26" stroke="#fff" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#1A1A1A]">Zobo Jobs</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Book a demo</h1>
          <p className="text-[#6B7280] mt-1">
            Tell us about you and we&apos;ll be in touch shortly.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:p-8">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle className="w-14 h-14 text-[#0D9488] mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">Request received</h2>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
                Thanks — our team will review your details and get in touch soon.
              </p>
              <Link
                href="/"
                className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
              >
                Return home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 relative">
              {/* Honeypot: hidden from users; bots often fill "website" fields */}
              <div
                className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden opacity-0"
                aria-hidden="true"
              >
                <label htmlFor="companyWebsiteExtra">Company website</label>
                <input
                  type="text"
                  id="companyWebsiteExtra"
                  name="companyWebsiteExtra"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="companyName">
                  Company name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  name="organization"
                  autoComplete="organization"
                  placeholder="Acme Inc."
                  value={form.companyName}
                  onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="companySize">
                  Company size <span className="text-red-500">*</span>
                </Label>
                <select
                  id="companySize"
                  name="companySize"
                  required
                  value={form.companySize}
                  onChange={(e) => setForm((f) => ({ ...f, companySize: e.target.value }))}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                >
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jobTitle">
                  Your job title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  autoComplete="organization-title"
                  placeholder="Head of Talent"
                  value={form.jobTitle}
                  onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Work email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
                <p className="text-xs text-[#6B7280] leading-snug">
                  Use your company email. Personal addresses (Gmail, Hotmail, Outlook, Yahoo, etc.) are not accepted.
                </p>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Request demo
              </Button>

              <p className="text-xs text-center text-[#9CA3AF]">
                Prefer to sign up yourself?{" "}
                <Link href="/signup" className="text-[#0D9488] font-medium hover:underline">
                  Create an account
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
