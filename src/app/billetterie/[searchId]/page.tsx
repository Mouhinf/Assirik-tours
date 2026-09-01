import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/site/page-hero";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { QuoteForm } from "./quote-form";

type SearchParams = Promise<{ offer?: string }>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ searchId: string }>;
}): Promise<Metadata> {
  const { searchId } = await params;
  const search = await prisma.flightSearch.findUnique({ where: { id: searchId } });
  if (!search) return { title: "Recherche introuvable" };
  const date = search.departDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return {
    title: `${search.origin} → ${search.destination} le ${date}`,
    description: `Sélectionnez votre vol ${search.origin} → ${search.destination} et demandez un devis à un conseiller.`,
    robots: { index: false, follow: false },
  };
}

export default async function FlightOfferDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ searchId: string }>;
  searchParams: SearchParams;
}) {
  const { searchId } = await params;
  const sp = await searchParams;

  const search = await prisma.flightSearch.findUnique({
    where: { id: searchId },
    include: { offers: { orderBy: { priceAmount: "asc" } } },
  });
  if (!search) notFound();

  const requestedOfferId = sp.offer;
  const requestedOffer =
    search.offers.find((o) => o.providerOfferId === requestedOfferId) ?? search.offers[0];

  return (
    <>
      <PageHero
        eyebrow="Billetterie"
        title={`${search.origin} → ${search.destination}`}
        description={`${search.departDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}${search.returnDate ? ` — retour ${search.returnDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}` : ""} · ${search.passengers} passager${search.passengers > 1 ? "s" : ""}`}
      />

      <section className="container-narrow pb-10">
        {search.offers.length === 0 ? (
          <p className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
            Aucun vol trouvé pour cette recherche. <Link href="/billetterie" className="font-semibold text-ocean hover:text-navy">Refaire une recherche</Link>.
          </p>
        ) : (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
            <div className="space-y-3">
              <h2 className="font-display text-lg font-semibold text-navy">
                {search.offers.length} offres disponibles
              </h2>
              <ol className="space-y-3">
                {search.offers.map((o) => {
                  const oOut = o.outbound as unknown as {
                    totalDurationMinutes: number;
                    stopCount: number;
                    segments: Array<{
                      carrier: string;
                      carrierName?: string;
                      departAt: string;
                      arriveAt: string;
                      origin: string;
                      destination: string;
                    }>;
                  };
                  const isSelected = o.providerOfferId === requestedOffer?.providerOfferId;
                  return (
                    <li
                      key={o.id}
                      className={`rounded-xl border p-4 ${
                        isSelected
                          ? "border-ocean bg-mist/40"
                          : "border-sand-deep bg-sand"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-navy">
                            {oOut.segments[0]?.carrierName ?? oOut.segments[0]?.carrier}
                          </p>
                          <p className="mt-1 text-sm text-graphite">
                            <span className="font-mono font-semibold text-navy">
                              {oOut.segments[0]?.origin}
                            </span>{" "}
                            {new Date(oOut.segments[0]?.departAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            {" → "}
                            <span className="font-mono font-semibold text-navy">
                              {oOut.segments[oOut.segments.length - 1]?.destination}
                            </span>{" "}
                            {new Date(oOut.segments[oOut.segments.length - 1]?.arriveAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="mt-1 text-xs text-graphite">
                            {Math.floor(oOut.totalDurationMinutes / 60)}h
                            {String(oOut.totalDurationMinutes % 60).padStart(2, "0")} ·{" "}
                            {oOut.stopCount === 0 ? "Direct" : `${oOut.stopCount} escale${oOut.stopCount > 1 ? "s" : ""}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-xl font-semibold text-navy">
                            {new Intl.NumberFormat("fr-FR").format(Number(o.priceAmount))} {o.priceCurrency}
                          </p>
                          <Link
                            href={`/billetterie/${search.id}?offer=${encodeURIComponent(o.providerOfferId)}`}
                            className={`mt-1 inline-flex min-h-11 items-center rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                              isSelected
                                ? "bg-ocean text-sand"
                                : "bg-sand-deep text-graphite hover:text-navy"
                            }`}
                          >
                            {isSelected ? "Sélectionné" : "Sélectionner"}
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {requestedOffer ? (
              <aside className="lg:sticky lg:top-4">
                <QuoteForm
                  searchId={search.id}
                  offerId={requestedOffer.providerOfferId}
                  defaultEmail={search.userEmail ?? ""}
                />
              </aside>
            ) : null}
          </div>
        )}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Accueil", url: "/" },
              { name: "Billetterie", url: "/billetterie" },
              {
                name: `${search.origin} → ${search.destination}`,
                url: `/billetterie/${search.id}`,
              },
            ]),
          ),
        }}
      />
    </>
  );
}
