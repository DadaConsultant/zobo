import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use | Zobo Jobs",
  description:
    "Read the Zobo Jobs Terms of Use. Understand your rights and responsibilities when using our AI-powered interview automation platform.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "23 March 2026";

function ZoboMarkWhite({ size = 28 }: { size?: number }) {
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

/* ── Section anchor helper ───────────────────────────── */
function Section({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-24 md:mb-14">
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <span style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", minWidth: 28 }}>{num}</span>
        <h2 className="min-w-0 text-lg font-bold tracking-tight text-[#1A1A1A] sm:text-[22px]" style={{ margin: 0 }}>
          {title}
        </h2>
      </div>
      <div className="pl-0 sm:pl-8 md:pl-10">{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.8, marginBottom: 16 }}>{children}</p>
  );
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item) => (
        <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 16, color: "#374151", lineHeight: 1.7 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4FD1C7", flexShrink: 0, marginTop: 9 }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

const TOC = [
  { num: "1", title: "Eligibility",                  id: "eligibility" },
  { num: "2", title: "The Service",                   id: "service" },
  { num: "3", title: "User Accounts",                 id: "accounts" },
  { num: "4", title: "Acceptable Use",                id: "acceptable-use" },
  { num: "5", title: "Candidate Data & Responsibilities", id: "candidate-data" },
  { num: "6", title: "AI-Generated Content & Disclaimer", id: "ai-disclaimer" },
  { num: "7", title: "Payments",                      id: "payments" },
  { num: "8", title: "Intellectual Property",         id: "ip" },
  { num: "9", title: "Data Processing & Retention",   id: "data-retention" },
  { num: "10", title: "Third-Party Services",          id: "third-party" },
  { num: "11", title: "Service Availability",          id: "availability" },
  { num: "12", title: "Limitation of Liability",       id: "liability" },
  { num: "13", title: "Termination",                   id: "termination" },
  { num: "14", title: "Governing Law",                 id: "governing-law" },
  { num: "15", title: "Contact",                       id: "contact" },
];

export default function TermsPage() {
  return (
    <div style={{ background: "#F5F7FA", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        .toc-link       { color: #6B7280; text-decoration: none; font-size: 14px; line-height: 1.8; transition: color 150ms; }
        .toc-link:hover { color: #1A1A1A; }
        .back-link:hover { color: #1A1A1A !important; }
        .footer-link:hover { color: #FFFFFF !important; }
      `}</style>

      {/* ── Navbar ── */}
      <header style={{ background: "rgba(245,247,250,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2 no-underline">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="8"  r="4" fill="#1A1A1A" />
              <circle cx="8"  cy="28" r="4" fill="#1A1A1A" />
              <circle cx="32" cy="28" r="4" fill="#1A1A1A" />
              <circle cx="20" cy="20" r="3" fill="#4FD1C7" />
              <line x1="20" y1="12" x2="20" y2="17" stroke="#1A1A1A" strokeWidth="1.5" />
              <line x1="17" y1="22" x2="10" y2="26" stroke="#1A1A1A" strokeWidth="1.5" />
              <line x1="23" y1="22" x2="30" y2="26" stroke="#1A1A1A" strokeWidth="1.5" />
            </svg>
            <span className="truncate text-base font-bold tracking-tight text-[#1A1A1A] sm:text-lg" style={{ letterSpacing: "-0.3px" }}>Zobo Jobs</span>
          </Link>
          <Link href="/" className="back-link inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[#6B7280] no-underline transition-colors sm:gap-2">
            <ArrowLeft size={15} className="shrink-0" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      {/* ── Hero strip ── */}
      <div className="bg-[#1F2937] px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-[860px]">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: "rgba(79,209,199,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={20} color="#4FD1C7" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", letterSpacing: "1.5px", textTransform: "uppercase" }}>Legal</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-1px", marginBottom: 12 }}>
            Terms of Use
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>
            Last updated: {LAST_UPDATED} &nbsp;·&nbsp; Governed by the laws of England and Wales
          </p>
        </div>
      </div>

      {/* ── Main layout: TOC sidebar + content ── */}
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,240px)_1fr] lg:gap-16 lg:px-6 lg:py-16">

        {/* Table of contents */}
        <aside className="lg:sticky lg:top-[92px]">
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 16 }}>Contents</p>
          <nav className="flex max-h-56 flex-col overflow-y-auto pr-1 lg:max-h-none">
            {TOC.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="toc-link" style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "4px 0", borderLeft: "2px solid #E5E7EB", paddingLeft: 12 }}>
                <span style={{ fontSize: 12, color: "#9CA3AF", minWidth: 20, fontWeight: 600 }}>{item.num}</span>
                {item.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main>
          {/* Intro */}
          <div className="mb-10 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.05)] sm:mb-12 sm:p-7 md:p-8">
            <P>
              Welcome to Zobo Jobs ("Zobo", "we", "our", or "us"). These Terms of Use ("Terms") govern your access to and use of the Zobo Jobs platform, website, mobile interfaces, APIs, and AI-powered interviewing tools (collectively, the "Service").
            </P>
            <P>
              By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
            </P>
          </div>

          {/* Sections */}
          <Section id="eligibility" num="1" title="Eligibility">
            <P>You must:</P>
            <Ul items={[
              "Be at least 18 years old",
              "Have the authority to bind a company if using Zobo on behalf of an organisation",
            ]} />
          </Section>

          <Section id="service" num="2" title="The Service">
            <P>Zobo Jobs provides an AI interview automation platform that enables you to:</P>
            <Ul items={[
              "Create job listings and interview scripts",
              "Send interview links to candidates",
              "Collect video and audio responses",
              "Receive AI-generated rankings, summaries, transcripts, and scores",
            ]} />
            <P>We may update, improve, or change features at any time.</P>
          </Section>

          <Section id="accounts" num="3" title="User Accounts">
            <P>You are responsible for:</P>
            <Ul items={[
              "Maintaining the confidentiality of your login credentials",
              "Ensuring that your use complies with all UK laws and GDPR obligations",
              "All activity under your account",
            ]} />
            <P>We may suspend or terminate accounts for policy violations.</P>
          </Section>

          <Section id="acceptable-use" num="4" title="Acceptable Use">
            <P>You must not:</P>
            <Ul items={[
              "Misuse the platform or interfere with its operation",
              "Upload unlawful, discriminatory, or harmful content",
              "Use the Service to violate employment laws",
              "Use automated scraping or reverse engineering",
              "Attempt to bypass interview processes for fraudulent purposes",
            ]} />
            <P>We reserve the right to remove content or restrict access if needed.</P>
          </Section>

          <Section id="candidate-data" num="5" title="Candidate Data & Responsibilities">
            <P>You represent and warrant that:</P>
            <Ul items={[
              "You have obtained all necessary permissions to invite candidates",
              "You will use candidate data only for legitimate hiring purposes",
              "You will comply with GDPR as a data controller",
            ]} />
            <P>Zobo Jobs acts as a data processor for candidate information and processes it strictly under your instructions.</P>
          </Section>

          <Section id="ai-disclaimer" num="6" title="AI-Generated Content & Disclaimer">
            <P>Zobo Jobs uses third-party AI models, including but not limited to:</P>
            <Ul items={["OpenAI", "Eleven Labs", "Other LLM APIs"]} />
            <P>AI outputs may:</P>
            <Ul items={[
              "Contain inaccuracies",
              "Require human review",
              "Not be used as the sole basis for hiring decisions",
            ]} />
            <P>You agree to use human judgment in evaluating candidates.</P>
            <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: "#92400E", lineHeight: 1.7, margin: 0 }}>
                <strong>Disclaimer:</strong> We disclaim all liability for hiring decisions made using AI-generated content.
              </p>
            </div>
          </Section>

          <Section id="payments" num="7" title="Payments">
            <P>Payments made through the Service are processed by Stripe. By using the Service, you agree to Stripe's terms and conditions.</P>
            <P>We do not store or process your credit card details.</P>
          </Section>

          <Section id="ip" num="8" title="Intellectual Property">
            <P>All software, interfaces, designs, trademarks, AI models, and documentation belong to Zobo Jobs or its licensors.</P>
            <P>You may not copy, modify, distribute, or create derivative works from the Service.</P>
          </Section>

          <Section id="data-retention" num="9" title="Data Processing & Retention">
            <P>Video, audio, transcripts, summaries, and scoring data may be processed for the purpose of:</P>
            <Ul items={[
              "Completing interviews",
              "Generating insights for employers",
              "Improving the Service (only if consent is provided)",
            ]} />
            <P><strong>Retention:</strong></P>
            <Ul items={[
              "Candidate interview data is stored only as long as necessary to provide the Service",
              "Employers may request deletion at any time",
            ]} />
          </Section>

          <Section id="third-party" num="10" title="Third-Party Services">
            <P>Zobo integrates with:</P>
            <Ul items={[
              "OpenAI / LLM APIs (for scoring and summaries)",
              "Eleven Labs (optional text-to-speech)",
              "Stripe (payments)",
              "Cloud hosting providers (AWS / GCP / Azure)",
            ]} />
            <P>These providers may process data on our behalf in accordance with GDPR-compliant agreements.</P>
          </Section>

          <Section id="availability" num="11" title="Service Availability">
            <P>We aim for high availability but provide no guarantee of:</P>
            <Ul items={[
              "Uninterrupted uptime",
              "Error-free performance",
              "Availability during maintenance",
            ]} />
          </Section>

          <Section id="liability" num="12" title="Limitation of Liability">
            <P>To the fullest extent permitted by UK law:</P>
            <Ul items={[
              "Zobo Jobs is not liable for indirect, incidental, or consequential damages",
              "Zobo Jobs is not responsible for employment decisions",
              "Zobo Jobs' total liability shall not exceed the amount paid to us in the last 12 months",
            ]} />
            <P>Nothing excludes liability where prohibited by law.</P>
          </Section>

          <Section id="termination" num="13" title="Termination">
            <P>You may terminate your account at any time. We may suspend or terminate your access if you violate these Terms.</P>
            <P>Upon termination:</P>
            <Ul items={[
              "Access to your account and interview data may be removed",
              "Legal and data processing obligations continue as required",
            ]} />
          </Section>

          <Section id="governing-law" num="14" title="Governing Law">
            <P>These Terms are governed by the laws of England and Wales. Disputes will be handled by the courts of England and Wales.</P>
          </Section>

          <Section id="contact" num="15" title="Contact">
            <P>For any questions about these Terms:</P>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 10, padding: "12px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <Shield size={16} color="#4FD1C7" />
              <a href="mailto:support@zobojobs.com" style={{ fontSize: 15, fontWeight: 600, color: "#1F2937", textDecoration: "none" }}>
                support@zobojobs.com
              </a>
            </div>
          </Section>
        </main>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] bg-[#111827] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-5 text-center sm:flex-row sm:flex-wrap sm:justify-between sm:text-left">
          <div className="flex items-center gap-2.5">
            <ZoboMarkWhite size={24} />
            <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 16 }}>Zobo Jobs</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-end" aria-label="Footer">
            {[
              { label: "Cost Calculator",     href: "#costcalculator" },
              { label: "Security", href: "#" },
              { label: "Privacy",  href: "/privacy" },
              { label: "Terms",    href: "/terms" },
              { label: "Contact",  href: "mailto:support@zobojobs.com" },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="footer-link"
                style={{ fontSize: 14, color: label === "Terms" ? "#4FD1C7" : "#6B7280", textDecoration: "none", transition: "color 150ms", fontWeight: label === "Terms" ? 600 : 400 }}>
                {label}
              </a>
            ))}
          </nav>
          <p className="w-full text-balance text-center text-[13px] text-[#4B5563] sm:w-auto sm:text-left">© 2026 Zobo Jobs — AI Interview Infrastructure.</p>
        </div>
      </footer>
    </div>
  );
}
