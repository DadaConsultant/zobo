import { handlers } from "@/lib/auth";
import { rateLimitAuthLogin } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";

const { GET, POST: authPost } = handlers;

export { GET };

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  if (url.pathname.includes("callback/credentials")) {
    const denied = await rateLimitAuthLogin(req);
    if (denied) return denied;
  }
  return authPost(req);
}
