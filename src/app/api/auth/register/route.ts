import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendAdminNewUserNotification } from "@/lib/email";
import { z } from "zod";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "support@zobojobs.com";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  company: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, company } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        company,
        role: isAdmin ? "ADMIN" : "USER",
        status: isAdmin ? "APPROVED" : "PENDING",
      },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    // Notify admin about new company registration (skip for admin self-registration)
    if (!isAdmin) {
      try {
        await sendAdminNewUserNotification({
          userName: name,
          userEmail: email,
          company,
          userId: user.id,
        });
      } catch (emailErr) {
        console.error("[register] Failed to send admin notification:", emailErr);
        // Non-fatal — user is still created
      }
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
