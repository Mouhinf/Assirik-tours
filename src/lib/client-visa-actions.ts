"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/client-auth";
import {
  uploadBuffer,
  VISA_ALLOWED_MIMES,
  VISA_MAX_BYTES,
  signedVisaUrl,
} from "@/lib/cloudinary";
import { recordAudit } from "@/lib/audit";

export async function uploadClientVisaDocAction(formData: FormData) {
  const session = await requireClientSession();
  if (!session) return { error: "Session expirée." };
  const id = String(formData.get("id") ?? "");
  const docName = String(formData.get("docName") ?? "").trim();
  const file = formData.get("file");

  if (!id || !docName || !(file instanceof File)) {
    return { error: "Données manquantes." };
  }
  if (file.size > VISA_MAX_BYTES) {
    return { error: "Fichier trop lourd (max 10 MB)." };
  }
  if (!VISA_ALLOWED_MIMES.has(file.type)) {
    return {
      error:
        "Type de fichier non autorisé. Formats acceptés : JPEG, PNG, WebP, HEIC, PDF.",
    };
  }

  const dossier = await prisma.visaDossier.findUnique({ where: { id } });
  if (!dossier || dossier.clientAccountId !== session.sub) {
    return { error: "Dossier introuvable ou accès refusé." };
  }

  const isPdf = file.type === "application/pdf";
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = docName.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 60);
  const asset = await uploadBuffer(buffer, {
    folder: `assirik-tours/visa/${dossier.reference}`,
    filename: `${dossier.reference}_${safeName}_${Date.now()}`,
    // Sensitive: store as authenticated, never publicly readable.
    type: "authenticated",
    // PDF goes through "raw" so Cloudinary doesn't try to transcode it.
    resourceType: isPdf ? "raw" : "image",
    context: {
      dossierRef: dossier.reference,
      docName,
      uploadedBy: session.sub,
    },
  });

  const docs = Array.isArray(dossier.documents)
    ? (dossier.documents as Array<Record<string, unknown>>)
    : [];
  const next = docs.map((d) =>
    d.name === docName
      ? {
          ...d,
          status: "uploaded",
          cloudinaryId: asset.publicId,
          resourceType: isPdf ? "raw" : "image",
          uploadedAt: new Date().toISOString(),
        }
      : d,
  );

  await prisma.visaDossier.update({
    where: { id },
    data: { documents: next as never },
  });

  await recordAudit({
    userId: session.sub,
    action: "client.visa.doc.upload",
    metadata: {
      dossierRef: dossier.reference,
      docName,
      publicId: asset.publicId,
      resourceType: isPdf ? "raw" : "image",
    },
  });

  revalidatePath(`/espace-client/visa/${id}`);
  return { ok: true };
}

/**
 * Returns a short-lived signed URL the authenticated client can use to
 * preview one of their own uploaded visa documents. Useful for "view
 * uploaded passport" actions.
 */
export async function getSignedVisaDocUrl(
  dossierId: string,
  docName: string,
): Promise<{ url: string } | { error: string }> {
  const session = await requireClientSession();
  if (!session) return { error: "Session expirée." };
  const dossier = await prisma.visaDossier.findUnique({ where: { id: dossierId } });
  if (!dossier || dossier.clientAccountId !== session.sub) {
    return { error: "Accès refusé." };
  }
  const docs = Array.isArray(dossier.documents)
    ? (dossier.documents as Array<Record<string, unknown>>)
    : [];
  const doc = docs.find((d) => d.name === docName) as
    | { cloudinaryId?: string; resourceType?: "image" | "raw" }
    | undefined;
  if (!doc?.cloudinaryId) return { error: "Document introuvable." };
  return { url: signedVisaUrl(doc.cloudinaryId, doc.resourceType ?? "image") };
}
