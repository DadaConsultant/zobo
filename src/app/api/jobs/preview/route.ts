import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateInterviewScript } from "@/lib/openai";
import { z } from "zod";

const previewSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(50),
  requiredSkills: z.array(z.string()).min(1),
  yearsExperience: z.number().min(0).max(20),
  customQuestions: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Your account is pending approval. You cannot create jobs until an admin approves your account." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const data = previewSchema.parse(body);

    const interviewScript = await generateInterviewScript({
      title: data.title,
      description: data.description,
      requiredSkills: data.requiredSkills,
      yearsExperience: data.yearsExperience,
      customQuestions: data.customQuestions,
    });

    return NextResponse.json({ interviewScript });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Script preview error:", error);
    return NextResponse.json({ error: "Failed to generate interview script" }, { status: 500 });
  }
}
