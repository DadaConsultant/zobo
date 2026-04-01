"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

function ZoboMark() {
  return (
    <div className="w-9 h-9 bg-[#1F2937] rounded-xl flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="8"  r="4" fill="#fff" />
        <circle cx="8"  cy="28" r="4" fill="#fff" />
        <circle cx="32" cy="28" r="4" fill="#fff" />
        <circle cx="20" cy="20" r="3" fill="#4FD1C7" />
        <line x1="20" y1="12" x2="20" y2="17" stroke="#fff" strokeWidth="1.5" />
        <line x1="17" y1="22" x2="10" y2="26" stroke="#fff" strokeWidth="1.5" />
        <line x1="23" y1="22" x2="30" y2="26" stroke="#fff" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <ZoboMark />
            <span className="text-xl font-bold text-[#1A1A1A]">Zobo Jobs</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Forgot your password?</h1>
          <p className="text-[#6B7280] mt-1">
            {sent ? "Check your inbox" : "Enter your email and we'll send you a reset code"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">Code sent!</h2>
              <p className="text-sm text-[#6B7280] mb-2">
                We sent a 6-digit reset code to
              </p>
              <p className="text-sm font-semibold text-[#1A1A1A] mb-6">{email}</p>
              <p className="text-xs text-[#9CA3AF] mb-6">
                Click the link in the email to go directly to the reset page, or check your spam folder if you don&apos;t see it within a minute.
              </p>
              <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
                <Button className="w-full" size="lg">
                  Enter reset code →
                </Button>
              </Link>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-4 text-sm text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Send reset code
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[#6B7280] hover:text-[#1A1A1A] transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
