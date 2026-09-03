import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { EMAIL_RE, formRateLimit, checkHoneypot } from "@/lib/validators/public-forms";
import { recordAudit } from "@/lib/audit";

/**
 * POST /api/paiement/checkout
 *
 * Creates a Stripe Checkout session for a published offer. Pre-flight checks:
 *  - Honeypot (discard silently if filled).
 *  - Per-(offerSlug+email) rate-limit (5 attempts / 10 min).
 *  - Email format validation.
 *  - Origin/Referer allow-list (must match `NEXT_PUBLIC_SITE_URL` or fall back to
 *    the request origin in dev). This protects against cross-origin CSRF
 *    POSTs that would otherwise create a legitimate Stripe session with the
 *    attacker's email and a real `offerId`.
 *  - Offer must exist and be published.
 *
 * The Stripe session carries the offerId, offerSlug, clientEmail and amount
 * (in FCFA) in `metadata`, so the webhook can reconcile the reservation
 * without trusting the success-page query params.
 */
export async function POST(req: Request) {
  // 1. Origin / Referer allow-list.
  if (!isOriginAllowed(req)) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }

  // 2. Read form data (Stripe's hosted button is plain form-encoded).
  const formData = await req.formData();
  if (checkHoneypot(formData)) {
    // Silent 303 to a benign URL — looks like success but no session created.
    return NextResponse.redirect(new URL("/", req.url), 303);
  }

  const offerId = String(formData.get("offerId") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();

  if (!offerId || !email) {
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  // 3. Rate-limit per (offerSlug|email).
  const limited = formRateLimit(`checkout|${offerId}|${email}`);
  if (!limited.ok) {
    return NextResponse.json({ error: limited.error }, { status: 429 });
  }

  // 4. Offer must exist and be published.
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { destination: true },
  });
  if (!offer || !offer.published) {
    return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
  }

  // 5. Stripe availability.
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Paiement en ligne indisponible." }, { status: 503 });
  }

  // 6. FCFA → EUR at a fixed internal rate (the booking is reconciled in
  // FCFA in the DB; the EUR amount is just the actual charge).
  const eurEquivalent = Math.max(1, Math.round((offer.priceFCFA * 0.3) / 655.957));

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Acompte 30% — ${offer.title}`,
              description: `${offer.destination.title} · Référence Assirik Tours`,
            },
            unit_amount: eurEquivalent * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/paiement/${offer.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/paiement/${offer.slug}?canceled=1`,
      metadata: {
        offerId: offer.id,
        offerSlug: offer.slug,
        clientEmail: email,
        clientName: name,
        amountFCFA: String(Math.round(offer.priceFCFA * 0.3)),
      },
    });

    await recordAudit({
      action: "public.checkout.create",
      metadata: { offerId: offer.id, offerSlug: offer.slug, email, stripeSessionId: session.id },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe n'a pas renvoyé d'URL." }, { status: 502 });
    }
    return NextResponse.redirect(session.url, 303);
  } catch (e) {
    console.error("[checkout] stripe error", e);
    return NextResponse.json({ error: "Erreur lors de la création du paiement." }, { status: 502 });
  }
}

function isOriginAllowed(req: Request): boolean {
  const expected = process.env.NEXT_PUBLIC_SITE_URL;
  // In development / local, fall back to the request's own origin so the
  // checkout still works without setting the env var. In production this
  // branch is dead — NEXT_PUBLIC_SITE_URL must be set.
  if (!expected) {
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    return false;
  }
  const origin = req.headers.get("origin");
  if (origin) return origin === expected || origin === expected.replace(/\/$/, "");
  // No Origin header (e.g. server-to-server or curl). Allow same-origin
  // Referer as a fallback.
  const referer = req.headers.get("referer");
  if (referer && referer.startsWith(expected)) return true;
  return false;
}
