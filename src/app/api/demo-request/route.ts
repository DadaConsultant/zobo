import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimitDemoRequest } from "@/lib/rate-limit";
import { isConsumerEmailDomain, WORK_EMAIL_REQUIRED_MESSAGE } from "@/lib/work-email";

const DEMO_REQUEST_WEBHOOK_URL =
  process.env.DEMO_REQUEST_WEBHOOK_URL ??
  "https://hook.eu2.make.com/yucm78xwf37nv4iyg7yxc9iozwiwjqqx";

/** Reject instant bot posts (must be a few seconds after the page opened). */
const MIN_MS_BEFORE_SUBMIT = 2_000;
const MAX_FORM_AGE_MS = 30 * 60 * 1_000;

const companySizeEnum = z.enum([
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
]);

/** Honeypot: must stay empty (bots often fill hidden "website" fields). */
const demoRequestSchema = z.object({
  name: z.string().max(200).optional(),
  companyName: z.string().min(1, "Company name is required").max(200),
  companySize: companySizeEnum,
  jobTitle: z.string().min(1, "Job title is required").max(200),
  email: z
    .string()
    .email("Enter a valid email address")
    .refine((e) => !isConsumerEmailDomain(e), { message: WORK_EMAIL_REQUIRED_MESSAGE }),
  companyWebsiteExtra: z.string().max(2000).optional(),
  /** Client sets this once when the book-demo page mounts (ms since epoch). */
  formOpenedAt: z.number(),
});

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const limited = await rateLimitDemoRequest(req);
  if (limited) return limited;

  try {
    const body = await req.json();
    const parsed = demoRequestSchema.parse(body);

    if (parsed.companyWebsiteExtra?.trim()) {
      return NextResponse.json(
        { error: "Unable to submit this form. Please refresh the page and try again." },
        { status: 400 }
      );
    }

    const now = Date.now();
    const elapsed = now - parsed.formOpenedAt;
    if (elapsed < MIN_MS_BEFORE_SUBMIT || elapsed > MAX_FORM_AGE_MS || parsed.formOpenedAt > now + 60_000) {
      return NextResponse.json(
        { error: "Please take a moment to complete the form, then try again." },
        { status: 400 }
      );
    }

    const payload = {
      name: parsed.name?.trim() || undefined,
      companyName: parsed.companyName.trim(),
      companySize: parsed.companySize,
      jobTitle: parsed.jobTitle.trim(),
      email: parsed.email.trim(),
      source: "book-demo",
    };

    const webhookRes = await fetch(DEMO_REQUEST_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25_000),
    });

    if (!webhookRes.ok) {
      const bodyText = await webhookRes.text().catch(() => "");
      console.error("[demo-request] webhook", webhookRes.status, bodyText.slice(0, 500));
      return NextResponse.json(
        { error: "Could not send your request. Please try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error("[demo-request]", error);
    return NextResponse.json(
      { error: "Could not send your request. Please try again later." },
      { status: 500 }
    );
  }
}
