import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const formData = await req.formData();
    const video = formData.get("video") as File | null;

    if (!video || video.size === 0) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    const blob = await put(`interviews/${id}/recording.webm`, video, {
      access: "public",
      contentType: "video/webm",
    });

    await prisma.interview.update({
      where: { id },
      data: { videoUrl: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Video upload error:", error);
    return NextResponse.json({ error: "Failed to upload video" }, { status: 500 });
  }
}
