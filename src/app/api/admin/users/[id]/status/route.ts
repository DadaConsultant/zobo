import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAccountApprovedEmail } from "@/lib/email";
import { z } from "zod";

export const maxDuration = 30;

const bodySchema = z.object({
  status: z.enum(["APPROVED", "SUSPENDED", "PENDING"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const body = await req.json();
  const { status } = bodySchema.parse(body);

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, name: true, email: true, status: true },
  });

  // Send approval email when transitioning to APPROVED
  if (status === "APPROVED" && existing.status !== "APPROVED") {
    try {
      await sendAccountApprovedEmail({
        userName: updated.name || updated.email,
        userEmail: updated.email,
      });
    } catch (err) {
      console.error("[admin] Failed to send approval email:", err);
    }
  }

  return NextResponse.json({ user: updated });
}
