import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Zobo Jobs",
  description:
    "Read the Zobo Jobs Privacy Policy. Learn how we collect, use, store, and protect your personal data in compliance with UK GDPR.",
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

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 15, fontWeight: 700, color: "#1F2937", marginBottom: 8, marginTop: 20 }}>{children}</p>
  );
}

const TOC = [
  { num: "1",  title: "Data We Collect",                  id: "data-collected" },
  { num: "2",  title: "How We Use the Data",              id: "data-use" },
  { num: "3",  title: "Legal Basis for Processing",       id: "legal-basis" },
  { num: "4",  title: "Third-Party Data Processors",      id: "third-party" },
  { num: "5",  title: "Data Retention",                   id: "retention" },
  { num: "6",  title: "Data Rights (UK GDPR)",            id: "data-rights" },
  { num: "7",  title: "Security",                         id: "security" },
  { num: "8",  title: "Cross-Border Transfers",           id: "cross-border" },
  { num: "9",  title: "Cookies",                          id: "cookies" },
  { num: "10", title: "Changes to This Policy",           id: "changes" },
  { num: "11", title: "Contact Us",                       id: "contact" },
];

export default function PrivacyPage() {
  return (
    <div style={{ background: "#F5F7FA", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        .toc-link       { color: #6B7280; text-decoration: none; font-size: 14px; line-height: 1.8; transition: color 150ms; }
        .toc-link:hover { color: #1A1A1A; }
        .back-link:hover { color: #1A1A1A !important; }
        .footer-link:hover { color: #FFFFFF !important; }
        .email-link { color: #0D9488; text-decoration: none; font-weight: 600; }
        .email-link:hover { text-decoration: underline; }
      `}</style>

      {/* Navbar */}
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

      {/* Hero strip */}
      <div style={{ background: "#1F2937", padding: "56px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: "rgba(79,209,199,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={20} color="#4FD1C7" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", letterSpacing: "1.5px", textTransform: "uppercase" }}>Legal</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-1px", marginBottom: 12 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>
            Last updated: {LAST_UPDATED} &nbsp;·&nbsp; UK + GDPR-Compliant
          </p>
        </div>
      </div>

      {/* Main layout: TOC sidebar + content */}
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
              This Privacy Policy explains how Zobo Jobs ("Zobo", "we", "our") collects, uses, stores, and protects personal data when you use our AI-driven interview automation platform.
            </P>
            <P>We act as:</P>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "8px 16px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "#166534" }}>Data Processor</span>
                <span style={{ fontSize: 14, color: "#374151" }}>for candidate data</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "8px 16px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1D4ED8" }}>Data Controller</span>
                <span style={{ fontSize: 14, color: "#374151" }}>for employer account information</span>
              </div>
            </div>
          </div>

          {/* Sections */}
          <Section id="data-collected" num="1" title="Data We Collect">
            <SubHeading>1.1 Candidate Data</SubHeading>
            <Ul items={[
              "Video recordings",
              "Audio recordings",
              "Interview transcripts",
              "AI-generated summaries",
              "Scoring and ranking information",
              "Interview answers",
              "Name and email (if provided by the employer)",
            ]} />
            <SubHeading>1.2 Employer / Recruiter Data</SubHeading>
            <Ul items={[
              "Name, email, and company information",
              "Job descriptions and interview scripts",
              "Billing and subscription data (via Stripe)",
            ]} />
            <SubHeading>1.3 Technical Data</SubHeading>
            <Ul items={[
              "IP address",
              "Device info",
              "User activity logs",
              "Cookies / analytics (if enabled)",
            ]} />
          </Section>

          <Section id="data-use" num="2" title="How We Use the Data">
            <P>Candidate Data is used to:</P>
            <Ul items={[
              "Conduct AI-driven interviews",
              "Score, rank, and summarise responses",
              "Provide insights to employers",
            ]} />
            <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: "#92400E", lineHeight: 1.7, margin: 0 }}>
                <strong>We do NOT:</strong> use candidate data for marketing, sell data, or train AI models unless explicit consent is obtained.
              </p>
            </div>
            <P>Employer Data is used to:</P>
            <Ul items={[
              "Create and maintain accounts",
              "Send notifications",
              "Process payments",
              "Deliver analytics and interview results",
            ]} />
          </Section>

          <Section id="legal-basis" num="3" title="Legal Basis for Processing (GDPR)">
            <P>We process data under the following legal bases:</P>
            <Ul items={[
              "Contractual necessity — providing the Service",
              "Legitimate interests — security, fraud prevention",
              "Consent — when required, e.g. AI training opt-in",
            ]} />
          </Section>

          <Section id="third-party" num="4" title="Third-Party Data Processors">
            <P>We use GDPR-compliant subprocessors, including:</P>
            <SubHeading>AI Providers</SubHeading>
            <Ul items={[
              "OpenAI (LLM processing)",
              "Eleven Labs (speech synthesis)",
            ]} />
            <SubHeading>Payments</SubHeading>
            <Ul items={["Stripe (PCI-DSS compliant)"]} />
            <SubHeading>Hosting</SubHeading>
            <Ul items={["AWS / GCP / Azure (UK/EU data centres where possible)"]} />
            <P>We ensure all processors sign Data Processing Agreements (DPAs).</P>
          </Section>

          <Section id="retention" num="5" title="Data Retention">
            <Ul items={[
              "Interview data is kept only as long as necessary for hiring evaluations",
              "Employers may delete candidate data at any time from their dashboard",
              "We delete data within 90 days of account termination unless required legally",
            ]} />
          </Section>

          <Section id="data-rights" num="6" title="Data Rights (UK GDPR)">
            <P>Candidates and users have the right to:</P>
            <Ul items={[
              "Access their data",
              "Rectify inaccurate information",
              `Request deletion ("right to be forgotten")`,
              "Restrict processing",
              "Object to automated decision making",
              "Request data portability",
            ]} />
            <P>To exercise any of these rights, contact us at:</P>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 10, padding: "12px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 16 }}>
              <Lock size={16} color="#4FD1C7" />
              <a href="mailto:support@zobojobs.com" className="email-link">
                support@zobojobs.com
              </a>
            </div>
            <P>We will respond within 30 days.</P>
          </Section>

          <Section id="security" num="7" title="Security">
            <P>We implement:</P>
            <Ul items={[
              "Encrypted data storage",
              "HTTPS for all data transfer",
              "Access control and audit logging",
              "Regular penetration testing",
              "ISO-aligned best practices",
            ]} />
          </Section>

          <Section id="cross-border" num="8" title="Cross-Border Transfers">
            <P>Data may be processed outside the UK/EU only when:</P>
            <Ul items={[
              "Appropriate safeguards (Standard Contractual Clauses) are in place",
              "Processors meet GDPR equivalency standards",
            ]} />
          </Section>

          <Section id="cookies" num="9" title="Cookies">
            <P>We may use cookies for:</P>
            <Ul items={[
              "Analytics",
              "Authentication",
              "Service improvement",
            ]} />
            <P>Users can opt out via browser settings.</P>
          </Section>

          <Section id="changes" num="10" title="Changes to This Policy">
            <P>We may update this policy periodically. Continued use of the Service indicates acceptance of the updated version.</P>
          </Section>

          <Section id="contact" num="11" title="Contact Us">
            <P>For privacy-related requests:</P>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 10, padding: "12px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <Lock size={16} color="#4FD1C7" />
              <a href="mailto:support@zobojobs.com" className="email-link">
                support@zobojobs.com
              </a>
            </div>
          </Section>
        </main>
      </div>

      {/* Footer */}
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
                style={{ fontSize: 14, color: label === "Privacy" ? "#4FD1C7" : "#6B7280", textDecoration: "none", transition: "color 150ms", fontWeight: label === "Privacy" ? 600 : 400 }}>
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
