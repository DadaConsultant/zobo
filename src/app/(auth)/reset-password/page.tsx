"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, CheckCircle, ShieldCheck } from "lucide-react";

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

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromUrl = searchParams.get("email") || "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleDigitChange(index: number, value: string) {
    // Only allow single digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newDigits = Array(6).fill("");
    pasted.split("").forEach((d, i) => { newDigits[i] = d; });
    setDigits(newDigits);
    const nextEmpty = Math.min(pasted.length, 5);
    inputRefs.current[nextEmpty]?.focus();
  }

  const otp = digits.join("");
  const otpComplete = otp.length === 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!otpComplete) {
      setError("Please enter all 6 digits of your reset code.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailFromUrl, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">Password updated!</h2>
        <p className="text-sm text-[#6B7280] mb-6">
          Your password has been reset successfully. Redirecting you to sign in…
        </p>
        <Link href="/login">
          <Button className="w-full" size="lg">Go to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email display */}
      {emailFromUrl && (
        <div className="flex items-center gap-2 bg-[#F5F7FA] rounded-lg px-4 py-2.5">
          <ShieldCheck className="w-4 h-4 text-[#4FD1C7] flex-shrink-0" />
          <p className="text-sm text-[#374151] truncate">
            Resetting password for <strong>{emailFromUrl}</strong>
          </p>
        </div>
      )}

      {/* OTP input */}
      <div className="space-y-2">
        <Label>6-digit reset code</Label>
        <p className="text-xs text-[#9CA3AF]">Enter the code we sent to your email</p>
        <div className="flex gap-2 justify-between" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleDigitKeyDown(i, e)}
              className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all
                ${d ? "border-[#0D9488] bg-[#F0FDFB] text-[#1F2937]" : "border-[#E5E7EB] bg-white text-[#1A1A1A]"}
                focus:border-[#4FD1C7] focus:ring-2 focus:ring-[#4FD1C7]/20`}
            />
          ))}
        </div>
      </div>

      {/* New password */}
      <div className="space-y-1.5">
        <Label htmlFor="new-password">New password</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          placeholder="Repeat your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
        )}
        {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
          <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Passwords match
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={loading}
        disabled={!otpComplete || !newPassword || newPassword !== confirmPassword}
      >
        Reset password
      </Button>

      <p className="text-center text-xs text-[#9CA3AF]">
        Code expired?{" "}
        <Link href="/forgot-password" className="text-[#4FD1C7] hover:underline font-medium">
          Request a new one
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4 py-10 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <ZoboMark />
            <span className="text-xl font-bold text-[#1A1A1A]">Zobo Jobs</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Set a new password</h1>
          <p className="text-[#6B7280] mt-1">Enter your reset code and choose a new password</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:p-8">
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-sm text-gray-400">Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>
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
