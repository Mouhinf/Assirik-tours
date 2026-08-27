"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/client-auth";
import { uploadBuffer } from "@/lib/cloudinary";

export async function uploadClientVisaDocAction(formData: FormData) {
  const session = await requireClientSession();
  if (!session) return { error: "Session expirée." };
  const id = String(formData.get("id") ?? "");
  const docName = String(formData.get("docName") ?? "").trim();
  const file = formData.get("file");

  if (!id || !docName || !(file instanceof File)) {
    return { error: "Données manquantes." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: "Fichier trop lourd (max 10 MB)." };
  }

  const dossier = await prisma.visaDossier.findUnique({ where: { id } });
  if (!dossier || dossier.clientAccountId !== session.sub) {
    return { error: "Dossier introuvable ou accès refusé." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = docName.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 60);
  const asset = await uploadBuffer(buffer, {
    folder: `assirik-tours/visa/${dossier.reference}`,
    filename: `${dossier.reference}_${safeName}_${Date.now()}`,
  });

  const docs = Array.isArray(dossier.documents) ? (dossier.documents as Array<Record<string, unknown>>) : [];
  const next = docs.map((d) =>
    d.name === docName ? { ...d, status: "uploaded", cloudinaryId: asset.publicId, uploadedAt: new Date().toISOString() } : d,
  );

  await prisma.visaDossier.update({ where: { id }, data: { documents: next as never } });
  revalidatePath(`/espace-client/visa/${id}`);
  return { ok: true };
}
