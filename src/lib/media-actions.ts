"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-actions";
import { uploadBuffer, deleteAsset } from "@/lib/cloudinary";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function uploadImageAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "assirik-tours/general");

  if (!(file instanceof File)) {
    return { error: "Aucun fichier reçu." };
  }
  if (!ALLOWED.has(file.type)) {
    return { error: "Format non supporté (JPEG, PNG, WebP, AVIF)." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Image trop lourde (max 10 MB)." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").slice(0, 80);

  try {
    const result = await uploadBuffer(buffer, { folder: safeFolder });
    revalidatePath("/admin/media");
    return {
      ok: true,
      asset: {
        publicId: result.publicId,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        folder: safeFolder,
      },
    };
  } catch (e) {
    console.error("[upload] failed", e);
    return { error: "Échec de l'upload. Réessayez." };
  }
}

export async function deleteImageAction(formData: FormData) {
  await requireAdmin();
  const publicId = String(formData.get("publicId") ?? "");
  if (!publicId) return { error: "Public ID manquant." };

  try {
    await deleteAsset(publicId);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) {
    console.error("[delete] failed", e);
    return { error: "Échec de la suppression." };
  }
}

/** Fetch assets for the media gallery (latest N from Cloudinary). */
export async function listRecentMedia(folder?: string) {
  // The dashboard needs to call Cloudinary's admin API. We do that server-side
  // to avoid leaking the API secret to the client.
  const cloudinary = (await import("cloudinary")).v2;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!apiKey || !apiSecret || !cloudName) {
    return { assets: [], configured: false };
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return new Promise<{ assets: Array<Record<string, unknown>>; configured: boolean }>(
    (resolve) => {
      cloudinary.api.resources(
        {
          type: "upload",
          prefix: folder ?? "assirik-tours",
          max_results: 60,
          resource_type: "image",
        },
        (err, result) => {
          if (err || !result) {
            console.error("[cloudinary list] failed", err);
            resolve({ assets: [], configured: true });
            return;
          }
          resolve({
            assets: (result.resources ?? []) as Array<Record<string, unknown>>,
            configured: true,
          });
        },
      );
    },
  );
}

// Keep prisma import live even if not used yet (avoids tree-shake + lint noise)
void prisma;