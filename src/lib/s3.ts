import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // Disable automatic checksums — browsers can't compute/send them during
  // a direct presigned-URL PUT, which causes S3 to reject the upload.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const BUCKET = process.env.AWS_S3_BUCKET!;

/**
 * Generate a short-lived presigned PUT URL so the browser can upload directly
 * to S3 without the file passing through the Next.js server.
 * Returns the presigned upload URL and the permanent object URL for storage in DB.
 */
export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const presignedUrl = await getSignedUrl(s3, command, { expiresIn });
  const fileUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { presignedUrl, fileUrl };
}

/**
 * Generate a short-lived presigned GET URL for private S3 objects.
 * Use this on the recruiter side to serve recordings from a private bucket.
 * Default expiry: 24 hours.
 */
export async function createPresignedDownloadUrl(key: string, expiresIn = 86400) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Extract the S3 object key from a stored S3 URL.
 * e.g. "https://my-bucket.s3.us-east-1.amazonaws.com/interviews/abc/recording.webm"
 *   → "interviews/abc/recording.webm"
 */
export function s3KeyFromUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url);
    return pathname.startsWith("/") ? pathname.slice(1) : pathname;
  } catch {
    return null;
  }
}

/** True when a URL looks like an S3 object URL (not a presigned URL or CDN). */
export function isS3Url(url: string): boolean {
  return url.includes(".s3.") && url.includes(".amazonaws.com");
}
