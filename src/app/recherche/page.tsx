import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { DestinationCard } from "@/components/site/destination-card";
import { OfferCard } from "@/components/site/offer-card";
import { prisma } from "@/lib/prisma";
import { REGION_LABELS_FR, OFFER_KIND_LABELS_FR } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Recherche",
  description: "Trouvez votre prochain voyage depuis Dakar : destinations, offres, par budget, durée ou type.",
};

const REGIONS = Object.keys(REGION_LABELS_FR);
const KINDS = Object.keys(OFFER_KIND_LABELS_FR);

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    region?: string;
    kind?: string;
    min?: string;
    max?: string;
    duration?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const region = REGIONS.includes(sp.region ?? "") ? sp.region : undefined;
  const kind = KINDS.includes(sp.kind ?? "") ? sp.kind : undefined;
  const min = Number(sp.min) || 0;
  const max = Number(sp.max) || 0;

  const [destinations, offers] = await Promise.all([
    prisma.destination.findMany({
      where: {
        published: true,
        ...(region ? { region: region as never } : {}),
        ...(q ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
          ],
        } : {}),
      },
      orderBy: { featured: "desc" },
    }),
    prisma.offer.findMany({
      where: {
        published: true,
        ...(kind ? { kind: kind as never } : {}),
        ...(min ? { priceFCFA: { gte: min } } : {}),
        ...(max ? { priceFCFA: { lte: max } } : {}),
        ...(sp.duration ? {
          durationDays: sp.duration === "1-3" ? { gte: 1, lte: 3 } :
            sp.duration === "4-7" ? { gte: 4, lte: 7 } :
            sp.duration === "8-14" ? { gte: 8, lte: 14 } :
            { gte: 15 },
        } : {}),
        ...(q ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
          ],
        } : {}),
      },
      include: { destination: true },
      orderBy: { priceFCFA: "asc" },
    }),
  ]);

  const hasFilters = !!(q || region || kind || min || max || sp.duration);

  return (
    <>
      <PageHero
        eyebrow="Recherche"
        title="Trouvez votre prochain voyage"
        description="Filtrez par destination, type de voyage, budget ou durée. Les résultats se mettent à jour sans rechargement."
      />

      <section className="container-narrow pb-12">
        <form className="rounded-xl border border-sand-deep bg-sand p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">Mot-clé</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Omra, Schengen, Casamance…"
              className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">Région</span>
            <select name="region" defaultValue={region ?? ""} className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy">
              <option value="">Toutes</option>
              {REGIONS.map((r) => <option key={r} value={r}>{REGION_LABELS_FR[r]}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">Type</span>
            <select name="kind" defaultValue={kind ?? ""} className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy">
              <option value="">Tous</option>
              {KINDS.map((k) => <option key={k} value={k}>{OFFER_KIND_LABELS_FR[k]}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">Durée</span>
            <select name="duration" defaultValue={sp.duration ?? ""} className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy">
              <option value="">Indifférent</option>
              <option value="1-3">1-3 jours</option>
              <option value="4-7">4-7 jours</option>
              <option value="8-14">8-14 jours</option>
              <option value="15+">15+ jours</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">Budget min (FCFA)</span>
            <input name="min" type="number" min="0" defaultValue={min || ""} placeholder="0" className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">Budget max (FCFA)</span>
            <input name="max" type="number" min="0" defaultValue={max || ""} placeholder="∞" className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy" />
          </label>
          <div className="flex items-end gap-2 col-span-2 lg:col-span-2">
            <button type="submit" className="rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors">
              Filtrer
            </button>
            <Link href="/recherche" className="rounded-full border border-sand-deep px-4 py-2.5 text-sm font-semibold text-graphite hover:text-navy transition-colors">
              Réinitialiser
            </Link>
          </div>
        </form>
      </section>

      <section className="container-narrow pb-12">
        <header className="flex items-end justify-between gap-4 mb-6">
          <h2 className="font-display text-2xl font-semibold text-navy">
            Destinations ({destinations.length})
          </h2>
        </header>
        {destinations.length === 0 ? (
          <p className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
            {hasFilters ? "Aucune destination ne correspond." : "Catalogue en cours d'enrichissement."}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((d) => (
              <DestinationCard key={d.id} slug={d.slug} title={d.title} region={d.region} summary={d.summary} heroImageId={d.heroImageId} />
            ))}
          </div>
        )}
      </section>

      <section className="container-narrow pb-20">
        <header className="flex items-end justify-between gap-4 mb-6">
          <h2 className="font-display text-2xl font-semibold text-navy">
            Offres ({offers.length})
          </h2>
        </header>
        {offers.length === 0 ? (
          <p className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
            {hasFilters ? "Aucune offre ne correspond à ces critères." : "Aucune offre publiée pour l'instant."}
          </p>
        ) : (
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
        )}
      </section>
    </>
  );
}
