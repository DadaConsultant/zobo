import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST — called by @vercel/blob/client `upload()` to obtain a signed upload token.
 *        Vercel's CDN also calls this endpoint with `type: 'blob.upload-completed'`
 *        once the direct upload finishes (production only).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = (await req.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["audio/webm", "audio/ogg", "audio/mp4", "audio/*"],
        maximumSizeInBytes: 200 * 1024 * 1024, // 200 MB
        tokenPayload: id,
      }),
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          await prisma.interview.update({
            where: { id: tokenPayload as string },
            data: { audioUrl: blob.url, recordingType: "AUDIO" },
          });
        } catch (err) {
          console.error("onUploadCompleted (audio) DB update failed:", err);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("handleUpload (audio) error:", error);
    return NextResponse.json({ error: "Upload token failed" }, { status: 400 });
  }
}

/**
 * PUT — called by the client after `upload()` resolves to guarantee the URL
 *       is saved. Covers local dev (where the CDN callback can't reach localhost)
 *       and acts as a safety net in production.
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
