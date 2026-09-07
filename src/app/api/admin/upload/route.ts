import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-actions";
import { uploadBuffer } from "@/lib/cloudinary";
import { recordAudit } from "@/lib/audit";

/**
 * POST /api/admin/upload
 *
 * Multipart upload endpoint used by the admin ImagePicker. Unlike a Server
 * Action, a Route Handler reads `request.formData()` directly and is NOT
 * subject to the Server Action body-size limit (which was hitting the
 * 1 MB / 12 MB wall on every upload). The handler enforces its own
 * 10 MB MIME/size limit before touching Cloudinary.
 *
 * Expected form fields:
 *  - `file`: the binary image file
 *  - `folder`: Cloudinary folder (e.g. "assirik-tours/destinations")
 *
 * Response (200):
 *  { ok: true, asset: { publicId, url, width, height, format, bytes, folder } }
 *
 * Response (4xx/5xx):
 *  { error: string }
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Buffer + Cloudinary SDK require Node

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export async function POST(req: Request) {
  const session = await requirePermission("media:write");

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Le fichier envoyé dépasse la limite serveur." },
      { status: 413 },
    );
  }

  const file = formData.get("file");
  const folderRaw = String(formData.get("folder") ?? "assirik-tours/general");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Format non supporté (JPEG, PNG, WebP, AVIF)." },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image trop lourde (max 10 MB)." },
      { status: 413 },
    );
  }

  // Whitelist the folder — must start with `assirik-tours/`, only
  // lowercase alphanum, dashes, underscores, dots, slashes.
  const safeFolder = folderRaw.replace(/[^a-z0-9/_.-]/gi, "").slice(0, 80);
  if (!safeFolder.startsWith("assirik-tours/")) {
    return NextResponse.json(
      { error: "Dossier Cloudinary invalide." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await uploadBuffer(buffer, { folder: safeFolder });
    await recordAudit({
      userId: session.sub,
      action: "media.upload",
      metadata: {
        publicId: result.publicId,
        folder: safeFolder,
        bytes: result.bytes,
      },
    });
    return NextResponse.json({
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
    });
  } catch (e) {
    console.error("[upload] failed", e);
    return NextResponse.json(
      { error: "Échec de l'upload. Réessayez." },
      { status: 502 },
    );
  }
}
