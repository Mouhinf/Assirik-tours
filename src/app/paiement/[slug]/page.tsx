import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripeEnabled } from "@/lib/stripe";
import { formatFCFA } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Paiement — ${slug}`,
    description: "Réglez votre acompte par carte bancaire en toute sécurité.",
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

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
          {/* Honeypot — hidden from humans, attracts bots. */}
          <input
            type="text"
            name="website_url"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] w-px h-px opacity-0"
            defaultValue=""
          />
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
        <div className="mt-6 rounded-xl bg-sand-deep/30 border border-sand-deep p-4 space-y-3">
          <p className="text-sm text-graphite leading-relaxed">
            <strong className="text-navy">Le paiement en ligne n&apos;est pas encore activé.</strong> Pour réserver cette offre, contactez-nous via WhatsApp ou par téléphone — nous vous confirmerons la disponibilité et les modalités de paiement (virement, Wave, Orange Money, paiement à l&apos;agence).
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`https://wa.me/221775495314?text=${encodeURIComponent(
                `Bonjour Assirik Tours, je souhaite réserver l'offre « ${offer.title} ».`,
              )}`}
              className="inline-flex items-center rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1ebe5b]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Réserver sur WhatsApp
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-ocean"
            >
              Nous contacter
            </Link>
          </div>
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
