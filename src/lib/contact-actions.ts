"use server";

import { ReservationSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notifyNewRequest } from "@/lib/communications-actions";
import {
  createAnonymousClientEmail,
  createReservationReference,
} from "@/lib/reservation-reference";

/**
 * Public contact form — same backing store as the offer and flight quote
 * flows (`Reservation` table with `source = CONTACT`).
 *
 * Idempotency: if the same email + same first 80 chars of the message
 * were submitted within the last 60 seconds, we short-circuit and return
 * the existing reservation reference. This protects against the
 * double-click race and against trivial spam, without being so strict
 * that a legitimate follow-up gets blocked.
 *
 * The contact action is intentionally the same shape as the others:
 *   - upsert Client by email (or create a `no-email-...` placeholder)
 *   - create a `Reservation` row with the canonical schema
 *   - dispatch a templated agency notification and persist its result
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
  const firstName = str(formData.get("firstName"));
  const lastName = str(formData.get("lastName"));
  const email = str(formData.get("email")).toLowerCase();
  const phone = str(formData.get("phone"));
  const subject = str(formData.get("subject")).slice(0, 160) || null;
  const destinationSlug = str(formData.get("destinationSlug")) || null;
  const offerSlug = str(formData.get("offerSlug")) || null;
  const message = str(formData.get("message"));

  if (!firstName || !lastName || !message) {
    return { ok: false, error: "Nom, prénom et message requis." };
  }
  if (!email && !phone) {
    return { ok: false, error: "Email ou téléphone requis pour vous recontacter." };
  }

  // Optional deep-link context: when /contact?destination=<slug> or
  // /contact?offer=<slug> is used, we route the lead to the right
  // destination/offer in the admin instead of treating it as a generic
  // contact form submission. Both are looked up defensively (no crash
  // if the slug was deleted since the link was generated).
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
    // Keep client creation and request creation atomic: a successful public
    // response can never leave an orphan Client without its unified request.
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
