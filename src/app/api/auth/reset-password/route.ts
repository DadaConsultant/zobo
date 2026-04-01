import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = schema.parse(body);

    // Find the most recent valid (unused, non-expired) token for this email
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Reset code is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const otpMatch = await bcrypt.compare(otp, resetToken.tokenHash);
    if (!otpMatch) {
      return NextResponse.json(
        { error: "Incorrect reset code. Please check your email and try again." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("[reset-password]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
