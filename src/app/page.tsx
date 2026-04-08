import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, CheckCircle, Shield, Link2,
  FileText, Video, ChevronRight, Play, Lock, Zap,
  Users, BarChart3, Award,
} from "lucide-react";
import SavingsCalculator from "@/components/landing/savings-calculator";
import LandingHeader from "@/components/landing/landing-header";

export const metadata: Metadata = {
  title: "AI Interview Automation Tool | Screen Candidates Automatically | Zobo Jobs",
  description:
    "Automate every first-round interview with AI video interviews. Send candidates a link, get a ranked shortlist with scores, recordings, and summaries—no screening calls.",
  keywords: [
    "AI interview automation",
    "AI interview tool",
    "automated screening interviews",
    "candidate scoring software",
    "AI-driven candidate assessments",
    "video interview automation",
    "screen candidates automatically",
    "shortlist candidates automatically",
    "interview automation software",
  ],
  openGraph: {
    title: "AI Interview Automation Tool | Screen Candidates Automatically",
    description:
      "Automate every first-round interview with AI video interviews. Get a ranked shortlist with scores, recordings, and summaries—no screening calls.",
    url: "https://zobojobs.com",
    siteName: "Zobo Jobs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Interview Automation Tool | Zobo Jobs",
    description:
      "Send candidates a link. Get a ranked shortlist with scores, recordings, and AI summaries. No screening calls needed.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://zobojobs.com" },
};

