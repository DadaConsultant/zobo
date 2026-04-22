import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { evaluateAndStoreInterviewResult } from "@/lib/persist-interview-evaluation";

export const maxDuration = 60;

/**
 * Picks up interviews that finished saving the transcript but whose background
 * AI evaluation did not run or failed. Safe to run on a schedule; each row is idempotent.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = await prisma.interview.findMany({
    where: {
      status: "COMPLETED",
      scores: { equals: Prisma.DbNull },
    },
    select: { id: true },
    take: 10,
    orderBy: { completedAt: "asc" },
  });

  const results: { id: string; result: string }[] = [];
  for (const row of pending) {
    const r = await evaluateAndStoreInterviewResult(row.id);
    if ("ok" in r && r.ok) results.push({ id: row.id, result: "evaluated" });
    else if ("skipped" in r) results.push({ id: row.id, result: r.reason });
    else if ("error" in r) results.push({ id: row.id, result: r.message });
  }

  return NextResponse.json({ processed: results.length, results });
}
