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
    <section id={id} style={{ marginBottom: 56, scrollMarginTop: 100 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", minWidth: 28 }}>{num}</span>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.4px", margin: 0 }}>
          {title}
        </h2>
      </div>
      <div style={{ paddingLeft: 40 }}>{children}</div>
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
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="8"  r="4" fill="#1A1A1A" />
              <circle cx="8"  cy="28" r="4" fill="#1A1A1A" />
              <circle cx="32" cy="28" r="4" fill="#1A1A1A" />
              <circle cx="20" cy="20" r="3" fill="#4FD1C7" />
              <line x1="20" y1="12" x2="20" y2="17" stroke="#1A1A1A" strokeWidth="1.5" />
              <line x1="17" y1="22" x2="10" y2="26" stroke="#1A1A1A" strokeWidth="1.5" />
              <line x1="23" y1="22" x2="30" y2="26" stroke="#1A1A1A" strokeWidth="1.5" />
            </svg>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.3px" }}>Zobo Jobs</span>
          </Link>
          <Link href="/" className="back-link" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, color: "#6B7280", textDecoration: "none", transition: "color 150ms" }}>
            <ArrowLeft size={15} />
            Back to Home
          </Link>
        </div>
      </header>

      {/* ── Hero strip ── */}
      <div style={{ background: "#1F2937", padding: "56px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
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
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 64, alignItems: "start" }}>

        {/* Table of contents */}
        <aside style={{ position: "sticky", top: 92 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 16 }}>Contents</p>
          <nav style={{ display: "flex", flexDirection: "column" }}>
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
          <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E5E7EB", padding: "28px 32px", marginBottom: 48, boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
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
      <footer style={{ background: "#111827", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ZoboMarkWhite size={24} />
            <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 16 }}>Zobo Jobs</span>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
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
          </div>
          <p style={{ fontSize: 13, color: "#4B5563" }}>© 2026 Zobo Jobs — AI Interview Infrastructure.</p>
        </div>
      </footer>
    </div>
  );
}
