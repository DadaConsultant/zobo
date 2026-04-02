import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Rate limiting via Upstash Redis (works on Vercel serverless).
 *
 * Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (e.g. Vercel → Storage → Upstash).
 * If unset, limits are skipped so local dev works without Redis.
 */

let noRedisLogged = false;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!noRedisLogged) {
      noRedisLogged = true;
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN missing — rate limiting disabled"
        );
      }
    }
    return null;
  }
  return new Redis({ url, token });
}

function sliding(client: Redis | null, prefix: string, max: number, window: Duration) {
  if (!client) return null;
  return new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(max, window),
    prefix: `zobo:${prefix}`,
  });
}

const redisClient = getRedis();

/** Register, forgot-password, reset-password */
const authSensitive = sliding(redisClient, "auth-sensitive", 10, "15 m");
/** NextAuth credentials sign-in */
const authLogin = sliding(redisClient, "auth-login", 30, "15 m");
/** Authenticated OpenAI: job create + script preview */
const openaiRecruiter = sliding(redisClient, "openai-recruiter", 40, "1 h");
/** Candidate interview flow: message, STT, complete, abandon (OpenAI) */
const openaiInterview = sliding(redisClient, "openai-interview", 200, "1 h");
/** ElevenLabs TTS */
const elevenLabs = sliding(redisClient, "elevenlabs", 150, "1 h");

export function getClientIp(req: Request | NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function tooManyResponse(retryAfterSec?: number): NextResponse {
  const headers = new Headers({
    "Content-Type": "application/json",
  });
  if (retryAfterSec != null && retryAfterSec > 0) {
    headers.set("Retry-After", String(retryAfterSec));
  }
  return new NextResponse(
    JSON.stringify({
      error: "Too many requests. Please wait a moment and try again.",
    }),
    { status: 429, headers }
  );
}

async function enforce(
  limiter: Ratelimit | null,
  identifier: string
): Promise<NextResponse | null> {
  if (!limiter) return null;
  const { success, reset } = await limiter.limit(identifier);
  if (success) return null;
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return tooManyResponse(retryAfter);
}

export async function rateLimitAuthSensitive(req: Request | NextRequest): Promise<NextResponse | null> {
  return enforce(authSensitive, getClientIp(req));
}

export async function rateLimitAuthLogin(req: Request | NextRequest): Promise<NextResponse | null> {
  return enforce(authLogin, getClientIp(req));
}

export async function rateLimitOpenAiRecruiter(
  req: Request | NextRequest,
  userId: string
): Promise<NextResponse | null> {
  return enforce(openaiRecruiter, `user:${userId}`);
}

export async function rateLimitOpenAiInterview(req: Request | NextRequest): Promise<NextResponse | null> {
  return enforce(openaiInterview, `ip:${getClientIp(req)}`);
}

export async function rateLimitElevenLabs(req: Request | NextRequest): Promise<NextResponse | null> {
  return enforce(elevenLabs, `ip:${getClientIp(req)}`);
}
