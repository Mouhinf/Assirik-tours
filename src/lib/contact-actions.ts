"use server";

import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { whatsappLink } from "@/lib/whatsapp";
import { notifyAgency } from "@/lib/communications-actions";

export type ContactFormState =
  | { ok: true; reference: string }
  | { ok: false; error: string }
  | null;

function makeReference() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `AT-${year}-${rand}`;
}

export async function submitContactAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!firstName || !lastName || !message) {
    return { ok: false, error: "Nom, prénom et message requis." };
  }
  if (!email && !phone) {
    return { ok: false, error: "Email ou téléphone requis pour vous recontacter." };
  }

  // Upsert client by email (if provided) so we don't duplicate contacts
  let client;
  if (email) {
    client = await prisma.client.upsert({
      where: { email },
      create: { firstName, lastName, email, phone, notes: message },
      update: { firstName, lastName, phone },
    });
  } else {
    client = await prisma.client.create({
      data: { firstName, lastName, email: `no-email-${Date.now()}@assirik.local`, phone, notes: message },
    });
  }

  const reference = makeReference();
  await prisma.reservation.create({
    data: {
      reference,
      clientId: client.id,
      travelers: 1,
      totalFCFA: 0,
      notes: message,
      status: "NOUVELLE",
    },
  });

  // Notify agency by email (best-effort, non-blocking).
  void notifyAgency({
    templateId: "contact.form_submitted",
    vars: { firstName, lastName, email, phone, message },
    metadata: { reference },
  });

  return { ok: true, reference };
}