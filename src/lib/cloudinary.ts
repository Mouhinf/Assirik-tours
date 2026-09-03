import "server-only";
import { v2 as cloudinary } from "cloudinary";

let configured = false;

function configure() {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local.",
    );
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
}

export type UploadResult = {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

/**
 * Allowed MIME types for visa documents. Anything else is rejected before
 * we touch Cloudinary, so the error stays clear and the file never leaves
 * the server.
 */
export const VISA_ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
]);

export const VISA_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export type UploadOptions = {
  folder?: string;
  filename?: string;
  /** Cloudinary resource_type — defaults to "image". Use "raw" for non-image files (PDF). */
  resourceType?: "image" | "raw";
  /**
   * Cloudinary access type.
   *  - "upload" (default for public media) — anyone with the URL can read.
   *  - "authenticated" — only callers presenting a signed cookie/URL can read.
   * For visa documents we always force "authenticated".
   */
  type?: "upload" | "authenticated" | "private";
  /** Optional context (Cloudinary-side metadata, not visible publicly). */
  context?: Record<string, string>;
};

/** Upload a buffer to Cloudinary under the "assirik-tours" folder. */
export async function uploadBuffer(
  buffer: Buffer,
  options: UploadOptions = {},
): Promise<UploadResult> {
  configure();
  const folder = options.folder ?? "assirik-tours";
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options.filename,
        resource_type: options.resourceType ?? "image",
        type: options.type ?? "upload",
        overwrite: false,
        unique_filename: true,
        context: options.context,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      },
    );
    stream.end(buffer);
  });
}

export async function deleteAsset(publicId: string, resourceType: "image" | "raw" = "image") {
  configure();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
}

/**
 * Generate a short-lived signed URL for an authenticated Cloudinary asset.
 * Used by the admin to preview visa documents without exposing them publicly.
 *
 * `expiresAt` defaults to 15 minutes from now.
 */
export function signedVisaUrl(
  publicId: string,
  resourceType: "image" | "raw" = "image",
  expiresAt: number = Math.floor(Date.now() / 1000) + 15 * 60,
): string {
  configure();
  return cloudinary.utils.private_download_url(publicId, resourceType, { expires_at: expiresAt });
}
