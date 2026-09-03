"use server";

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

/**
 * Public contact form — same backing store as the offer and flight quote
 * flows (`Reservation` table with `source = CONTACT`).
 *
 * Spam protection:
 *  - Hidden honeypot field (`website_url`) — bots fill it, humans don't.
 *  - Per-(IP+email) rate limit (10 min window, 5 attempts, 30 min lockout).
 *  - Server-side email + phone format validation.
 *  - HTML stripped from free-text fields before persisting.
 *  - Idempotency dedup by email + message fingerprint (60s).
 */

export type ContactFormState =
  | { ok: true; reference: string }
  | { ok: false; error: string }
  | null;

function str(v: FormDataEntryValue | null): string {
  return v == null ? "" : String(v).trim();
}

const DEDUP_WINDOW_MS = 60 * 1000;

export async function submitContactAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  if (checkHoneypot(formData)) {
    // Silent success — don't tip off the bot.
    return { ok: true, reference: "AT-DISCARDED" };
  }

  const firstName = sanitizePlainText(str(formData.get("firstName")));
  const lastName = sanitizePlainText(str(formData.get("lastName")));
  const email = str(formData.get("email")).toLowerCase();
  const phone = str(formData.get("phone"));
  const subject = str(formData.get("subject")).slice(0, 160) || null;
  const destinationSlug = str(formData.get("destinationSlug")) || null;
  const offerSlug = str(formData.get("offerSlug")) || null;
  const message = sanitizePlainText(str(formData.get("message")));

  if (!firstName || !lastName || !message) {
    return { ok: false, error: "Nom, prénom et message requis." };
  }
  if (!email && !phone) {
    return { ok: false, error: "Email ou téléphone requis pour vous recontacter." };
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

  const rateKey = `contact|${email || phone}|${formData.get("_ip") ?? ""}`;
  const limited = formRateLimit(rateKey);
  if (!limited.ok) return { ok: false, error: limited.error };

  // Optional deep-link context
  const [{ destination }, { offer }] = await Promise.all([
    destinationSlug
      ? prisma.destination.findUnique({ where: { slug: destinationSlug }, select: { id: true, title: true } }).then((d) => ({ destination: d }))
      : Promise.resolve({ destination: null }),
    offerSlug
      ? prisma.offer.findUnique({ where: { slug: offerSlug }, select: { id: true, destinationId: true, title: true } }).then((o) => ({ offer: o }))
      : Promise.resolve({ offer: null }),
  ]);

  const isDestinationLead = Boolean(destination?.id);
  const isOfferLead = Boolean(offer?.id);
  const source = isOfferLead
    ? ReservationSource.OFFER
    : isDestinationLead
      ? ReservationSource.DESTINATION
      : ReservationSource.CONTACT;
  const enrichedSubject =
    subject ??
    (isOfferLead
      ? `Demande — ${offer!.title}`
      : isDestinationLead
        ? `Demande — ${destination!.title}`
        : null);
  const tagList = isOfferLead
    ? ["Contact", "Offre"]
    : isDestinationLead
      ? ["Contact", "Destination"]
      : ["Contact"];

  // Dedup: same author + same email + same message fingerprint in the last
  // 60s → return the existing reference instead of creating a duplicate.
  const fingerprint = message.slice(0, 80);
  const since = new Date(Date.now() - DEDUP_WINDOW_MS);
  if (email) {
    const recent = await prisma.reservation.findFirst({
      where: {
        source,
        createdAt: { gte: since },
        client: { email },
        notes: { startsWith: fingerprint },
        ...(destination?.id ? { destinationId: destination.id } : {}),
        ...(offer?.id ? { offerId: offer.id } : {}),
      },
      select: { reference: true },
      orderBy: { createdAt: "desc" },
    });
    if (recent) return { ok: true, reference: recent.reference };
  }

  const reference = createReservationReference();
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
        clientId: client.id,
        source,
        processingStatus: "NOUVEAU",
        subject: enrichedSubject,
        tags: tagList,
        destinationId: destination?.id ?? offer?.destinationId ?? null,
        offerId: offer?.id ?? null,
        travelers: 1,
        totalFCFA: 0,
        notes: message,
        status: "NOUVELLE",
      },
      select: { id: true, reference: true },
    });
  });

  await recordAudit({
    action: "public.contact.submit",
    metadata: { reference, source, hasEmail: Boolean(email) },
  });

  await notifyNewRequest({
    reservationId: reservation.id,
    reference: reservation.reference,
    source,
    clientName: `${firstName} ${lastName}`,
    clientEmail: email,
    clientPhone: phone,
    subject: enrichedSubject,
    details: message,
  });

  return { ok: true, reference: reservation.reference };
}
