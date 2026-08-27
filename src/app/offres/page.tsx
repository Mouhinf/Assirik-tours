import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { OfferCard } from "@/components/site/offer-card";
import { prisma } from "@/lib/prisma";
import { OFFER_KIND_LABELS_FR } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Offres & forfaits",
  description:
    "Séjours tout compris, circuits accompagnés, voyages sur mesure — toutes nos offres avec dates et disponibilités réelles.",
};

export default async function OffresPage() {
  const [offers, destinations] = await Promise.all([
    prisma.offer.findMany({
      where: { published: true },
      include: { destination: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.destination.findMany({
      where: { published: true },
      select: { id: true, slug: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  // Group offers by kind
  const grouped: Record<string, typeof offers> = {};
  for (const o of offers) {
    grouped[o.kind] ??= [];
    grouped[o.kind].push(o);
  }

  return (
    <>
      <PageHero
        eyebrow="Offres & forfaits"
        title="Des voyages prêts à réserver ou à personnaliser"
        description="Séjours, circuits et formules religieuses — ajustables en dates, en hébergements et en prestations. Tous les prix sont en FCFA, taxes incluses sauf mention contraire."
      />

      {/* Filter bar — link-based, no JS required */}
      <section className="container-narrow pb-6">
        <nav className="flex flex-wrap gap-2 text-sm" aria-label="Filtrer par type">
          <Link
            href="#tous"
            className="inline-flex items-center rounded-full bg-navy text-sand px-4 py-1.5 font-semibold"
          >
            Toutes ({offers.length})
          </Link>
          {Object.keys(grouped).map((kind) => (
            <Link
              key={kind}
              href={`#${kind}`}
              className="inline-flex items-center rounded-full border border-sand-deep bg-sand px-4 py-1.5 font-semibold text-navy hover:border-ocean hover:text-ocean transition-colors"
            >
              {OFFER_KIND_LABELS_FR[kind] ?? kind} ({grouped[kind].length})
            </Link>
          ))}
        </nav>
      </section>

      {offers.length === 0 ? (
        <section className="container-narrow pb-20">
          <div className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
            <p>Aucune offre publiée pour le moment.</p>
            <Link href="/contact" className="mt-3 inline-block text-sm font-semibold text-ocean hover:text-navy">
              Nous contacter pour un devis sur mesure →
            </Link>
          </div>
        </section>
      ) : (
        <section id="tous" className="container-narrow pb-16">
          <h2 className="font-display text-2xl font-semibold text-navy mb-6">
            Toutes les offres
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((o) => (
              <OfferCard
                key={o.id}
                slug={o.slug}
                title={o.title}
                summary={o.summary}
                kind={o.kind}
                priceFCFA={o.priceFCFA}
                durationDays={o.durationDays}
                destinationSlug={o.destination.slug}
                destinationTitle={o.destination.title}
                coverImageId={o.coverImageId}
              />
            ))}
          </div>
        </section>
      )}

      {/* By-kind sections (only if there's variation) */}
      {Object.keys(grouped).map((kind) => (
        <section key={kind} id={kind} className="container-narrow pb-12 scroll-mt-24">
          <h2 className="font-display text-2xl font-semibold text-navy mb-6">
            {OFFER_KIND_LABELS_FR[kind] ?? kind}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped[kind].map((o) => (
              <OfferCard
                key={o.id}
                slug={o.slug}
                title={o.title}
                summary={o.summary}
                kind={o.kind}
                priceFCFA={o.priceFCFA}
                durationDays={o.durationDays}
                destinationSlug={o.destination.slug}
                destinationTitle={o.destination.title}
                coverImageId={o.coverImageId}
              />
            ))}
          </div>
        </section>
      ))}

      <section className="container-narrow pb-20">
        <div className="rounded-xl bg-navy p-8 text-sand">
          <h2 className="font-display text-2xl font-semibold text-sand">
            Vous ne voyez pas votre destination ?
          </h2>
          <p className="mt-3 max-w-2xl text-mist/85">
            Toutes les offres sont ajustables. Vous voulez un autre hébergement, un autre aéroport de départ, un voyage combiné ? Parlez-en à un conseiller sur WhatsApp.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-sunrise-orange px-5 py-2.5 text-sm font-semibold text-navy hover:bg-sunrise-yellow transition-colors"
          >
            Demander un devis sur mesure →
          </Link>
        </div>
      </section>
    </>
  );
}
