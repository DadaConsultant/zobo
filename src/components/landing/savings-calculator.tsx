"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CURRENCIES = [
  { code: "GBP", symbol: "£", rate: 1 },
  { code: "USD", symbol: "$", rate: 1.27 },
  { code: "EUR", symbol: "€", rate: 1.17 },
] as const;

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
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
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
    <div className="mb-6 sm:mb-7">
      <div className="mb-2 flex flex-col gap-2 sm:mb-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <label className="text-sm font-medium leading-snug text-[#140700] sm:text-[14px]">{label}</label>
        <div className="flex w-full max-w-[11rem] items-center gap-1 self-start border border-[#cccccc] bg-white px-2.5 py-1.5 sm:w-auto sm:max-w-none sm:shrink-0 sm:self-auto sm:bg-[#f8f8f7]">
          {prefix && <span className="text-sm font-semibold text-[#140700]">{prefix}</span>}
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            inputMode="decimal"
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v) && v >= min && v <= max) onChange(v);
            }}
            className="min-w-0 flex-1 border-0 bg-transparent text-right text-sm font-semibold text-[#140700] outline-none sm:w-16"
          />
          {suffix && <span className="text-sm text-[#5e5855]">{suffix}</span>}
        </div>
      </div>
      <div className="relative flex items-center py-2.5 sm:py-1">
        <div className="relative h-3 w-full rounded-full bg-[#cccccc]">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-[#140700] transition-[width] duration-75"
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            aria-label={label}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-[#5e5855]">
        <span>
          {prefix}
          {min}
          {suffix}
        </span>
        <span>
          {prefix}
          {max}
          {suffix}
        </span>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  symbol: string;
  highlight?: boolean;
}

function MetricCard({ label, value, symbol, highlight }: MetricCardProps) {
  const animated = useAnimatedNumber(value);
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        highlight
          ? "border-[#140700] bg-[#140700] text-[#f8f8f7]"
          : "border-[#cccccc] bg-white"
      )}
    >
      <p
        className={cn(
          "mb-1.5 text-xs font-medium tracking-wide sm:mb-2 sm:text-[13px]",
          highlight ? "text-[#f8f8f7]/75" : "text-[#5e5855]"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "ld-font-display text-xl leading-none sm:text-[26px]",
          highlight ? "text-[#f8f8f7]" : "text-[#140700]"
        )}
      >
        {symbol}
        {animated.toLocaleString()}
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
    <section id="costcalculator" className="bg-white px-4 py-12 sm:px-6 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-10 text-center sm:mb-12 md:mb-14">
          <p className="ld-eyebrow mb-3 sm:mb-4">ROI Calculator</p>
          <h2 className="ld-font-display mx-auto mb-3 max-w-[900px] text-balance sm:mb-4">
            See How Much You Can Save with{" "}
            <span className="block sm:inline">AI Interview Automation</span>
          </h2>
          <p className="ld-body-lg mx-auto max-w-xl">
            Zobo automates first-round interviews with AI — replace screening calls with a single link.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 rounded-2xl border border-[#cccccc] bg-[#f8f8f7] p-4 sm:p-6 lg:grid-cols-2 lg:gap-10 lg:p-10">
          <div className="min-w-0">
            <p className="ld-eyebrow mb-3 opacity-80 sm:mb-4">Currency</p>
            <div className="mb-6 grid grid-cols-3 gap-2 sm:mb-8 sm:flex sm:flex-wrap sm:gap-2">
              {CURRENCIES.map((c, i) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrencyIdx(i)}
                  className={cn(
                    "border px-2 py-2.5 text-xs font-medium transition-colors sm:px-3.5 sm:py-1.5 sm:text-[13px]",
                    i === currencyIdx
                      ? "border-[#140700] bg-[#140700] text-[#f8f8f7]"
                      : "border-[#cccccc] bg-white text-[#5e5855] active:bg-[#f8f8f7]"
                  )}
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
            <SliderInput label="Roles per month" value={roles} min={1} max={50} step={1} onChange={setRoles} />
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

            <div className="mt-2 border border-[#cccccc] bg-white p-3.5 sm:p-4">
              <p className="ld-body text-[#514c49]">
                <strong className="text-[#140700]">85% reduction in screening time</strong>
                <br />
                That&apos;s <strong className="text-[#140700]">{hoursSavedPerRole} hrs saved per role</strong> — time your
                team gets back.
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4 lg:gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <MetricCard label="Manual cost / month" value={manualMonthly} symbol={symbol} />
              <MetricCard label="Cost with Zobo / month" value={zoboMonthly} symbol={symbol} />
              <MetricCard label="Monthly savings" value={monthlySavings} symbol={symbol} />
              <div className="rounded-2xl border border-[#cccccc]  p-4 sm:col-span-2 sm:p-5">
                <p className="mb-2 text-xs font-medium text-[#f8f8f7]/60 sm:text-[13px]">Annual savings</p>
                <AnimatedSavings value={annualSavings} symbol={symbol} />
              </div>
            </div>

            <MiniBarChart monthlySavings={monthlySavings} symbol={symbol} />

            <Link href="/book-demo" className="ld-btn-primary mt-1 w-full py-3.5 text-center text-[15px] no-underline">
              Start Saving — Get a Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimatedSavings({ value, symbol }: { value: number; symbol: string }) {
  const animated = useAnimatedNumber(value);
  return (
    <p className="ld-font-display text-2xl leading-none text-[#f8f8f7] sm:text-[28px]">
      {symbol}
      {animated.toLocaleString()}
    </p>
  );
}

function MiniBarChart({ monthlySavings, symbol }: { monthlySavings: number; symbol: string }) {
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const monthsLong = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const cumulative = months.map((_, i) => monthlySavings * (i + 1));
  const maxVal = cumulative[11] || 1;

  return (
    <div className="rounded-2xl border border-[#cccccc] bg-white p-3 sm:p-5">
      <p className="ld-eyebrow mb-3 opacity-80 sm:mb-3.5">Cumulative savings over 12 months</p>
      <div className="-mx-1 overflow-x-auto overflow-y-hidden px-1 pb-1 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
        <div className="flex h-[4.5rem] min-w-[min(100%,22rem)] items-end justify-between gap-1 sm:min-w-0 sm:gap-1.5">
          {cumulative.map((val, i) => {
            const h = Math.max(6, (val / maxVal) * 72);
            return (
              <div key={i} className="flex min-w-[1.125rem] flex-1 flex-col items-center gap-1 sm:min-w-0">
                <div
                  title={`${monthsLong[i]}: ${symbol}${val.toLocaleString()}`}
                  className={cn(
                    "w-full rounded-t transition-[height] duration-300 ease-out",
                    i === 11 ? "bg-[#140700]" : "bg-[#cccccc]"
                  )}
                  style={{ height: h }}
                />
                <span className="text-[9px] font-medium text-[#5e5855] sm:hidden">{months[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-[#5e5855] sm:text-xs">
        <span className="hidden sm:inline">Jan</span>
        <span className="sm:hidden">Tap bars for month</span>
        <span className="font-semibold text-[#140700]">
          {symbol}
          {(monthlySavings * 12).toLocaleString()} / yr
        </span>
        <span className="hidden sm:inline">Dec</span>
      </div>
    </div>
  );
}