/* ─── Brand mark ──────────────────────────────────────── */
function ZoboMarkWhite({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
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

/* ─── Reusable check-list item ────────────────────────── */
function Check({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${dark ? "text-[#4FD1C7]" : "text-[#0D9488]"}`} />
      <span className={`text-[15px] leading-relaxed ${dark ? "text-white/80" : "text-[#374151]"}`}>{children}</span>
    </li>
  );
}

/* ─── Section wrapper ─────────────────────────────────── */
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`px-4 sm:px-6 md:px-12 lg:px-24 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

const COMPARISON_ROWS = [
  { criteria: "Time per candidate", zobo: "0 minutes", trad: "20–45 minutes" },
  { criteria: "Scheduling required", zobo: "Never", trad: "Always" },
  { criteria: "Available 24/7", zobo: "✓ Yes", trad: "✗ No" },
  { criteria: "Consistent scoring", zobo: "✓ Always", trad: "✗ Varies by interviewer" },
  { criteria: "Recorded session", zobo: "✓ Full video", trad: "✗ Rarely" },
  { criteria: "AI-generated summary", zobo: "✓ Every interview", trad: "✗ Manual notes only" },
  { criteria: "Scales to 1,000+ candidates", zobo: "✓ Instantly", trad: "✗ Needs more headcount" },
  { criteria: "Setup time", zobo: "3 minutes", trad: "Hours of coordination" },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Zobo Jobs",
            applicationCategory: "BusinessApplication",
            description:
              "AI interview automation platform. Automate every first-round interview with AI video interviews and get a ranked shortlist with scores, recordings, and summaries.",
            url: "https://zobojobs.com",
            offers: {
              "@type": "Offer",
              price: "99",
              priceCurrency: "USD",
              description: "Starting at $99/month for 100 AI interviews",
            },
            featureList: [
              "AI video interview automation",
              "Candidate scoring and ranking",
              "Interview recordings and transcripts",
              "AI-generated candidate summaries",
              "One shareable interview link",
            ],
          }),
        }}
      />
      <style>{`
        .nav-link:hover   { color: #1A1A1A !important; }
        .demo-btn:hover   { background: #374151 !important; }
        .signin-btn:hover { color: #1A1A1A !important; }
        .ghost-btn:hover  { background: rgba(255,255,255,0.12) !important; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important; }
        .use-case:hover   { border-color: #1F2937 !important; }
        .footer-link:hover { color: #FFFFFF !important; }
      `}</style>

      {/* ══════════════════ NAVBAR ══════════════════ */}
      <LandingHeader />

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="bg-[#F5F7FA] px-4 pb-14 pt-12 text-center sm:px-6 sm:pb-16 sm:pt-16 md:pb-20 md:pt-24">
        <div className="mx-auto max-w-[820px]">
          {/* H1 — primary SEO heading, styled as eyebrow badge */}
          <h1 className="mx-auto mb-8 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-left text-xs font-bold text-[#374151] shadow-sm sm:mb-8 sm:gap-2.5 sm:px-[18px] sm:text-[13px]" style={{ letterSpacing: "0.3px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4FD1C7", display: "inline-block", flexShrink: 0 }} />
            <span className="text-center leading-snug">AI Interview Automation — Screen Candidates Automatically</span>
          </h1>

          {/* H2 — visual hero headline */}
          <h2 style={{ fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.08, letterSpacing: "-2px", marginBottom: 28 }}>
            Skip First-Round Interviews.<br />
            <span style={{ color: "#4FD1C7" }}>Send a Link Instead.</span>
          </h2>

          {/* Sub */}
          <p className="mx-auto mb-10 max-w-[640px] text-base text-[#6B7280] sm:text-lg md:text-[19px]" style={{ lineHeight: 1.65 }}>
            Automatically screen every applicant with AI-powered video interviews — and get a ranked shortlist, full recordings, summaries, and scores without doing a single call.
          </p>

          {/* CTAs */}
          <div className="mb-8 flex flex-col items-stretch justify-center gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
            <Link href="/book-demo" className="demo-btn inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#1F2937] px-7 py-3.5 text-base font-semibold text-white no-underline transition-colors sm:inline-flex sm:shrink-0">
              Get a Demo
              <ArrowRight size={16} />
            </Link>
            {/* <a href="#demo" className="ghost-btn inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-6 py-3.5 text-base font-medium text-[#374151] no-underline transition-colors sm:inline-flex sm:shrink-0">
              <Play size={15} fill="#374151" />
              Watch Sample Interview
            </a> */}
          </div>

          {/* Trust line */}
          <p style={{ fontSize: 14, color: "#9CA3AF" }}>
            Used by startups and hiring teams to save hours every week. No credit card required.
          </p>
        </div>
      </section>

      {/* ══════════════════ SOCIAL PROOF ══════════════════ */}
      <section className="border-y border-[#E5E7EB] bg-white px-4 py-8 sm:px-6 sm:py-9">
        <div className="mx-auto max-w-[900px] text-center">
          <p style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 28 }}>
            Trusted by fast-growing teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:gap-x-12">
            {["TechStart", "HireScale", "Foundry", "TalentOps", "SprintHQ"].map((name) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* <div style={{ width: 28, height: 28, background: "#F5F7FA", borderRadius: 6, border: "1px solid #E5E7EB" }} /> */}
                <span style={{ fontSize: 16, fontWeight: 700, color: "#D1D5DB", letterSpacing: "-0.3px" }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ VALUE PROPOSITION ══════════════════ */}
      <Section className="py-16 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 16 }}>Why Zobo Jobs</p>
            <h2 style={{ fontSize: "clamp(30px, 3.5vw, 44px)", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 20 }}>
              Stop wasting hours on screening calls.
            </h2>
            <p style={{ fontSize: 17, color: "#6B7280", lineHeight: 1.7, marginBottom: 32 }}>
              Zobo Jobs automates every first-round interview with AI so you can focus on meeting only your best candidates.
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {["No scheduling", "No repetitive calls", "No manual sorting", "No bias-heavy screening"].map((x) => (
                <Check key={x}>{x}</Check>
              ))}
            </ul>
            <p style={{ fontSize: 16, color: "#374151", marginTop: 28, lineHeight: 1.6 }}>
              Just a <strong>single interview link</strong> and a shortlist that's ready to act on.
            </p>
          </div>

          {/* Visual */}
          <div style={{ position: "relative" }}>
            <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E5E7EB", boxShadow: "0 8px 32px rgba(0,0,0,0.10)", overflow: "hidden" }}>
              {/* Header bar */}
              <div style={{ background: "#1F2937", padding: "14px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>zobo-interview-session</span>
              </div>
              {/* Content */}
              <div className="relative aspect-[10/10] w-full">
                <Image
                  src="/ai_zobo_get_ready.webp"
                  alt="Zobo Jobs Get Ready Screen"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 900px) 100vw, 900px"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section id="how-it-works" className="bg-white px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 16 }}>Process</p>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, color: "#1A1A1A", letterSpacing: "-1px" }}>
              How Zobo AI Interviews Work
            </h2>
          </div>

          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { step: "01", title: "Create a Job", desc: "Describe your role once. The AI builds your interview for you — questions, scoring rubric, and introduction." },
              { step: "02", title: "Approve Questions", desc: "Review or edit your interview script in seconds before it goes live. No surprises." },
              { step: "03", title: "Share the Link", desc: "Send one link to candidates via email, WhatsApp, or LinkedIn. No scheduling. No calendar coordination." },
              { step: "04", title: "Get Your Shortlist", desc: "Zobo interviews candidates automatically and returns a ranked shortlist with scores, recordings, and AI summaries." },
            ].map((item, i) => (
              <div key={item.step} className="card-hover relative" style={{ background: "#F5F7FA", borderRadius: 16, padding: "32px 28px", transition: "transform 150ms, box-shadow 150ms" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", letterSpacing: "0.5px", marginBottom: 16 }}>STEP {item.step}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", marginBottom: 12 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>{item.desc}</p>
                {i < 3 && (
                  <ChevronRight size={50} color="#D1D5DB" className="pointer-events-none absolute -right-4 top-1/2 z-[1] hidden -translate-y-1/2 xl:block" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ DEMO VISUAL ══════════════════ */}
      <section id="demo" className="bg-[#1F2937] px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[900px] text-center">
          <p style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 16 }}>See It In Action</p>
            <h2 className="mb-4 text-[clamp(1.5rem,5vw,2.75rem)] font-bold leading-tight tracking-tight text-white">
            Automate Every First-Round Interview.<br className="hidden sm:block" /><span className="sm:hidden"> </span>Review only what matters.
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, maxWidth: 560, margin: "0 auto 48px" }}>
            The AI follows up, stays on script, and evaluates every answer — so you only spend time on the people who actually matter.
          </p>

          {/* Mock UI */}
          <div style={{ background: "#FFFFFF", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
            {/* Browser chrome */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] bg-[#F5F7FA] px-3 py-3 sm:flex-nowrap sm:gap-2 sm:px-5">
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
              <div className="min-w-0 flex-1 rounded-md border border-[#E5E7EB] bg-white py-1.5 pl-3 pr-2 text-left text-[11px] text-[#9CA3AF] sm:ml-3 sm:text-xs">
                <span className="block truncate">app.zobojobs.com/interview/junior-engineer-2026</span>
              </div>
            </div>

            {/* Interview UI */}
            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/ai_interviewer_zobo.webp"
                alt="Zobo Jobs Demo Visual"
                fill
                className="object-cover object-top"
                sizes="(max-width: 900px) 100vw, 900px"
                priority
              />
            </div>
          </div>

          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 24 }}>
            AI interviews candidates naturally, follows up, and stays on script.
          </p>
        </div>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section id="features" className="bg-[#F5F7FA] px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 16 }}>Features</p>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, color: "#1A1A1A", letterSpacing: "-1px" }}>
              Smart Candidate Scoring & Instant AI-Generated Shortlists
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                icon: <Video size={22} color="#1F2937" />,
                title: "Automate Every First-Round Interview",
                desc: "AI conducts structured video interviews with natural conversation and real follow-up questions.",
                bullets: ["10–15 minute sessions", "Follows up dynamically", "Handles off-script responses"],
              },
              {
                icon: <BarChart3 size={22} color="#1F2937" />,
                title: "Smart Candidate Scoring",
                desc: "Every candidate evaluated on four dimensions — completely standardised. Zero inconsistent notes.",
                bullets: ["Technical knowledge", "Communication & confidence", "Experience & role fit"],
              },
              {
                icon: <Award size={22} color="#1F2937" />,
                title: "Instant Shortlists",
                desc: "Top candidates surfaced automatically so you never dig through resumes or spreadsheets again.",
                bullets: ["Ranked by overall score", "AI recommendation flag", "One-click profile view"],
              },
              {
                icon: <FileText size={22} color="#1F2937" />,
                title: "Full Transparency",
                desc: "Every interview comes with complete data you can share with hiring managers.",
                bullets: ["Video recording", "Full transcript", "AI-generated summary"],
              },
              {
                icon: <Link2 size={22} color="#1F2937" />,
                title: "One Shareable Link",
                desc: "No accounts required for candidates. No friction. Higher completion rates.",
                bullets: ["Share via email, LinkedIn, or WhatsApp", "Unique per job", "Instant access"],
              },
              {
                icon: <Shield size={22} color="#1F2937" />,
                title: "Enterprise-Grade Guardrails",
                desc: "AI stays on topic, detects off-script responses, and handles interruptions gracefully.",
                bullets: ["Secure & compliant", "No hallucinations", "GDPR-ready"],
              },
            ].map((f) => (
              <div key={f.title} className="card-hover" style={{ background: "#FFFFFF", borderRadius: 16, padding: 32, border: "1px solid #E5E7EB", transition: "transform 150ms, box-shadow 150ms" }}>
                <div style={{ width: 44, height: 44, background: "#F5F7FA", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, border: "1px solid #E5E7EB" }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A1A", marginBottom: 10, lineHeight: 1.35 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.65, marginBottom: 16 }}>{f.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {f.bullets.map((b) => (
                    <li key={b} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4FD1C7", flexShrink: 0 }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ STATS ══════════════════ */}
      <section className="bg-[#1F2937] px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1000px]">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.8px" }}>
              Why Teams Choose Zobo Jobs
            </h2>
          </div>
          <div className="grid grid-cols-1 divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {[
              { value: "10x", label: "Faster screening", detail: "Replace hours of manual interviews with automated AI-led conversations." },
              { value: "1400+", label: "Interview conducted", detail: "We have an AI that have conducted 1400+ minutes of interviews, and we are still improving it." },
              { value: "3 minutes", label: "To set up", detail: "Create your interview in under three minutes — no training needed." },
            ].map((s) => (
              <div key={s.label} className="px-6 py-10 text-center md:px-9 md:py-11">
                <div style={{ fontSize: 56, fontWeight: 800, color: "#4FD1C7", lineHeight: 1, marginBottom: 8, letterSpacing: "-2px" }}>{s.value}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#FFFFFF", marginBottom: 12 }}>{s.label}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 220, margin: "0 auto" }}>{s.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ SAVINGS CALCULATOR ══════════════════ */}
      <SavingsCalculator />

      {/* ══════════════════ SEO: WHAT IS AN AI INTERVIEW TOOL ══════════════════ */}
      <section className="border-t border-[#E5E7EB] bg-[#F5F7FA] px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[860px]">
          <p style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 16 }}>Explainer</p>
          <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.8px", marginBottom: 20 }}>
            What Is an AI Interview Tool?
          </h2>
          <p style={{ fontSize: 17, color: "#374151", lineHeight: 1.8, marginBottom: 16 }}>
            An AI interview tool automates the first stage of your hiring process by replacing manual phone screens and video calls with structured, AI-led conversations. Instead of a recruiter scheduling and conducting every first-round interview, the AI handles it — asking role-specific questions, following up naturally, recording the session, and evaluating each candidate against a consistent scoring rubric.
          </p>
          <p style={{ fontSize: 17, color: "#374151", lineHeight: 1.8 }}>
            With Zobo Jobs, you define the job once. The AI generates a tailored interview script, conducts video interviews at any time of day, and returns a ranked shortlist — complete with scores, transcripts, recordings, and AI-generated summaries. You only meet the candidates worth your time.
          </p>
        </div>
      </section>

      {/* ══════════════════ SEO: BENEFITS ══════════════════ */}
      <section className="border-t border-[#E5E7EB] bg-white px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1100px]">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 16 }}>Why It Works</p>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.8px" }}>
              Benefits of Automated Screening Interviews
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              { num: "01", title: "Eliminate scheduling friction", desc: "Candidates complete interviews on their own time — no back-and-forth, no calendar coordination, no no-shows." },
              { num: "02", title: "Standardise every assessment", desc: "Every candidate answers the same questions in the same format, removing inconsistency and unconscious bias from early-stage screening." },
              { num: "03", title: "Scale without headcount", desc: "Interview 10 or 1,000 candidates with the same effort. Automated screening means you can grow your pipeline without growing your team." },
              { num: "04", title: "Make data-driven hiring decisions", desc: "Replace gut-feel with structured scores, transcripts, and AI-generated summaries you can share with any stakeholder." },
              { num: "05", title: "Reduce time-to-hire", desc: "Stop spending weeks on first-round calls. Move your best candidates to the next stage in hours instead of days." },
              { num: "06", title: "Improve candidate experience", desc: "Candidates get a consistent, professional, and pressure-free interview experience — available 24/7 from any device." },
            ].map((b) => (
              <div key={b.num} className="card-hover" style={{ background: "#F5F7FA", borderRadius: 16, padding: 28, border: "1px solid #E5E7EB", transition: "transform 150ms, box-shadow 150ms" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", marginBottom: 12 }}>{b.num}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginBottom: 10 }}>{b.title}</h3>
                <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ SEO: COMPARISON (cards on mobile, grid on md+) ══════════════════ */}
      <section className="border-t border-[#E5E7EB] bg-[#F5F7FA] px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[860px]">
          <div className="mb-8 text-center sm:mb-10 md:mb-12">
            <p className="mb-3 text-[13px] font-bold uppercase tracking-widest text-[#4FD1C7] sm:mb-4">
              Comparison
            </p>
            <h2 className="text-balance text-[clamp(1.35rem,3.5vw,2.375rem)] font-bold tracking-tight text-[#1A1A1A]">
              AI Interviews vs Traditional Screening Calls
            </h2>
          </div>

          {/* Mobile: stacked criterion cards (no horizontal table scroll) */}
          <div className="flex flex-col gap-3 md:hidden" role="list">
            {COMPARISON_ROWS.map((row) => (
              <div
                key={row.criteria}
                role="listitem"
                className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <p className="mb-3 text-[15px] font-semibold leading-snug text-[#1A1A1A]">{row.criteria}</p>
                <dl className="space-y-2">
                  <div className="flex items-start justify-between gap-3 rounded-xl bg-[#F0FDFA] px-3 py-2.5">
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-[#0D9488]">Zobo Jobs AI</dt>
                    <dd className="text-right text-sm font-semibold text-[#0F766E]">{row.zobo}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3 rounded-xl bg-[#F9FAFB] px-3 py-2.5">
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-[#6B7280]">Traditional</dt>
                    <dd className="text-right text-sm font-medium text-[#9CA3AF]">{row.trad}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          {/* md+: same 3-column layout as before, semantic div grid (not <table>) */}
          <div
            className="hidden overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:block"
            role="region"
            aria-label="Comparison of AI interviews and traditional screening"
          >
            <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] bg-[#1F2937]">
              <div className="px-5 py-4 text-[13px] font-bold uppercase tracking-wide text-white/50 lg:px-6">
                Criteria
              </div>
              <div className="px-4 py-4 text-center text-[13px] font-bold uppercase tracking-wide text-[#4FD1C7] lg:px-6">
                Zobo Jobs AI
              </div>
              <div className="px-4 py-4 text-center text-[13px] font-bold uppercase tracking-wide text-white/50 lg:px-6">
                Traditional Calls
              </div>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.criteria}
                className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] border-t border-[#F5F7FA]"
                style={{ background: i % 2 === 0 ? "#FFFFFF" : "#FAFAFA" }}
              >
                <div className="px-5 py-3.5 text-sm font-medium text-[#374151] lg:px-6 lg:py-3.5">{row.criteria}</div>
                <div className="px-4 py-3.5 text-center text-sm font-semibold text-[#0D9488] lg:px-6">{row.zobo}</div>
                <div className="px-4 py-3.5 text-center text-sm text-[#9CA3AF] lg:px-6">{row.trad}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ SECURITY ══════════════════ */}
      <section id="security" className="border-t border-[#E5E7EB] bg-[#F5F7FA] px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[900px]">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <div style={{ width: 52, height: 52, background: "#1F2937", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <Lock size={24} color="#4FD1C7" />
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 16 }}>Security & Trust</p>
              <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.8px", marginBottom: 16 }}>
                Privacy &amp; Security
              </h2>
              <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.7, marginBottom: 32 }}>
                Zobo Jobs is built with enterprise security from day one so your candidates' data and your business data are always protected.
              </p>
              <a href="#costcalculator" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 600, color: "#1F2937", textDecoration: "none" }}>
                Learn more → Security Documentation
              </a>
            </div>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                "Encrypted video & transcript storage",
                "Secure cloud infrastructure",
                "Role-based access controls",
                "GDPR-ready data handling",
                "AI guardrails to prevent hallucinations",
                "Candidate data never used for training",
              ].map((item) => (
                <Check key={item}>{item}</Check>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══════════════════ PRICING ══════════════════ */}
      {/* <section id="pricing" style={{ background: "#FFFFFF", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 16 }}>Pricing</p>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, color: "#1A1A1A", letterSpacing: "-1px" }}>
              Simple pricing. Pay for interviews, not seats.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { name: "Starter", price: "$99", period: "/mo", detail: "100 interviews / month", features: ["AI video interviews", "Candidate scoring", "Email invites", "Basic dashboard", "1 resend per candidate"], highlight: false },
              { name: "Growth", price: "$299", period: "/mo", detail: "500 interviews / month", features: ["Everything in Starter", "Question review & editing", "Automated reminders", "Priority support", "Ranked shortlist", "CSV export"], highlight: true },
              { name: "Enterprise", price: "Custom", period: "", detail: "Unlimited interviews", features: ["Everything in Growth", "Custom integrations", "Dedicated CSM", "SLA guarantee", "Custom AI training", "SSO & SCIM"], highlight: false },
            ].map((plan) => (
              <div key={plan.name} style={{
                background: plan.highlight ? "#1F2937" : "#FFFFFF",
                borderRadius: 20,
                border: plan.highlight ? "none" : "1px solid #E5E7EB",
                boxShadow: plan.highlight ? "0 12px 40px rgba(31,41,55,0.25)" : "0 4px 24px rgba(0,0,0,0.06)",
                padding: "40px 36px",
                transform: plan.highlight ? "scale(1.04)" : "none",
              }}>
                {plan.highlight && (
                  <div style={{ background: "#4FD1C7", color: "#1F2937", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 50, display: "inline-block", marginBottom: 20, letterSpacing: "0.5px" }}>
                    MOST POPULAR
                  </div>
                )}
                <h3 style={{ fontSize: 20, fontWeight: 700, color: plan.highlight ? "#FFFFFF" : "#1A1A1A", marginBottom: 8 }}>{plan.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 44, fontWeight: 800, color: plan.highlight ? "#FFFFFF" : "#1A1A1A", letterSpacing: "-1px" }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 15, color: plan.highlight ? "rgba(255,255,255,0.5)" : "#9CA3AF" }}>{plan.period}</span>}
                </div>
                <p style={{ fontSize: 14, color: plan.highlight ? "rgba(255,255,255,0.5)" : "#9CA3AF", marginBottom: 28 }}>{plan.detail}</p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 32, display: "flex", flexDirection: "column", gap: 12 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: plan.highlight ? "rgba(255,255,255,0.8)" : "#374151" }}>
                      <CheckCircle size={15} color={plan.highlight ? "#4FD1C7" : "#0D9488"} style={{ flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" style={{
                  display: "block", textAlign: "center",
                  background: plan.highlight ? "#4FD1C7" : "#1F2937",
                  color: plan.highlight ? "#1F2937" : "#FFFFFF",
                  fontSize: 15, fontWeight: 600, padding: "14px 24px",
                  borderRadius: 10, textDecoration: "none",
                }}>
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ══════════════════ FINAL CTA ══════════════════ */}
      <section className="bg-[#1F2937] px-4 py-16 text-center sm:px-6 md:py-24">
        <div className="mx-auto max-w-[640px]">
          <div style={{ width: 52, height: 52, margin: "0 auto 32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ZoboMarkWhite size={52} />
          </div>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15, letterSpacing: "-1.2px", marginBottom: 20 }}>
            Book a Demo
          </h2>
          <p style={{ fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 400, color: "rgba(255,255,255,0.7)", lineHeight: 1.3, marginBottom: 20 }}>
            Ready to stop doing screening calls?
          </p>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, marginBottom: 40 }}>
            Book a 10-minute demo and see how Zobo Jobs automates every first-round interview — so you only spend time on candidates worth meeting.
          </p>
          <Link href="/book-demo" className="demo-btn inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#4FD1C7] px-8 py-4 text-base font-bold text-[#1F2937] no-underline transition-colors sm:text-[17px]">
            Schedule a demo
            <ArrowRight size={18} />
          </Link>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 16 }}>
            No credit card. No commitments.
          </p>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="bg-[#111827] px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-6 text-center md:flex-row md:flex-wrap md:items-center md:justify-between md:text-left">
          <div className="flex items-center gap-2.5">
            <ZoboMarkWhite size={28} />
            <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>Zobo Jobs</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end" aria-label="Footer">
            {[
              { label: "Cost Calculator",     href: "#costcalculator" },
              { label: "Security", href: "#security" },
              { label: "Privacy",  href: "/privacy" },
              { label: "Terms",    href: "/terms" },
              { label: "Contact",  href: "mailto:support@zobojobs.com" },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="footer-link"
                style={{ fontSize: 14, color: "#6B7280", textDecoration: "none", transition: "color 150ms" }}>
                {label}
              </a>
            ))}
          </nav>
          <p className="max-w-md text-balance text-[13px] leading-snug text-[#4B5563] md:max-w-none md:basis-full lg:basis-auto lg:text-right">© 2026 Zobo Jobs — AI Interview Infrastructure.<a href="https://safeburse.com" style={{ color: "#4FD1C7", textDecoration: "none" }}> Powered by Safeburse Limited</a> . <a href="https://zobojobs.com" style={{ color: "#4FD1C7", textDecoration: "none" }}>Zobo</a>.</p>
        </div>
      </footer>
    </div>
  );
}
