import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Zobo Jobs</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started Free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          AI Interview Infrastructure
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          Send one link.<br />
          <span className="text-indigo-600">Get your top candidates.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Replace first-round screening calls with an AI voice interview agent.
          Share a link, let AI do the interviews, get a ranked shortlist in minutes.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="xl">Start Hiring Smarter</Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="xl" variant="outline">See How It Works</Button>
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required · 10 free interviews</p>
      </section>

      {/* Stats */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-8 text-center text-white">
          {[
            { value: "10x", label: "Faster screening" },
            { value: "85%", label: "Time saved per hire" },
            { value: "3min", label: "To generate interview" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-5xl font-extrabold mb-2">{stat.value}</div>
              <div className="text-indigo-200 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
          <p className="text-gray-500 text-lg">Four simple steps to your shortlist</p>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[
            { step: "01", title: "Create a Job", desc: "Add your job title, description, and required skills." },
            { step: "02", title: "AI Generates Interview", desc: "Our AI builds a tailored interview script in seconds." },
            { step: "03", title: "Share the Link", desc: "Send one link to all candidates via email, WhatsApp, or LinkedIn." },
            { step: "04", title: "Get Your Shortlist", desc: "Candidates complete AI interviews. You get a ranked list with scores." },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="text-5xl font-black text-indigo-100 mb-3">{item.step}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to hire better</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: "🎙️", title: "AI Voice Interview", desc: "Natural conversational interviews with real-time STT + TTS. Feels human, works at scale." },
              { icon: "📊", title: "Smart Scoring", desc: "Every candidate scored on technical knowledge, communication, confidence, and role fit." },
              { icon: "🏆", title: "Auto Shortlist", desc: "Top 3 candidates surfaced instantly. No sorting, no spreadsheets, no guesswork." },
              { icon: "📧", title: "Bulk Invites", desc: "Upload a CSV or send direct email invites. Automated 24h and 48h reminders included." },
              { icon: "🔗", title: "One Shareable Link", desc: "A unique link per job. Share anywhere — email, LinkedIn, WhatsApp." },
              { icon: "🛡️", title: "Guardrails Built In", desc: "AI stays on topic, won't share confidential info, and handles inappropriate behavior." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple pricing</h2>
          <p className="text-gray-500 text-lg">Pay for interviews, not seats</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            { name: "Starter", price: "$99", period: "/month", interviews: "100 interviews", features: ["AI voice interviews", "Candidate scoring", "Email invites", "Basic dashboard"], highlighted: false },
            { name: "Growth", price: "$299", period: "/month", interviews: "500 interviews", features: ["Everything in Starter", "Bulk CSV upload", "Automated reminders", "Priority support", "Top candidates highlight"], highlighted: true },
            { name: "Enterprise", price: "Custom", period: "", interviews: "Unlimited", features: ["Everything in Growth", "Custom integrations", "Dedicated support", "SLA guarantee", "Custom AI training"], highlighted: false },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-8 border ${plan.highlighted ? "bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105" : "bg-white border-gray-100 shadow-sm"}`}
            >
              <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`text-4xl font-black ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? "text-indigo-200" : "text-gray-400"}`}>{plan.period}</span>
              </div>
              <p className={`text-sm mb-6 ${plan.highlighted ? "text-indigo-200" : "text-gray-500"}`}>{plan.interviews}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlighted ? "text-indigo-100" : "text-gray-600"}`}>
                    <svg className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? "text-indigo-300" : "text-indigo-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "outline" : "default"}
                  style={plan.highlighted ? { color: "#4f46e5", background: "white" } : undefined}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-24 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">Ready to hire smarter?</h2>
        <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
          Join startups and hiring teams using Zobo to automatically screen candidates and save hours every week.
        </p>
        <Link href="/signup">
          <Button size="xl" className="bg-white text-indigo-700 hover:bg-indigo-50">
            Start for Free
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">Z</span>
          </div>
          <span className="text-white font-bold">Zobo Jobs</span>
        </div>
        <p className="text-sm">© 2026 Zobo Jobs. Interview Infrastructure as a Service.</p>
      </footer>
    </div>
  );
}
