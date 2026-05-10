import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPresignedUploadUrl } from "@/lib/s3";

/**
 * POST — client requests a presigned S3 PUT URL.
 *        Responds with { presignedUrl, fileUrl } so the browser can upload
 *        the audio blob directly to S3 without passing through this server.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { contentType = "audio/webm" } = await req.json().catch(() => ({}));
    const key = `interviews/${id}/recording-audio.webm`;
    const { presignedUrl, fileUrl } = await createPresignedUploadUrl(key, contentType);
    return NextResponse.json({ presignedUrl, fileUrl });
  } catch (error) {
    console.error("S3 presign (audio) error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}

/**
 * PUT — called by the client after the S3 upload completes to persist the URL.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { audioUrl } = await req.json();

    if (!audioUrl || typeof audioUrl !== "string") {
      return NextResponse.json({ error: "audioUrl is required" }, { status: 400 });
    }

    await prisma.interview.update({
      where: { id },
      data: { audioUrl, recordingType: "AUDIO" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save audioUrl error:", error);
    return NextResponse.json({ error: "Failed to save audio URL" }, { status: 500 });
  }
}
