"use server";

import { redirect } from "next/navigation";
import { ReservationSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notifyNewRequest } from "@/lib/communications-actions";
import {
  createAnonymousClientEmail,
  createReservationReference,
} from "@/lib/reservation-reference";
import { recordAudit } from "@/lib/audit";
import {
  checkHoneypot,
  EMAIL_RE,
  isPlausibleInput,
  isValidPhone,
  formRateLimit,
  sanitizePlainText,
} from "@/lib/validators/public-forms";

export type OfferDevisState =
  | { ok: true; reference: string }
  | { ok: false; error: string }
  | null;

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function toIntOrZero(v: FormDataEntryValue | null): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function dateOrNull(v: FormDataEntryValue | null): Date | null {
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export async function submitOfferDevisAction(
  _prev: OfferDevisState,
  formData: FormData,
): Promise<OfferDevisState> {
  if (checkHoneypot(formData)) {
    // Bot — discard and pretend success.
    const fakeRef = "AT-DISCARDED";
    redirect(`/offres/${str(formData.get("offerSlug"))}/devis/merci?ref=${encodeURIComponent(fakeRef)}`);
  }

  const offerSlug = str(formData.get("offerSlug"));
  if (!offerSlug) return { ok: false, error: "Offre inconnue." };

  const rateKey = `offer-devis|${offerSlug}|${str(formData.get("email")).toLowerCase()}`;
  const limited = formRateLimit(rateKey);
  if (!limited.ok) return { ok: false, error: limited.error };

  const offer = await prisma.offer.findUnique({
    where: { slug: offerSlug },
    select: {
      id: true,
      title: true,
      destinationId: true,
      startDate: true,
      priceFCFA: true,
      published: true,
    },
  });
  if (!offer || !offer.published) {
    return { ok: false, error: "Cette offre n'est pas disponible." };
  }

  const firstName = sanitizePlainText(str(formData.get("firstName")));
  const lastName = sanitizePlainText(str(formData.get("lastName")));
  const email = str(formData.get("email")).toLowerCase();
  const phone = str(formData.get("phone"));
  const travelers = toIntOrZero(formData.get("travelers"));
  const startDate = dateOrNull(formData.get("startDate")) ?? offer.startDate;
  const message = sanitizePlainText(str(formData.get("message")));

  if (!firstName || !lastName) {
    return { ok: false, error: "Nom et prénom sont requis." };
  }
  if (!email && !phone) {
    return { ok: false, error: "Email ou téléphone requis pour vous recontacter." };
  }
  if (!message) {
    return { ok: false, error: "Décrivez votre projet en quelques mots." };
  }
  if (!isPlausibleInput(message, 4000)) {
    return { ok: false, error: "Message trop long ou caractères invalides." };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { ok: false, error: "Adresse email invalide." };
  }
  if (phone && !isValidPhone(phone)) {
    return { ok: false, error: "Numéro de téléphone invalide." };
  }

  const reference = createReservationReference();
  const notes = `Devis pour offre : ${offer.title}\n\n${message}`;
  const reservation = await prisma.$transaction(async (tx) => {
    const client = email
      ? await tx.client.upsert({
          where: { email },
          create: { firstName, lastName, email, phone, notes: message },
          update: { firstName, lastName, phone },
        })
      : await tx.client.create({
          data: {
            firstName,
            lastName,
            email: createAnonymousClientEmail(),
            phone,
            notes: message,
          },
        });

    return tx.reservation.create({
      data: {
        reference,
        status: "NOUVELLE",
        processingStatus: "NOUVEAU",
        source: ReservationSource.OFFER,
        subject: `Devis — ${offer.title}`,
        tags: ["Offre"],
        clientId: client.id,
        offerId: offer.id,
        destinationId: offer.destinationId,
        travelers,
        startDate,
        totalFCFA: 0,
        notes,
      },
      select: { id: true, reference: true },
    });
  });

  await recordAudit({
    action: "public.offer.devis.submit",
    metadata: { reference, offerSlug, hasEmail: Boolean(email) },
  });

  await notifyNewRequest({
    reservationId: reservation.id,
    reference: reservation.reference,
    source: ReservationSource.OFFER,
    clientName: `${firstName} ${lastName}`,
    clientEmail: email,
    clientPhone: phone,
    subject: `Devis — ${offer.title}`,
    details: [
      `Voyageurs : ${travelers}`,
      `Départ souhaité : ${startDate ? startDate.toISOString().slice(0, 10) : "—"}`,
      "",
      message,
    ].join("\n"),
  });

  redirect(`/offres/${offerSlug}/devis/merci?ref=${encodeURIComponent(reservation.reference)}`);
}
