"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-actions";
import { recordAudit } from "@/lib/audit";
import { uploadBuffer, deleteAsset } from "@/lib/cloudinary";
import { dispatchTemplate, notifyAgency } from "@/lib/communications-actions";

const VISA_DESTINATIONS = [
  "Schengen", "France", "Belgique", "Allemagne", "Espagne", "Italie",
  "USA", "Canada", "Royaume-Uni", "Maroc", "Turquie", "Dubaï",
  "Omra", "Hajj",
] as const;

const REQUIRED_DOCS_BY_DESTINATION: Record<string, string[]> = {
  Schengen: ["Passeport (scan couleurs)", "Photo d'identité", "Justificatif d'hébergement", "Assurance voyage", "Relevés bancaires (3 mois)", "Attestation de travail"],
  USA: ["DS-160 confirmé", "Photo d'identité", "Justificatif financier", "Justificatif d'emploi"],
  Canada: ["Formulaire IMM", "Photo d'identité", "Justificatif financier", "Lettre d'invitation"],
  Omra: ["Passeport (validité 6+ mois)", "Photo d'identité fond blanc", "Certificat vaccination méningite ACWY", "Certificat fièvre jaune", "Mahram (si applicable)"],
};

function makeReference() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000 + 10000);
  return `VISA-${year}-${rand}`;
}

export type VisaFormState = { ok: true; reference: string } | { ok: false; error: string } | null;

export async function createVisaDossierAction(
  _prev: VisaFormState,
  formData: FormData,
): Promise<VisaFormState> {
  const session = await requirePermission("visa:write");
  const clientEmail = String(formData.get("clientEmail") ?? "").trim().toLowerCase();
  const destination = String(formData.get("destination") ?? "").trim();
  const visaType = String(formData.get("visaType") ?? "").trim();
  const deadlineStr = String(formData.get("deadline") ?? "");
  const feeStr = String(formData.get("feeFCFA") ?? "0");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!clientEmail || !destination) {
    return { ok: false, error: "Email client et destination requis." };
  }

  const client = await prisma.client.upsert({
    where: { email: clientEmail },
    create: {
      firstName: String(formData.get("firstName") ?? "").trim() || "—",
      lastName: String(formData.get("lastName") ?? "").trim() || "—",
      email: clientEmail,
      phone: String(formData.get("phone") ?? "").trim() || "",
      notes: "Créé via dossier visa",
    },
    update: {},
  });

  const reference = makeReference();
  const deadline = deadlineStr ? new Date(deadlineStr) : null;
  const feeFCFA = Math.max(0, Number(feeStr) || 0);

  const dossier = await prisma.visaDossier.create({
    data: {
      reference,
      destination,
      visaType: visaType || null,
      deadline,
      feeFCFA,
      clientId: client.id,
      notes: notes || null,
      documents: REQUIRED_DOCS_BY_DESTINATION[destination]?.map((name) => ({ name, status: "missing" })) ?? [],
    },
  });

  await recordAudit({
    userId: session.sub,
    action: "visa.create",
    entity: `visa:${dossier.id}`,
    metadata: { reference, destination, feeFCFA },
  });

  // Email client with the list of required documents.
  const docsList = (REQUIRED_DOCS_BY_DESTINATION[destination] ?? [])
    .map((d) => `• ${d}`)
    .join("\n");
  const deadlineLabel = deadline ? deadline.toLocaleDateString("fr-FR") : "à confirmer";
  const recipientEmail = client.email && !client.email.startsWith("no-email-")
    ? client.email
    : null;
  if (recipientEmail) {
    void dispatchTemplate({
      templateId: "visa.documents_required",
      channel: "email",
      to: recipientEmail,
      toName: `${client.firstName} ${client.lastName}`.trim(),
      locale: "fr",
      vars: {
        clientName: client.firstName,
        destination,
        documents: docsList,
        deadline: deadlineLabel,
        reference,
      },
      metadata: { visaDossierId: dossier.id },
    });
  }

  revalidatePath("/admin/visa");
  return { ok: true, reference };
}

export async function updateVisaStatusAction(formData: FormData) {
  const session = await requirePermission("visa:write");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as
    | "BROUILLON" | "DOCUMENTS_MANQUANTS" | "EN_TRAITEMENT" | "ACCEPTE" | "REFUSE";
  if (!id || !status) return;
  await prisma.visaDossier.update({ where: { id }, data: { status } });
  await recordAudit({
    userId: session.sub,
    action: "visa.update",
    entity: `visa:${id}`,
    metadata: { status },
  });

  // Notify client by email + WhatsApp on status change.
  // VisaDossier.clientId has no Prisma relation declared — query Client directly.
  const dossier = await prisma.visaDossier.findUnique({ where: { id } });
  if (!dossier) return;
  const c = await prisma.client.findUnique({
    where: { id: dossier.clientId },
    select: { email: true, phone: true, firstName: true, lastName: true },
  });
  if (c?.email) {
    void dispatchTemplate({
      templateId: "visa.status_changed",
      channel: "email",
      to: c.email,
      toName: `${c.firstName} ${c.lastName}`.trim(),
      locale: "fr",
      vars: { clientName: c.firstName, reference: dossier.reference, status, notes: "" },
      metadata: { visaDossierId: id },
    });
  }
  if (c?.phone) {
    void dispatchTemplate({
      templateId: "visa.status_changed",
      channel: "whatsapp",
      to: c.phone,
      toName: `${c.firstName} ${c.lastName}`.trim(),
      locale: "fr",
      vars: { clientName: c.firstName, reference: dossier.reference, status, notes: "" },
      metadata: { visaDossierId: id },
    });
  }

  revalidatePath("/admin/visa");
}

export async function uploadVisaDocumentAction(formData: FormData) {
  const session = await requirePermission("visa:write");
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
  if (!dossier) return { error: "Dossier introuvable." };

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

  await prisma.visaDossier.update({
    where: { id },
    data: { documents: next as never },
  });

  await recordAudit({
    userId: session.sub,
    action: "visa.document_upload",
    entity: `visa:${id}`,
    metadata: { docName, publicId: asset.publicId },
  });

  revalidatePath("/admin/visa");
  return { ok: true };
}

export async function deleteVisaDossierAction(formData: FormData) {
  const session = await requirePermission("visa:delete");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const d = await prisma.visaDossier.findUnique({ where: { id } });
  if (!d) return;
  // Delete uploaded documents from Cloudinary
  const docs = Array.isArray(d.documents) ? (d.documents as Array<{ cloudinaryId?: string }>) : [];
  for (const doc of docs) {
    if (doc.cloudinaryId) {
      try { await deleteAsset(doc.cloudinaryId); } catch {}
    }
  }
  await prisma.visaDossier.delete({ where: { id } });
  await recordAudit({
    userId: session.sub,
    action: "visa.delete",
    entity: `visa:${id}`,
    metadata: { reference: d.reference },
  });
  revalidatePath("/admin/visa");
}

export { VISA_DESTINATIONS, REQUIRED_DOCS_BY_DESTINATION };
