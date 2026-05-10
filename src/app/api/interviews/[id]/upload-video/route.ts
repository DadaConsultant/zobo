import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPresignedUploadUrl } from "@/lib/s3";

/**
 * POST — client requests a presigned S3 PUT URL.
 *        Responds with { presignedUrl, fileUrl } so the browser can upload
 *        the video blob directly to S3 without passing through this server.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { contentType = "video/webm" } = await req.json().catch(() => ({}));
    const key = `interviews/${id}/recording.webm`;
    const { presignedUrl, fileUrl } = await createPresignedUploadUrl(key, contentType);
    return NextResponse.json({ presignedUrl, fileUrl });
  } catch (error) {
    console.error("S3 presign (video) error:", error);
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
    const { videoUrl } = await req.json();

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json({ error: "videoUrl is required" }, { status: 400 });
    }

    await prisma.interview.update({
      where: { id },
      data: { videoUrl, recordingType: "VIDEO" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save videoUrl error:", error);
    return NextResponse.json({ error: "Failed to save video URL" }, { status: 500 });
  }
}
