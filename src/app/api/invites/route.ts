import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInterviewInvite } from "@/lib/email";
import { z } from "zod";

/** Vercel: headroom for SMTP verify + send (plan may still cap duration, e.g. Hobby). */
export const maxDuration = 30;

const inviteSchema = z.object({
  jobId: z.string(),
  candidates: z.array(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
    })
  ),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { jobId, candidates } = inviteSchema.parse(body);

    const job = await prisma.job.findFirst({
      where: { id: jobId, createdById: session.user.id },
      include: { createdBy: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const results = await Promise.allSettled(
      candidates.map(async ({ name, email }) => {
        const existing = await prisma.candidate.findUnique({
          where: { email_jobId: { email, jobId } },
        });

        if (existing) return { email, status: "already_invited" };

        const candidate = await prisma.candidate.create({
          data: { name, email, jobId, status: "INVITED", invitedAt: new Date() },
        });

        try {
          await sendInterviewInvite({
            candidateName: name,
            candidateEmail: email,
            jobTitle: job.title,
            companyName: job.createdBy.company || "the company",
            interviewLink: job.interviewLink,
          });
        } catch (emailErr) {
          console.error(`[invites] Failed to send email to ${email}:`, emailErr);
          // Roll back the candidate record so a retry invite is possible
          await prisma.candidate.delete({ where: { id: candidate.id } }).catch(() => null);
          throw emailErr;
        }

        return { email, candidateId: candidate.id, status: "invited" };
      })
    );

    const summary = {
      total: candidates.length,
      invited: results.filter((r) => r.status === "fulfilled" && (r.value as { status: string }).status === "invited").length,
      alreadyInvited: results.filter((r) => r.status === "fulfilled" && (r.value as { status: string }).status === "already_invited").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    return NextResponse.json({ summary });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send invites" }, { status: 500 });
  }
}
