import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripeEnabled } from "@/lib/stripe";
import { formatFCFA } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export const metadata: Metadata = {
  title: "Paiement",
  description: "Réglez votre acompte par carte bancaire (Stripe, mode test).",
};

export default async function PaymentPage({ params }: { params: Params }) {
  const { slug } = await params;
  const offer = await prisma.offer.findUnique({
    where: { slug },
    include: { destination: true },
  });
  if (!offer) notFound();

  const enabled = stripeEnabled();

  return (
    <section className="container-narrow py-16 max-w-2xl">
      <Link href={`/offres/${slug}`} className="text-sm text-ocean hover:text-navy">
        ← Retour à l&apos;offre
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-navy">
        Paiement par carte
      </h1>
      <p className="mt-2 text-graphite">
        Vous réglez un acompte de 30% pour confirmer la réservation {offer.title} ({offer.destination.title}).
      </p>

      <div className="mt-8 rounded-xl border border-sand-deep bg-sand p-6 space-y-4">
        <Row label="Offre" value={offer.title} />
        <Row label="Destination" value={offer.destination.title} />
        <Row label="Total" value={formatFCFA(offer.priceFCFA)} />
        <Row label="Acompte (30%)" value={formatFCFA(Math.round(offer.priceFCFA * 0.3))} accent />
      </div>

      {enabled ? (
        <form action="/api/paiement/checkout" method="POST" className="mt-6 space-y-3">
          <input type="hidden" name="offerId" value={offer.id} />
          <input
            name="email"
            type="email"
            required
            placeholder="Votre email pour le reçu"
            className="w-full rounded-lg border border-sand-deep bg-sand-deep/40 px-3 py-2.5 text-sm text-navy"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-[#635BFF] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4f47d4] transition-colors"
          >
            Payer avec Stripe →
          </button>
          <p className="text-xs text-silver text-center">
            Mode test — utilisez la carte <code className="font-mono">4242 4242 4242 4242</code>, n&apos;importe quelle date future, n&apos;importe quel CVC.
          </p>
        </form>
      ) : (
        <div className="mt-6 rounded-xl bg-sand-deep/30 border border-sand-deep p-4">
          <p className="text-sm text-graphite leading-relaxed">
            <strong className="text-navy">Stripe n&apos;est pas encore configuré</strong> sur cet environnement.
            Pour activer le paiement en ligne, ajoutez <code className="font-mono">STRIPE_SECRET_KEY</code> et{" "}
            <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> dans les variables d&apos;environnement Vercel.
          </p>
          <p className="mt-3 text-sm text-graphite">
            Pour l&apos;instant, vous pouvez régler votre acompte par virement bancaire, en espèces à l&apos;agence, ou via Wave / Orange Money (Phase 2).
          </p>
        </div>
      )}
    </section>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-sand-deep pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-graphite">{label}</dt>
      <dd className={`text-sm font-medium text-right ${accent ? "text-sunrise-coral font-semibold text-base" : "text-navy"}`}>
        {value}
      </dd>
    </div>
  );
}
