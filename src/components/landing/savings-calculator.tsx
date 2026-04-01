"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const CURRENCIES = [
  { code: "GBP", symbol: "£", rate: 1 },
  { code: "USD", symbol: "$", rate: 1.27 },
  { code: "EUR", symbol: "€", rate: 1.17 },
];

function useAnimatedNumber(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display;
}

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
  onChange: (v: number) => void;
}

function SliderInput({ label, value, min, max, step, suffix, prefix, onChange }: SliderInputProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</label>
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#F5F7FA", border: "1px solid #E5E7EB", borderRadius: 8, padding: "4px 10px" }}>
          {prefix && <span style={{ fontSize: 14, fontWeight: 700, color: "#1F2937" }}>{prefix}</span>}
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v) && v >= min && v <= max) onChange(v);
            }}
            style={{ width: 64, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 700, color: "#1F2937", textAlign: "right" }}
          />
          {suffix && <span style={{ fontSize: 14, color: "#6B7280" }}>{suffix}</span>}
        </div>
      </div>
      <div style={{ position: "relative", height: 6, borderRadius: 999, background: "#E5E7EB", cursor: "pointer" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #0D9488, #4FD1C7)", width: `${pct}%`, transition: "width 80ms" }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            opacity: 0, cursor: "pointer", margin: 0,
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{prefix}{min}{suffix}</span>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{prefix}{max}{suffix}</span>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  symbol: string;
  highlight?: boolean;
  large?: boolean;
}

function MetricCard({ label, value, symbol, highlight, large }: MetricCardProps) {
  const animated = useAnimatedNumber(value);
  return (
    <div style={{
      background: highlight ? "linear-gradient(135deg, #0D9488 0%, #059669 100%)" : "#FFFFFF",
      borderRadius: 14,
      padding: large ? "28px 24px" : "20px 20px",
      border: highlight ? "none" : "1px solid #E5E7EB",
      boxShadow: highlight ? "0 8px 32px rgba(13,148,136,0.25)" : "0 2px 8px rgba(0,0,0,0.04)",
      gridColumn: large ? "span 2" : undefined,
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: highlight ? "rgba(255,255,255,0.75)" : "#6B7280", marginBottom: 8, letterSpacing: "0.3px" }}>
        {label}
      </p>
      <p style={{ fontSize: large ? 36 : 26, fontWeight: 800, color: highlight ? "#FFFFFF" : "#1A1A1A", letterSpacing: "-1px", lineHeight: 1 }}>
        {symbol}{animated.toLocaleString()}
      </p>
    </div>
  );
}

export default function SavingsCalculator() {
  const [candidates, setCandidates] = useState(50);
  const [roles, setRoles] = useState(5);
  const [minutes, setMinutes] = useState(8);
  const [hourlyRate, setHourlyRate] = useState(30);
  const [currencyIdx, setCurrencyIdx] = useState(0);

  const { symbol, rate } = CURRENCIES[currencyIdx];

  const timePerCallHours = minutes / 60;
  const manualCostPerRole = candidates * timePerCallHours * hourlyRate;
  const zOboCostPerRole = manualCostPerRole * 0.15;
  const manualMonthly = Math.round(manualCostPerRole * roles * rate);
  const zoboMonthly = Math.round(zOboCostPerRole * roles * rate);
  const monthlySavings = manualMonthly - zoboMonthly;
  const annualSavings = monthlySavings * 12;
  const hoursSavedPerRole = Math.round(candidates * timePerCallHours * 0.85 * 10) / 10;

  return (
    <section id="costcalculator" style={{ background: "#FFFFFF", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#4FD1C7", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 16 }}>
            ROI Calculator
          </p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, color: "#1A1A1A", letterSpacing: "-1px", marginBottom: 16 }}>
            See How Much You Can Save with<br />AI Interview Automation
          </h2>
          <p style={{ fontSize: 17, color: "#6B7280", maxWidth: 560, margin: "0 auto" }}>
            Zobo automates first-round interviews with AI — replace screening calls with a single link.
          </p>
        </div>

        {/* Calculator card */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, background: "#F5F7FA", borderRadius: 24, border: "1px solid #E5E7EB", padding: 40, boxShadow: "0 4px 32px rgba(0,0,0,0.06)" }}>

          {/* Left: Inputs */}
          <div>
            {/* Currency switcher */}
            <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
              {CURRENCIES.map((c, i) => (
                <button
                  key={c.code}
                  onClick={() => setCurrencyIdx(i)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: i === currencyIdx ? "#0D9488" : "#E5E7EB",
                    background: i === currencyIdx ? "#0D9488" : "#FFFFFF",
                    color: i === currencyIdx ? "#FFFFFF" : "#6B7280",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 150ms",
                  }}
                >
                  {c.symbol} {c.code}
                </button>
              ))}
            </div>

            <SliderInput
              label="Candidates per role"
              value={candidates}
              min={5}
              max={500}
              step={5}
              onChange={setCandidates}
            />
            <SliderInput
              label="Roles per month"
              value={roles}
              min={1}
              max={50}
              step={1}
              onChange={setRoles}
            />
            <SliderInput
              label="Minutes per screening call"
              value={minutes}
              min={5}
              max={60}
              step={1}
              suffix=" min"
              onChange={setMinutes}
            />
            <SliderInput
              label="Recruiter hourly cost"
              value={hourlyRate}
              min={15}
              max={150}
              step={5}
              prefix={symbol}
              onChange={setHourlyRate}
            />

            {/* Time saved callout */}
            <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 12, padding: "14px 18px", marginTop: 8 }}>
              <p style={{ fontSize: 14, color: "#065F46", lineHeight: 1.6, margin: 0 }}>
                <strong>85% reduction in screening time</strong>
                <br />
                That&apos;s <strong>{hoursSavedPerRole} hrs saved per role</strong> — time your team gets back.
              </p>
            </div>
          </div>

          {/* Right: Results */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <MetricCard label="Manual cost / month" value={manualMonthly} symbol={symbol} />
              <MetricCard label="Cost with Zobo / month" value={zoboMonthly} symbol={symbol} />
              <MetricCard label="Monthly savings" value={monthlySavings} symbol={symbol} highlight />
              <div style={{
                background: "linear-gradient(135deg, #1F2937 0%, #111827 100%)",
                borderRadius: 14,
                padding: "20px 20px",
                boxShadow: "0 8px 32px rgba(31,41,55,0.2)",
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>Annual savings</p>
                <AnimatedSavings value={annualSavings} symbol={symbol} />
              </div>
            </div>

            {/* Mini chart */}
            <MiniBarChart monthlySavings={monthlySavings} symbol={symbol} />

            {/* CTA */}
            <Link href="/dashboard" style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "linear-gradient(135deg, #0D9488 0%, #059669 100%)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 12,
              padding: "14px 28px",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(13,148,136,0.35)",
              transition: "opacity 150ms",
              marginTop: 4,
            }}>
              Start Saving — Get a Demo
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .calc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function AnimatedSavings({ value, symbol }: { value: number; symbol: string }) {
  const animated = useAnimatedNumber(value);
  return (
    <p style={{ fontSize: 26, fontWeight: 800, color: "#4FD1C7", letterSpacing: "-1px", lineHeight: 1 }}>
      {symbol}{animated.toLocaleString()}
    </p>
  );
}

function MiniBarChart({ monthlySavings, symbol }: { monthlySavings: number; symbol: string }) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const cumulative = months.map((_, i) => monthlySavings * (i + 1));
  const maxVal = cumulative[11] || 1;

  return (
    <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "18px 20px", border: "1px solid #E5E7EB" }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 14 }}>
        Cumulative savings over 12 months
      </p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 64 }}>
        {cumulative.map((val, i) => {
          const h = Math.max(4, (val / maxVal) * 64);
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                title={`${months[i]}: ${symbol}${val.toLocaleString()}`}
                style={{
                  width: "100%",
                  height: h,
                  borderRadius: "4px 4px 0 0",
                  background: i === 11 ? "linear-gradient(180deg, #4FD1C7, #0D9488)" : "linear-gradient(180deg, #A7F3D0, #34D399)",
                  transition: "height 400ms cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 10, color: "#9CA3AF" }}>Jan</span>
        <span style={{ fontSize: 10, color: "#0D9488", fontWeight: 700 }}>{symbol}{(monthlySavings * 12).toLocaleString()} / yr</span>
        <span style={{ fontSize: 10, color: "#9CA3AF" }}>Dec</span>
      </div>
    </div>
  );
}
