import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, CheckCircle, Shield, Link2,
  FileText, Video, ChevronRight, Play, Lock,
  BarChart3, Award,
} from "lucide-react";
import "./landing-collins.css";
import SavingsCalculator from "@/components/landing/savings-calculator";
import LandingHeader from "@/components/landing/landing-header";
import { MarketingVideoPlayer } from "@/components/landing/marketing-video-player";
import { WHY_TEAMS_CHOOSE_STATS } from "@/lib/why-teams-choose";

export const MARKETING_WIDTH = 1280;
export const MARKETING_HEIGHT = 720;

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
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="8" r="4" fill="#FFFFFF" />
      <circle cx="8" cy="28" r="4" fill="#FFFFFF" />
      <circle cx="32" cy="28" r="4" fill="#FFFFFF" />
      <circle cx="20" cy="20" r="3" fill="#f8f8f7" />
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
      <CheckCircle
        className={`mt-0.5 h-5 w-5 flex-shrink-0 ${dark ? "text-[#f8f8f7]" : "text-[#140700]"}`}
      />
      <span className={`text-[15px] leading-relaxed ${dark ? "text-white/85" : "text-[#5e5855]"}`}>{children}</span>
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
    <div className="landing-collins min-h-screen bg-[#f8f8f7] pt-[4.5rem] text-[#140700] antialiased md:pt-20">
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

      {/* ══════════════════ NAVBAR ══════════════════ */}
      <LandingHeader />

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="bg-[#f8f8f7] px-4 pb-14 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-12 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-[820px]">
          <h1 className="ld-eyebrow mx-auto mb-8 inline-flex max-w-full flex-wrap items-center justify-center gap-2 border border-[#cccccc] bg-white px-4 py-2.5 text-left sm:mb-8 sm:gap-2.5 sm:px-[18px]">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#140700]"
              aria-hidden
            />
            <span className="text-center leading-snug text-[#514c49]">AI Interview Automation — Screen Candidates Automatically</span>
          </h1>

          <h2 className="ld-font-display mb-7 text-[clamp(2rem,6vw,4rem)] sm:mb-8">
            Skip First-Round Interviews.
            <br />
            <span className="text-[#514c49]">Send a Link Instead.</span>
          </h2>

          <p className="ld-body-lg mx-auto mb-10 max-w-[640px] sm:text-[17px]">
            Automatically screen every applicant with AI-powered video interviews — and get a ranked shortlist, full recordings,
            summaries, and scores without doing a single call.
          </p>

          <div className="mb-8 flex flex-col items-stretch justify-center gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
            <Link href="/book-demo" className="ld-btn-primary px-8 py-3.5 text-base no-underline sm:shrink-0">
              Get a Demo
              <ArrowRight size={16} />
            </Link>
            <a href="#demo" className="ld-btn-ghost px-6 py-3.5 text-base no-underline sm:shrink-0">
              <Play size={15} className="text-[#140700]" />
              Watch Sample Interview
            </a>
          </div>

          <p className="text-sm text-[#5e5855]">
            Used by startups and hiring teams to save hours every week. No credit card required.
          </p>
        </div>
      </section>

      {/* ══════════════════ SOCIAL PROOF ══════════════════ */}
      <section className="border-y border-[#cccccc] bg-white px-4 py-8 sm:px-6 sm:py-9">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="ld-eyebrow mb-7 opacity-80 sm:mb-8">Trusted by fast-growing teams</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:gap-x-12">
            {["TechStart", "HireScale", "Foundry", "TalentOps", "SprintHQ"].map((name) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight text-[#cccccc]">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ VALUE PROPOSITION ══════════════════ */}
      <Section className="py-16 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="ld-eyebrow mb-4">Why Zobo Jobs</p>
            <h2 className="ld-font-display mb-5 max-w-xl text-[clamp(1.75rem,3.5vw,2.75rem)]">
              Stop wasting hours on screening calls.
            </h2>
            <p className="ld-body-lg mb-8 max-w-lg">
              Zobo Jobs automates every first-round interview with AI so you can focus on meeting only your best candidates.
            </p>
            <ul className="flex flex-col gap-3.5 [list-style:none] p-0">
              {["No scheduling", "No repetitive calls", "No manual sorting", "No bias-heavy screening"].map((x) => (
                <Check key={x}>{x}</Check>
              ))}
            </ul>
            <p className="ld-body mt-7 max-w-lg text-[#514c49]">
              Just a <strong className="font-medium text-[#140700]">single interview link</strong> and a shortlist that&apos;s ready to act on.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-[#cccccc] bg-white">
              <div className="flex items-center gap-2 bg-[#140700] px-5 py-3.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#cccccc]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#8a8480]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#514c49]" />
                <span className="ml-2 text-xs text-white/50">zobo-interview-session</span>
              </div>
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
          <div className="mb-16 text-center">
            <p className="ld-eyebrow mb-4">Process</p>
            <h2 className="ld-font-display text-[clamp(1.75rem,3.5vw,2.75rem)]">How Zobo AI Interviews Work</h2>
          </div>

          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { step: "01", title: "Create a Job", desc: "Describe your role once. The AI builds your interview for you — questions, scoring rubric, and introduction." },
              { step: "02", title: "Approve Questions", desc: "Review or edit your interview script in seconds before it goes live. No surprises." },
              { step: "03", title: "Share the Link", desc: "Send one link to candidates via email, WhatsApp, or LinkedIn. No scheduling. No calendar coordination." },
              { step: "04", title: "Get Your Shortlist", desc: "Zobo interviews candidates automatically and returns a ranked shortlist with scores, recordings, and AI summaries." },
            ].map((item, i) => (
              <div
                key={item.step}
                className="ld-card-hover relative rounded-2xl border border-[#cccccc] bg-[#f8f8f7] px-7 py-8"
              >
                <div className="ld-eyebrow mb-4 opacity-90">STEP {item.step}</div>
                <h3 className="ld-font-heading mb-3 text-lg">{item.title}</h3>
                <p className="ld-body">{item.desc}</p>
                {i < 3 && (
                  <ChevronRight
                    size={50}
                    color="#cccccc"
                    className="pointer-events-none absolute -right-4 top-1/2 z-[1] hidden -translate-y-1/2 xl:block"
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ DEMO VISUAL ══════════════════ */}
      <section id="demo" className="bg-[#140700] px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="ld-eyebrow mb-4 text-[#f8f8f7]/70">See It In Action</p>
          <h2 className="ld-font-display mb-4 text-[clamp(1.5rem,5vw,2.75rem)] !text-white">
            Automate Every First-Round Interview.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Review only what matters.
          </h2>
          <p className="ld-body-lg mx-auto mb-12 max-w-[560px] !text-[#f8f8f7]/70">
            The AI follows up, stays on script, and evaluates every answer — so you only spend time on the people who actually matter.
          </p>

          <div className="overflow-hidden rounded-2xl border border-[#cccccc] bg-white">
            <div className="flex flex-wrap items-center gap-2 border-b border-[#cccccc] bg-[#f8f8f7] px-3 py-3 sm:flex-nowrap sm:gap-2 sm:px-5">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#cccccc]" />
              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#8a8480]" />
              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#514c49]" />
              <div className="min-w-0 flex-1 rounded-none border border-[#cccccc] bg-white py-1.5 pl-3 pr-2 text-left text-[11px] text-[#5e5855] sm:ml-3 sm:text-xs">
                <span className="block truncate">app.zobojobs.com/interview/junior-engineer-2026</span>
              </div>
            </div>

            <MarketingVideoPlayer />
          </div>

          <p className="ld-body mt-6 !text-[#f8f8f7]/45">AI interviews candidates naturally, follows up, and stays on script.</p>
        </div>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section id="features" className="bg-[#f8f8f7] px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-16 text-center">
            <p className="ld-eyebrow mb-4">Features</p>
            <h2 className="ld-font-display mx-auto max-w-4xl text-[clamp(1.75rem,3.5vw,2.75rem)]">
              Demo Interview
           </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#cccccc]">
           <div
                 className="w-full bg-[#140700]"
                 style={{
                   width: "100%",
                   aspectRatio: `${MARKETING_WIDTH} / ${MARKETING_HEIGHT}`,
                 }}
               >
                  <video 
                      src="https://zobo.s3.eu-west-2.amazonaws.com/demo_2_zobojobs.mp4" 
                      playsInline
                      loop 
                      className="w-full h-full object-cover" 
                      preload="auto"
                      controls
                      controlsList="nodownload"
                    />
               </div>
           
          </div>
        </div>
      </section>

      {/* ══════════════════ STATS ══════════════════ */}
      <section className="bg-[#140700] px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-14 text-center">
            <h2 className="ld-font-display text-[clamp(1.625rem,3vw,2.375rem)] !text-white">Why Teams Choose Zobo Jobs</h2>
          </div>
          <div className="grid grid-cols-1 divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {WHY_TEAMS_CHOOSE_STATS.map((s) => (
              <div key={s.label} className="px-6 py-10 text-center md:px-9 md:py-11">
                <div className="ld-font-display mb-2 text-5xl leading-none tracking-tighter !text-[#f8f8f7] md:text-[56px]">
                  {s.value}
                </div>
                <div className="mb-3 text-base font-medium text-white">{s.label}</div>
                <div className="ld-body mx-auto max-w-[220px] !text-[#f8f8f7]/50">{s.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ SAVINGS CALCULATOR ══════════════════ */}
      <SavingsCalculator />

      {/* ══════════════════ SEO: WHAT IS AN AI INTERVIEW TOOL ══════════════════ */}
      <section className="border-t border-[#cccccc] bg-[#f8f8f7] px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[860px]">
          <p className="ld-eyebrow mb-4">Explainer</p>
          <h2 className="ld-font-display mb-5 text-[clamp(1.625rem,3vw,2.375rem)]">What Is an AI Interview Tool?</h2>
          <p className="ld-body-lg mb-4 !text-[#514c49]">
            An AI interview tool automates the first stage of your hiring process by replacing manual phone screens and video
            calls with structured, AI-led conversations. Instead of a recruiter scheduling and conducting every first-round
            interview, the AI handles it — asking role-specific questions, following up naturally, recording the session, and
            evaluating each candidate against a consistent scoring rubric.
          </p>
          <p className="ld-body-lg !text-[#514c49]">
            With Zobo Jobs, you define the job once. The AI generates a tailored interview script, conducts video interviews at
            any time of day, and returns a ranked shortlist — complete with scores, transcripts, recordings, and AI-generated
            summaries. You only meet the candidates worth your time.
          </p>
        </div>
      </section>

      {/* ══════════════════ SEO: BENEFITS ══════════════════ */}
      <section className="border-t border-[#cccccc] bg-white px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-14 text-center">
            <p className="ld-eyebrow mb-4">Why It Works</p>
            <h2 className="ld-font-display text-[clamp(1.625rem,3vw,2.375rem)]">Benefits of Automated Screening Interviews</h2>
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
              <div
                key={b.num}
                className="ld-card-hover rounded-2xl border border-[#cccccc] bg-[#f8f8f7] p-7"
              >
                <div className="ld-eyebrow mb-3 text-[#514c49]">{b.num}</div>
                <h3 className="ld-font-heading mb-2.5 text-base">{b.title}</h3>
                <p className="ld-body">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ SEO: COMPARISON (cards on mobile, grid on md+) ══════════════════ */}
      <section className="border-t border-[#cccccc] bg-[#f8f8f7] px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[860px]">
          <div className="mb-8 text-center sm:mb-10 md:mb-12">
            <p className="ld-eyebrow mb-3 sm:mb-4">Comparison</p>
            <h2 className="ld-font-display text-balance text-[clamp(1.35rem,3.5vw,2.375rem)]">
              AI Interviews vs Traditional Screening Calls
            </h2>
          </div>

          <div className="flex flex-col gap-3 md:hidden" role="list">
            {COMPARISON_ROWS.map((row) => (
              <div key={row.criteria} role="listitem" className="rounded-2xl border border-[#cccccc] bg-white p-4">
                <p className="mb-3 text-[15px] font-semibold leading-snug text-[#140700]">{row.criteria}</p>
                <dl className="space-y-2">
                  <div className="flex items-start justify-between gap-3 border border-[#140700] bg-white px-3 py-2.5">
                    <dt className="ld-eyebrow !text-[11px] text-[#140700]">Zobo Jobs AI</dt>
                    <dd className="text-right text-sm font-semibold text-[#140700]">{row.zobo}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3 border border-[#cccccc] bg-[#f8f8f7] px-3 py-2.5">
                    <dt className="ld-eyebrow !text-[11px] text-[#5e5855]">Traditional</dt>
                    <dd className="text-right text-sm font-medium text-[#5e5855]">{row.trad}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div
            className="hidden overflow-hidden rounded-2xl border border-[#cccccc] bg-white md:block"
            role="region"
            aria-label="Comparison of AI interviews and traditional screening"
          >
            <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] bg-[#140700]">
              <div className="px-5 py-4 text-[13px] font-bold uppercase tracking-wide text-white/50 lg:px-6">Criteria</div>
              <div className="px-4 py-4 text-center text-[13px] font-bold uppercase tracking-wide text-[#f8f8f7] lg:px-6">
                Zobo Jobs AI
              </div>
              <div className="px-4 py-4 text-center text-[13px] font-bold uppercase tracking-wide text-white/50 lg:px-6">
                Traditional Calls
              </div>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.criteria}
                className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] border-t border-[#f8f8f7]"
                style={{ background: i % 2 === 0 ? "#FFFFFF" : "#fafaf9" }}
              >
                <div className="px-5 py-3.5 text-sm font-medium text-[#514c49] lg:px-6 lg:py-3.5">{row.criteria}</div>
                <div className="px-4 py-3.5 text-center text-sm font-semibold text-[#140700] lg:px-6">{row.zobo}</div>
                <div className="px-4 py-3.5 text-center text-sm text-[#5e5855] lg:px-6">{row.trad}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ SECURITY ══════════════════ */}
      <section id="security" className="border-t border-[#cccccc] bg-[#f8f8f7] px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[900px]">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#140700]">
                <Lock size={24} className="text-[#f8f8f7]" />
              </div>
              <p className="ld-eyebrow mb-4">Security & Trust</p>
              <h2 className="ld-font-display mb-4 text-[clamp(1.625rem,3vw,2.375rem)]">Privacy &amp; Security</h2>
              <p className="ld-body mb-8 max-w-md">
                Zobo Jobs is built with enterprise security from day one so your candidates&apos; data and your business data are
                always protected.
              </p>
              <a
                href="#costcalculator"
                className="ld-body inline-flex items-center gap-1.5 font-medium text-[#140700] no-underline underline-offset-4 hover:underline"
              >
                Learn more → Security Documentation
              </a>
            </div>
            <ul className="flex flex-col gap-[18px] [list-style:none] p-0">
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
      <section className="bg-[#140700] px-4 py-16 text-center sm:px-6 md:py-24">
        <div className="mx-auto max-w-[640px]">
          <div className="mb-8 flex justify-center">
            <ZoboMarkWhite size={52} />
          </div>
          <h2 className="ld-font-display mb-5 text-[clamp(1.875rem,4vw,3rem)] !text-white">Book a Demo</h2>
          <p className="ld-font-heading mb-5 text-[clamp(1.125rem,2.5vw,1.625rem)] !font-normal !text-[#f8f8f7]/75">
            Ready to stop doing screening calls?
          </p>
          <p className="ld-body-lg mb-10 !text-[#f8f8f7]/65">
            Book a 10-minute demo and see how Zobo Jobs automates every first-round interview — so you only spend time on
            candidates worth meeting.
          </p>
          <Link href="/book-demo" className="ld-btn-invert px-8 py-4 text-base no-underline sm:text-[17px]">
            Schedule a demo
            <ArrowRight size={18} />
          </Link>
          <p className="ld-body mt-4 !text-[#f8f8f7]/40">No credit card. No commitments.</p>
        </div>
      </section>

      <footer className="bg-[#140700] px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-6 text-center md:flex-row md:flex-wrap md:items-center md:justify-between md:text-left">
          <div className="flex items-center gap-2.5">
            <ZoboMarkWhite size={28} />
            <span className="ld-font-heading text-lg !text-white">Zobo Jobs</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end" aria-label="Footer">
            {[
              { label: "Cost Calculator", href: "#costcalculator" },
              { label: "Security", href: "#security" },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Contact", href: "mailto:support@zobojobs.com" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="ld-footer-link text-sm text-[#b8b3b0] no-underline transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
          <p className="max-w-md text-balance text-[13px] leading-snug text-[#8a8480] md:max-w-none md:basis-full lg:basis-auto lg:text-right">
            © 2026 Zobo Jobs — AI Interview Infrastructure.{" "}
            <a href="https://safeburse.com" className="text-[#f8f8f7]/90 underline-offset-2 hover:underline">
              Powered by Safeburse Limited
            </a>{" "}
            .{" "}
            <a href="https://zobojobs.com" className="text-[#f8f8f7]/90 underline-offset-2 hover:underline">
              Zobo
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
