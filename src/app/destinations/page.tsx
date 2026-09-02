import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { DestinationCard } from "@/components/site/destination-card";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { DestinationRegion } from "@prisma/client";
import { getActiveRegions } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Circuits au Sénégal (Lac Rose, Gorée, Casamance, Saly, Lompoul, Saint-Louis) et voyages internationaux : Omra, Maroc, Turquie, Dubaï, Europe.",
};

type SearchParams = {
  region?: string;       // Region.id (cuid) — preferred
  regionLegacy?: string; // Legacy DestinationRegion enum key — backward compat
  q?: string;
  startDate?: string;
  sort?: string;
  page?: string;
};

const PAGE_SIZE = 12;

const SORT_LABEL: Record<string, string> = {
  featured: "Mis en avant d'abord",
  name: "Nom (A → Z)",
  recent: "Plus récentes",
};

const SORT_MAP: Record<string, Array<Record<string, string>>> = {
  featured: [{ featured: "desc" }, { homeOrder: "asc" }, { title: "asc" }],
  name: [{ title: "asc" }],
  recent: [{ createdAt: "desc" }],
};

function buildHref(overrides: Partial<SearchParams>) {
  const params = new URLSearchParams();
  const merged: SearchParams = {
    region: overrides.region,
    regionLegacy: overrides.regionLegacy,
    q: overrides.q,
    startDate: overrides.startDate,
    sort: overrides.sort,
    page: overrides.page,
  };
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/destinations?${qs}` : "/destinations";
}

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const startDate = sp.startDate ? new Date(sp.startDate) : undefined;
  const sortKey = sp.sort && SORT_MAP[sp.sort] ? sp.sort : "featured";
  const pageNum = Math.max(1, Number(sp.page) || 1);

  const regions = await getActiveRegions();
  const regionById = sp.region ? regions.find((r) => r.id === sp.region) : undefined;
  const regionByLegacy = sp.regionLegacy
    ? regions.find((r) => r.legacyEnumKeys.includes(sp.regionLegacy!))
    : undefined;
  const activeRegion = regionById ?? regionByLegacy;

  // Build the where clause as a typed object so TS can narrow it cleanly.
  const where: Prisma.DestinationWhereInput = {
    published: true,
    ...(activeRegion
      ? {
          OR: [
            { customRegionId: activeRegion.id },
            ...(activeRegion.legacyEnumKeys.length > 0
              ? [{ region: { in: activeRegion.legacyEnumKeys as DestinationRegion[] } }]
              : []),
          ],
        }
      : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(startDate && !isNaN(startDate.getTime())
      ? {
          offers: {
            some: {
              published: true,
              OR: [
                { endDate: { gte: startDate } },
                { startDate: null, endDate: null },
              ],
            },
          },
        }
      : {}),
  };

  const [total, destinations] = await Promise.all([
    prisma.destination.count({ where }),
    prisma.destination.findMany({
      where,
      orderBy: SORT_MAP[sortKey],
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const activeFilters = [
    activeRegion && `Région : ${activeRegion.labelFr}`,
    q && `Mot-clé : « ${q} »`,
    startDate && !isNaN(startDate.getTime())
      ? `À partir du ${startDate.toLocaleDateString("fr-FR")}`
      : null,
    sortKey !== "featured" && `Tri : ${SORT_LABEL[sortKey]}`,
  ].filter(Boolean) as string[];

  // Group by Senegal / International for editorial flow when no region filter.
  // When filtering by a single region, we render a single section.
  const senegal = destinations.filter((d) =>
    ["DAKAR", "NIAYES", "PETITE_COTE", "CASAMANCE", "SENEGAL_ORIENTAL", "SAINT_LOUIS"].includes(d.region),
  );
  const international = destinations.filter((d) =>
    ["AFRIQUE_OUEST", "EUROPE", "MOYEN_ORIENT", "ASIE", "AMERIQUE"].includes(d.region),
  );
  const showGroups = !activeRegion && !q;

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="Du Sénégal au reste du monde"
        description="Circuits accompagnés et séjours sur mesure, sélectionnés par notre équipe pour leur rapport authenticité, confort et budget."
      />

      {/* Filter / sort toolbar */}
      <section className="container-narrow pb-2">
        <div className="rounded-xl border border-sand-deep bg-sand p-4">
          <form action="/destinations" method="get" className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col flex-1 min-w-[180px]">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-graphite mb-1">
                Région
              </span>
              <select
                name="region"
                defaultValue={activeRegion?.id ?? ""}
                className="rounded-lg border border-sand-deep bg-sand px-3 py-2 text-sm text-navy focus:border-ocean outline-none"
              >
                <option value="">Toutes les régions</option>
                <optgroup label="Sénégal">
                  {regions.filter((r) => r.group === "senegal").map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.labelFr}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="International">
                  {regions.filter((r) => r.group === "international").map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.labelFr}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            <label className="flex flex-col flex-1 min-w-[180px]">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-graphite mb-1">
                Mot-clé
              </span>
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Lac Rose, Casamance…"
                className="rounded-lg border border-sand-deep bg-sand px-3 py-2 text-sm text-navy focus:border-ocean outline-none"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-graphite mb-1">
                Tri
              </span>
              <select
                name="sort"
                defaultValue={sortKey}
                className="rounded-lg border border-sand-deep bg-sand px-3 py-2 text-sm text-navy focus:border-ocean outline-none"
              >
                {Object.entries(SORT_LABEL).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-sand hover:bg-ocean transition-colors"
            >
              Filtrer
            </button>
          </form>
        </div>
      </section>

      {activeFilters.length > 0 ? (
        <section className="container-narrow pb-2">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-sand-deep bg-sand px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-graphite">
              Filtres actifs :
            </span>
            {activeFilters.map((f) => (
              <span
                key={f}
                className="inline-flex items-center rounded-full bg-sky/15 px-3 py-1 text-xs font-medium text-navy"
              >
                {f}
              </span>
            ))}
            <Link
              href="/destinations"
              className="ml-auto text-xs font-semibold text-ocean hover:text-navy"
            >
              Réinitialiser
            </Link>
          </div>
        </section>
      ) : null}

      {showGroups ? (
        <>
          <section className="container-narrow pb-12">
            <header className="flex items-end justify-between gap-4 mb-6">
              <h2 className="font-display text-2xl font-semibold text-navy">Sénégal</h2>
              <p className="text-sm text-graphite">
                {senegal.length} destination{senegal.length > 1 ? "s" : ""}
              </p>
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
              <h2 className="font-display text-2xl font-semibold text-navy">International</h2>
              <p className="text-sm text-graphite">
                {international.length} destination{international.length > 1 ? "s" : ""}
              </p>
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
        </>
      ) : (
        <section className="container-narrow pb-12">
          <header className="flex items-end justify-between gap-4 mb-6">
            <h2 className="font-display text-2xl font-semibold text-navy">
              {total} destination{total > 1 ? "s" : ""}
            </h2>
            <p className="text-sm text-graphite">
              Page {pageNum} / {totalPages}
            </p>
          </header>
          {destinations.length === 0 ? (
            <p className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
              Aucune destination ne correspond à votre recherche.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((d) => (
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
      )}

      {totalPages > 1 ? (
        <nav
          aria-label="Pagination"
          className="container-narrow pb-20 flex items-center justify-center gap-2"
        >
          {pageNum > 1 ? (
            <Link
              href={buildHref({
                region: sp.region,
                regionLegacy: sp.regionLegacy,
                q: sp.q,
                startDate: sp.startDate,
                sort: sortKey,
                page: String(pageNum - 1),
              })}
              className="rounded-lg border border-sand-deep bg-sand px-4 py-2 text-sm font-semibold text-navy hover:bg-sand-deep"
            >
              ← Précédent
            </Link>
          ) : null}
          <span className="text-sm text-graphite px-3">
            Page {pageNum} / {totalPages}
          </span>
          {pageNum < totalPages ? (
            <Link
              href={buildHref({
                region: sp.region,
                regionLegacy: sp.regionLegacy,
                q: sp.q,
                startDate: sp.startDate,
                sort: sortKey,
                page: String(pageNum + 1),
            })}
              className="rounded-lg border border-sand-deep bg-sand px-4 py-2 text-sm font-semibold text-navy hover:bg-sand-deep"
            >
              Suivant →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
