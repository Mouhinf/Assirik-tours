import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { DestinationCard } from "@/components/site/destination-card";
import { prisma } from "@/lib/prisma";
import { REGION_LABELS_FR } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Circuits au Sénégal (Lac Rose, Gorée, Casamance, Saly, Lompoul, Saint-Louis) et voyages internationaux : Omra, Maroc, Turquie, Dubaï, Europe.",
};

export default async function DestinationsPage() {
  const destinations = await prisma.destination.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
  });

  // Group by region for editorial flow
  const senegal = destinations.filter((d) =>
    ["DAKAR", "NIAYES", "PETITE_COTE", "CASAMANCE", "SENEGAL_ORIENTAL", "SAINT_LOUIS"].includes(d.region),
  );
  const international = destinations.filter((d) =>
    ["AFRIQUE_OUEST", "EUROPE", "MOYEN_ORIENT", "ASIE", "AMERIQUE"].includes(d.region),
  );

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="Du Sénégal au reste du monde"
        description="Circuits accompagnés et séjours sur mesure, sélectionnés par notre équipe pour leur rapport authenticité, confort et budget."
      />

      <section className="container-narrow pb-12">
        <header className="flex items-end justify-between gap-4 mb-6">
          <h2 className="font-display text-2xl font-semibold text-navy">
            Sénégal
          </h2>
          <p className="text-sm text-graphite">{senegal.length} destinations</p>
        </header>
        {senegal.length === 0 ? (
          <p className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
            Le catalogue est en cours d&apos;enrichissement. Contactez-nous pour un devis sur-mesure.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {senegal.map((d) => (
              <DestinationCard
                key={d.id}
                slug={d.slug}
                title={d.title}
                region={d.region}
                summary={d.summary}
                heroImageId={d.heroImageId}
              />
            ))}
          </div>
        )}
      </section>

      <section className="container-narrow pb-20">
        <header className="flex items-end justify-between gap-4 mb-6">
          <h2 className="font-display text-2xl font-semibold text-navy">
            International
          </h2>
          <p className="text-sm text-graphite">{international.length} destinations</p>
        </header>
        {international.length === 0 ? (
          <p className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
            Prochainement.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {international.map((d) => (
              <DestinationCard
                key={d.id}
                slug={d.slug}
                title={d.title}
                region={d.region}
                summary={d.summary}
                heroImageId={d.heroImageId}
              />
            ))}
          </div>
        )}
      </section>

      <section className="container-narrow pb-20">
        <div className="rounded-xl bg-navy p-8 md:p-12 text-sand">
          <h2 className="font-display text-2xl font-semibold text-sand">
            Pas trouvé votre destination ?
          </h2>
          <p className="mt-3 max-w-2xl text-mist/85">
            Nous organisons aussi des séjours sur mesure vers des centaines d&apos;endroits :
            Europe, Caraïbes, Asie du Sud-Est, sous-continent indien. Décrivez-nous votre projet, un conseiller vous répond sous 24h.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-sunrise-orange px-5 py-2.5 text-sm font-semibold text-navy hover:bg-sunrise-yellow transition-colors"
            >
              Demander un devis sur mesure
            </Link>
            <Link
              href="/offres"
              className="inline-flex items-center gap-2 rounded-full border border-mist/40 px-5 py-2.5 text-sm font-semibold text-mist hover:border-sunrise-yellow hover:text-sunrise-yellow transition-colors"
            >
              Voir les offres
            </Link>
          </div>
          <p className="mt-6 text-xs text-mist/70">
            Régions couvertes : {Object.keys(REGION_LABELS_FR).length}
          </p>
        </div>
      </section>
    </>
  );
}
