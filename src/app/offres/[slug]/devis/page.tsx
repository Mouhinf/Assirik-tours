import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { prisma } from "@/lib/prisma";
import { OfferDevisForm } from "@/components/site/offer-devis-form";
import { formatFCFA } from "@/lib/utils";
import { OFFER_KIND_LABELS_FR, REGION_LABELS_FR } from "@/lib/regions";
import { computePromo } from "@/lib/offer-promo";

type Params = Promise<{ slug: string }>;

export const metadata: Metadata = {
  title: "Demander un devis",
  robots: { index: false, follow: false },
};

export default async function OfferDevisPage({ params }: { params: Params }) {
  const { slug } = await params;
  const offer = await prisma.offer.findUnique({
    where: { slug },
    include: { destination: true },
  });
  if (!offer || !offer.published) notFound();

  const promo = computePromo({
    priceFCFA: offer.priceFCFA,
    promoPriceFCFA: offer.promoPriceFCFA,
    promoEndsAt: offer.promoEndsAt,
  });

  const defaultStartDate = offer.startDate
    ? offer.startDate.toISOString().slice(0, 10)
    : null;

  return (
    <>
      <PageHero
        eyebrow="Devis"
        title={offer.title}
        description={`Renseignez votre projet — un conseiller vous rappelle sous 24h ouvrées avec une première estimation pour l'offre « ${offer.title} ».`}
      />

      <section className="container-narrow pb-12">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12">
          <OfferDevisForm
            offerSlug={offer.slug}
            offerTitle={offer.title}
            defaultStartDate={defaultStartDate}
            defaultTravelers={offer.maxGuests ? Math.min(2, offer.maxGuests) : 2}
          />

          <aside>
            <div className="sticky top-24 rounded-xl border border-sand-deep bg-sand p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-graphite">
                Offre sélectionnée
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-navy">
                {offer.title}
              </h2>
              <p className="mt-2 text-sm text-graphite">{offer.summary}</p>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-graphite">
                À partir de
              </p>
              <div className="mt-1 flex items-baseline gap-3">
                {promo.isActive ? (
                  <>
                    <span className="font-display text-3xl font-semibold text-sunrise-coral">
                      {formatFCFA(promo.currentPriceFCFA)}
                    </span>
                    <span className="text-sm text-graphite line-through">
                      {formatFCFA(promo.originalPriceFCFA)}
                    </span>
                  </>
                ) : (
                  <span className="font-display text-3xl font-semibold text-navy">
                    {formatFCFA(offer.priceFCFA)}
                  </span>
                )}
              </div>
              <p className="text-xs text-graphite">par personne, taxes incluses</p>

              <dl className="mt-6 space-y-3 text-sm">
                <Row label="Type" value={OFFER_KIND_LABELS_FR[offer.kind] ?? offer.kind} />
                {offer.durationDays ? (
                  <Row label="Durée" value={`${offer.durationDays} jours`} />
                ) : null}
                <Row label="Destination" value={offer.destination.title} />
                <Row label="Région" value={REGION_LABELS_FR[offer.destination.region] ?? offer.destination.region} />
                <Row
                  label="Disponibilité"
                  value={
                    offer.availabilityType === "FIXED_STOCK"
                      ? `Places limitées${offer.stock != null ? ` (${offer.stock} restantes)` : ""}`
                      : "Sur demande"
                  }
                />
              </dl>

              <Link
                href={`/offres/${offer.slug}`}
                className="mt-5 block text-center text-xs font-semibold text-ocean hover:text-navy"
              >
                ← Retour à la fiche offre
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-sand-deep/60 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-graphite">{label}</dt>
      <dd className="text-sm text-navy font-medium text-right">{value}</dd>
    </div>
  );
}
