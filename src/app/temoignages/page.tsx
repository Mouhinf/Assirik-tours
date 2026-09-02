import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/site/page-hero";
import { TestimonialCard, type TestimonialCardData } from "@/components/site/testimonial-card";
import { getLocaleCookie } from "@/lib/i18n-actions";
import { isLocale } from "@/lib/i18n";
import { buildReviewsJsonLd } from "@/lib/seo/jsonld";
import { LinkPagination } from "@/components/site/link-pagination";
import { LANGUAGE_BADGE } from "@/lib/regions";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleCookie();
  return {
    title:
      locale === "en"
        ? "Customer testimonials | Assirik Tours"
        : "Témoignages clients | Assirik Tours",
    description:
      locale === "en"
        ? "Verified reviews from travellers who booked their Senegal, Umrah, Morocco, Turkey, Dubai or Europe trip with Assirik Tours."
        : "Ils ont voyagé avec Assirik Tours : retours vérifiés de voyageurs sénégalais et de la diaspora sur nos séjours au Sénégal, Omra, Maroc, Turquie, Dubaï et en Europe.",
  };
}

const PAGE_SIZE = 12;

export default async function TemoignagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    locale?: string;
    min?: string;
    tripSlug?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const minRating = Number(sp.min) || 0;
  const page = Math.max(1, Number(sp.page) || 1);
  const cookieLocale = await getLocaleCookie();
  const locale = cookieLocale;
  const filterLocale = isLocale(sp.locale) ? sp.locale : null;
  const tripSlugFilter = sp.tripSlug?.trim() || null;

  const where = {
    approved: true,
    ...(filterLocale ? { locale: filterLocale } : {}),
    ...(minRating > 0 ? { rating: { gte: minRating } } : {}),
    ...(tripSlugFilter ? { tripSlug: tripSlugFilter } : {}),
  };

  // We fetch one extra row to determine whether a next page exists.
  const [rows, total, allSlugsForFilter] = await Promise.all([
    prisma.testimonial.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE + 1,
    }),
    prisma.testimonial.count({ where }),
    prisma.testimonial.findMany({
      where: { approved: true, NOT: { tripSlug: null } },
      select: { tripSlug: true },
      distinct: ["tripSlug"],
    }),
  ]);

  const items: TestimonialCardData[] = rows.slice(0, PAGE_SIZE).map((t) => ({
    id: t.id,
    author: t.author,
    city: t.city,
    content: t.content,
    rating: t.rating,
    tripSlug: t.tripSlug,
    locale: t.locale as "fr" | "en",
    avatarId: t.avatarId,
    dateTrip: t.dateTrip ? t.dateTrip.toISOString() : null,
  }));
  const hasNext = rows.length > PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const reviewsForSeo = await prisma.testimonial.findMany({
    where: { approved: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take: 10,
  });
  const reviewsLd = buildReviewsJsonLd(
    reviewsForSeo.map((r) => ({
      author: r.author,
      rating: r.rating,
      content: r.content,
      dateTrip: r.dateTrip,
      locale: r.locale as "fr" | "en",
    })),
  );

  const slugOptions = allSlugsForFilter
    .map((s) => s.tripSlug)
    .filter((s): s is string => Boolean(s))
    .sort();

  const showLangSwitcher = !sp.locale;
  void cookieLocale; // kept for symmetry with future per-locale copy

  return (
    <>
      {reviewsLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsLd) }}
        />
      ) : null}

      <PageHero
        eyebrow={locale === "en" ? "Testimonials" : "Témoignages"}
        title={locale === "en" ? "They travelled with us" : "Ils ont voyagé avec nous"}
        description={locale === "en"
          ? "Verified reviews from Senegalese travellers and the diaspora on our stays, tours and religious trips."
          : "Retours vérifiés de voyageurs sénégalais et de la diaspora sur nos séjours, circuits et voyages religieux."}
      />

      {/* Filters */}
      <section className="container-narrow pb-6">
        <form className="rounded-xl border border-sand-deep bg-sand p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
              {locale === "en" ? "Language" : "Langue"}
            </span>
            <select
              name="locale"
              defaultValue={sp.locale ?? ""}
              className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
            >
              <option value="">{locale === "en" ? "All" : "Toutes"}</option>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
              {locale === "en" ? "Minimum rating" : "Note minimum"}
            </span>
            <select
              name="min"
              defaultValue={minRating ? String(minRating) : ""}
              className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
            >
              <option value="">{locale === "en" ? "All" : "Toutes"}</option>
              {[3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}★ {locale === "en" ? "and above" : "et plus"}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
              {locale === "en" ? "Destination" : "Destination"}
            </span>
            <select
              name="tripSlug"
              defaultValue={tripSlugFilter ?? ""}
              className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
            >
              <option value="">Toutes</option>
              {slugOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy transition-colors"
            >
              {locale === "en" ? "Filter" : "Filtrer"}
            </button>
          </div>
        </form>

        {showLangSwitcher ? (
          <p className="mt-3 text-xs text-silver italic">
            {locale === "en"
              ? "Tip: combine filters then switch the site language (FR / EN) to explore the other collection."
              : "Astuce : combinez les filtres puis changez la langue du site (FR / EN) pour explorer l'autre collection de témoignages."}
          </p>
        ) : null}
      </section>

      <section className="container-narrow pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ocean/20 bg-ocean/5 px-5 py-4">
          <p className="text-sm text-graphite">
            <span className="font-semibold text-navy">{locale === "en" ? "You travelled with us?" : "Vous avez voyagé avec nous ?"}</span>{" "}
            {locale === "en"
              ? "Share your experience — your review will be read by our team before publication."
              : "Partagez votre expérience — votre témoignage sera relu par notre équipe avant publication."}
          </p>
          <Link
            href="/temoignages/nouveau"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand transition-colors hover:bg-navy whitespace-nowrap"
          >
            {locale === "en" ? "Leave a review" : "Laisser un avis"} <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section className="container-narrow pb-16">
        <header className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <p className="text-sm text-graphite">
            {total} {locale === "en" ? (total > 1 ? "testimonials" : "testimonial") : (total > 1 ? "témoignages" : "témoignage")} {locale === "en" ? "approved" : "approuvé"}{total > 1 ? (locale === "en" ? "s" : "s") : ""}.
          </p>
          {filterLocale ? (
            <span
              className={
                "inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider " +
                LANGUAGE_BADGE[filterLocale]
              }
            >
              {filterLocale.toUpperCase()}
            </span>
          ) : null}
        </header>

        {items.length === 0 ? (
          <p className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
            {locale === "en" ? "No testimonials match these filters." : "Aucun témoignage ne correspond à ces filtres."}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((t) => (
              <TestimonialCard key={t.id} t={t} variant="full" />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <LinkPagination
            basePath="/temoignages"
            page={page}
            totalPages={totalPages}
            extraParams={{
              ...(sp.locale ? { locale: sp.locale } : {}),
              ...(minRating ? { min: String(minRating) } : {}),
              ...(tripSlugFilter ? { tripSlug: tripSlugFilter } : {}),
            }}
          />
        ) : null}
      </section>
    </>
  );
}
