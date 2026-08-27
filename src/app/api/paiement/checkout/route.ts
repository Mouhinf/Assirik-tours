import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  }

  const formData = await req.formData();
  const offerId = String(formData.get("offerId") ?? "");
  const email = String(formData.get("email") ?? "").trim();

  if (!offerId || !email) {
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  }

  const offer = await prisma.offer.findUnique({ where: { id: offerId }, include: { destination: true } });
  if (!offer) return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  // FCFA → EUR via taux fixe (les paiements internationaux passent en EUR)
  const eurEquivalent = Math.max(1, Math.round(offer.priceFCFA * 0.3 / 655.957));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [{
      price_data: {
        currency: "eur",
        product_data: {
          name: `Acompte 30% — ${offer.title}`,
          description: `${offer.destination.title} · Référence Assirik Tours`,
        },
        unit_amount: eurEquivalent * 100,
      },
      quantity: 1,
    }],
    success_url: `${baseUrl}/paiement/[slug]/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/paiement/${offer.slug}?canceled=1`,
    metadata: {
      offerId: offer.id,
      offerSlug: offer.slug,
      clientEmail: email,
      amountFCFA: String(Math.round(offer.priceFCFA * 0.3)),
    },
  });

  return NextResponse.redirect(session.url!, 303);
}
