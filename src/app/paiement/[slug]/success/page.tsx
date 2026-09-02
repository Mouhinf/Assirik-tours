import Link from "next/link";
import { ReservationSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { createReservationReference } from "@/lib/reservation-reference";

type Params = Promise<{ slug: string }>;
type SP = Promise<{ session_id?: string }>;

export default async function PaymentSuccessPage({ params, searchParams }: { params: Params; searchParams: SP }) {
  const { slug } = await params;
  const sp = await searchParams;
  const sessionId = sp.session_id;

  let paymentOk = false;
  if (sessionId) {
    const stripe = getStripe();
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        paymentOk = session.payment_status === "paid";
        if (paymentOk) {
          // Persist as a reservation if not already
          const offer = await prisma.offer.findUnique({ where: { slug }, include: { destination: true } });
          if (offer) {
            const email = session.customer_email ?? session.metadata?.clientEmail;
            if (email) {
              const client = await prisma.client.upsert({
                where: { email },
                create: {
                  firstName: "—",
                  lastName: "—",
                  email,
                  phone: "",
                },
                update: {},
              });
              const stripeTag = `stripe:${session.id}`;
              const existing = await prisma.reservation.findFirst({
                where: { tags: { has: stripeTag } },
                select: { id: true },
              });
              if (!existing) {
                await prisma.reservation.create({
                  data: {
                    reference: createReservationReference(),
                    clientId: client.id,
                    offerId: offer.id,
                    destinationId: offer.destinationId,
                    source: ReservationSource.OFFER,
                    processingStatus: "NOUVEAU",
                    subject: `Paiement — ${offer.title}`,
                    travelers: 1,
                    totalFCFA: Number(session.metadata?.amountFCFA ?? Math.round(offer.priceFCFA * 0.3)),
                    status: "PAYEE",
                    tags: ["Offre", "Paiement", stripeTag],
                    notes: `Stripe session ${session.id}`,
                  },
                });
              }
            }
          }
        }
      } catch (e) {
        console.error("Stripe retrieval failed", e);
      }
    }
  }

  return (
    <section className="container-narrow py-20 max-w-2xl text-center">
      {paymentOk ? (
        <>
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold text-navy">Paiement reçu ✓</h1>
          <p className="mt-3 text-graphite">
            Merci — un conseiller Assirik Tours vous contacte dans les 24h ouvrées avec votre facture et les prochaines étapes.
          </p>
          <Link href="/" className="mt-6 inline-block rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors">
            Retour à l&apos;accueil
          </Link>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl font-semibold text-navy">Paiement en attente</h1>
          <p className="mt-3 text-graphite">
            Le paiement n&apos;a pas encore été confirmé. Si vous avez été débité, contactez-nous sur WhatsApp.
          </p>
          <Link href={`/offres/${slug}`} className="mt-6 inline-block text-sm font-semibold text-ocean hover:text-navy">
            Retour à l&apos;offre →
          </Link>
        </>
      )}
    </section>
  );
}
