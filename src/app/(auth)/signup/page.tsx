"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
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
            <span className="text-xl font-bold text-[#1A1A1A]">Zobo Jobs</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Create your account</h1>
          <p className="text-[#6B7280] mt-1">Start screening candidates with AI</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Jane Smith" value={form.name} onChange={update("name")} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="Acme Inc." value={form.company} onChange={update("company")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" value={form.email} onChange={update("email")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={update("password")} required minLength={6} />
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
            <p className="text-xs text-[#9CA3AF] text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#4FD1C7] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
