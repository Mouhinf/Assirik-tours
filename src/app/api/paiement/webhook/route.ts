import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { recordAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/paiement/webhook
 *
 * Stripe sends `checkout.session.completed` (and the related
 * `payment_intent.succeeded`) once a Checkout session settles. We:
 *  1. Verify the signature with `STRIPE_WEBHOOK_SECRET`.
 *  2. Dedupe by `checkoutSessionId` (idempotency).
 *  3. Create / update a `Reservation` with `status = PAYEE` and the offer
 *     snapshot pulled from the session metadata.
 *  4. Notify the agency via the standard notifications pipeline.
 *
 * The route never reads the success-page query string; without the webhook
 * a paying customer could otherwise bypass payment by visiting
 * `/paiement/<slug>/success?session_id=fake` directly.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  const payload = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (e) {
    console.error("[webhook] bad signature", e);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "payment_intent.succeeded"
  ) {
    // Acknowledge uninteresting events so Stripe stops retrying.
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session =
    event.type === "checkout.session.completed"
      ? (event.data.object as import("stripe").Stripe.Checkout.Session)
      : (await stripe.checkout.sessions.list({
          payment_intent:
            typeof event.data.object === "object" && event.data.object
              ? (event.data.object as import("stripe").Stripe.PaymentIntent).id
              : undefined,
          limit: 1,
        })).data[0];
  if (!session) {
    return NextResponse.json({ error: "Session introuvable." }, { status: 404 });
  }

  const meta = (session.metadata ?? {}) as Record<string, string>;
  const offerId = meta.offerId;
  const offerSlug = meta.offerSlug;
  const amountFCFA = Number(meta.amountFCFA ?? 0);
  const email = meta.clientEmail || session.customer_details?.email || "";
  const name = meta.clientName || session.customer_details?.name || "";
  const firstName = name.split(" ")[0] || "Client";
  const lastName = name.split(" ").slice(1).join(" ") || "Assirik";

  if (!offerId || !email) {
    return NextResponse.json({ error: "Métadonnées incomplètes." }, { status: 400 });
  }

  // Idempotency: if a reservation already references this Stripe session,
  // do nothing.
  const existing = await prisma.reservation.findFirst({
    where: { tags: { has: `stripe:${session.id}` } },
    select: { id: true, reference: true },
  });
  if (existing) {
    return NextResponse.json({ received: true, reference: existing.reference });
  }

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer) {
    return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
  }

  const reservation = await prisma.$transaction(async (tx) => {
    const client = await tx.client.upsert({
      where: { email },
      create: {
        firstName,
        lastName,
        email,
        phone: "",
        notes: "Paiement Stripe",
      },
      update: { firstName, lastName },
    });
    return tx.reservation.create({
      data: {
        reference: meta.reference ?? generateReference(),
        clientId: client.id,
        source: "OFFER",
        status: "PAYEE",
        processingStatus: "NOUVEAU",
        subject: `Paiement en ligne — ${offer.title}`,
        tags: ["Offre", "Stripe", `stripe:${session.id}`],
        offerId: offer.id,
        destinationId: offer.destinationId,
        travelers: 1,
        totalFCFA: amountFCFA || offer.priceFCFA,
        notes: `Stripe session ${session.id}`,
      },
    });
  });

  try {
    const { dispatchTemplate } = await import("@/lib/communications-actions");
    await dispatchTemplate({
      templateId: "payment.received",
      channel: "email",
      to: email,
      toName: `${firstName} ${lastName}`,
      vars: {
        reference: reservation.reference,
        offerTitle: offer.title,
        amountFCFA: String(reservation.totalFCFA),
      },
    });
  } catch (e) {
    console.error("[webhook] notify failed", e);
  }

  await recordAudit({
    action: "payment.received",
    entity: `reservation:${reservation.id}`,
    metadata: { stripeSessionId: session.id, offerSlug, amountFCFA: reservation.totalFCFA },
  });

  return NextResponse.json({ received: true, reference: reservation.reference });
}

function generateReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `AT-${year}-${rand}`;
}
