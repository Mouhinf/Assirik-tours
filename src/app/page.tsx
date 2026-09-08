import Link from "next/link";
import { WaveDivider } from "@/components/brand/wave-divider";
import { DestinationCard } from "@/components/site/destination-card";
import { OfferCard } from "@/components/site/offer-card";
import { TestimonialCard } from "@/components/site/testimonial-card";
import { ServicesCompactGrid } from "@/components/site/services-compact-grid";
import { BlogPreviewCard, type BlogPreviewPost } from "@/components/site/blog-preview-card";
import { prisma } from "@/lib/prisma";
import { getHomeHero, heroImageUrl } from "@/lib/homepage-hero";
import { getActiveRegions } from "@/lib/regions";
import { resolveImage } from "@/lib/photos";
import { whatsappLink } from "@/lib/whatsapp";
import { getLocaleCookie } from "@/lib/i18n-actions";
import { isLocale, DEFAULT_LOCALE, type Locale, t } from "@/lib/i18n";
import { buildReviewsJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";

const FOUNDING_YEAR = 2009;
const YEARS_EXPERIENCE = new Date().getFullYear() - FOUNDING_YEAR;

const TRUST_POINTS_BY_LOCALE = {
  fr: [
    {
      titleKey: "home.trust_1_title",
      bodyKey: "home.trust_1_body",
      bodyInline: `${YEARS_EXPERIENCE} ans à organiser des voyages depuis Dakar — nous parlons la langue du pays et de ses réalités administratives.`,
    },
    {
      titleKey: "home.trust_2_title",
      bodyKey: "home.trust_2_body",
    },
    {
      titleKey: "home.trust_3_title",
      bodyKey: "home.trust_3_body",
    },
    {
      titleKey: "home.trust_4_title",
      bodyKey: "home.trust_4_body",
    },
  ],
  en: [
    {
      titleKey: "home.trust_1_title",
      bodyKey: "home.trust_1_body",
      bodyInline: `${YEARS_EXPERIENCE} years organising travel from Dakar — we speak the country's language and its administrative realities.`,
    },
    {
      titleKey: "home.trust_2_title",
      bodyKey: "home.trust_2_body",
    },
    {
      titleKey: "home.trust_3_title",
      bodyKey: "home.trust_3_body",
    },
    {
      titleKey: "home.trust_4_title",
      bodyKey: "home.trust_4_body",
    },
  ],
} as const;

const TRUST_ICONS = ["compass", "users", "shield", "whatsapp"] as const;

export default async function HomePage() {
  const cookieLocale = await getLocaleCookie();
  const displayLocale: Locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const isFr = displayLocale === "fr";

  // Destinations: prefer those with homeOrder set, fall back to featured ones.
  const [
    homeOrderDests,
    featuredDests,
    homeOrderOffers,
    latestOffers,
    testimonials,
    services,
    latestBlogPosts,
  ] = await Promise.all([
    prisma.destination.findMany({
      where: { published: true, homeOrder: { not: null } },
      orderBy: { homeOrder: "asc" },
      take: 6,
    }),
    prisma.destination.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: "asc" },
      take: 6,
    }),
    prisma.offer.findMany({
      where: { published: true, featuredOnHome: true },
      orderBy: [{ homeOrder: "asc" }, { createdAt: "desc" }],
      take: 3,
      include: { destination: true },
    }),
    prisma.offer.findMany({
      where: { published: true },
      include: { destination: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.testimonial.findMany({
      where: { approved: true, locale: displayLocale },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 5,
    }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { title: "asc" }],
      take: 6,
    }),
    prisma.blogPost.findMany({
      where: { locale: displayLocale, publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  const featuredDestinations =
    homeOrderDests.length > 0 ? homeOrderDests : featuredDests;
  const displayOffers =
    homeOrderOffers.length > 0 ? homeOrderOffers : latestOffers;

  // JSON-LD: pull a slightly wider set (still capped to 10) for SEO.
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

  const hero = await getHomeHero(displayLocale);
  const heroImage =
    heroImageUrl(hero.heroImageId) ??
    resolveImage(null, "/photos/destinations/lac-rose.jpg", {
      width: 1920,
      height: 1080,
      crop: "fill",
    });

  // Map blog rows to the lightweight shape consumed by BlogPreviewCard.
  const blogPreview: BlogPreviewPost[] = latestBlogPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImageId: p.coverImageId,
    category: p.category,
    publishedAt: p.publishedAt,
    readingTime: p.readingTime,
  }));

  const trustPoints = TRUST_POINTS_BY_LOCALE[displayLocale];

  // Stats for the "Why us" block. Sourced from DB where available, fallback
  // to derived values when the DB has not been seeded.
  const totalApprovedTestimonials = await prisma.testimonial.count({
    where: { approved: true },
  });
  const avgRatingRow = await prisma.testimonial.aggregate({
    _avg: { rating: true },
    where: { approved: true },
  });
  const countriesCovered = await prisma.destination
    .findMany({ where: { published: true }, select: { region: true } })
    .then((rows) => new Set(rows.map((r) => r.region)).size);

  const stats = [
    { value: String(YEARS_EXPERIENCE), label: t("home.why_stat_1", displayLocale) },
    { value: String(countriesCovered > 0 ? countriesCovered : 12), label: t("home.why_stat_2", displayLocale) },
    { value: totalApprovedTestimonials > 0 ? "1k+" : "480+", label: t("home.why_stat_3", displayLocale) },
    {
      value: avgRatingRow._avg.rating
        ? `${avgRatingRow._avg.rating.toFixed(1)} / 5`
        : "4.8 / 5",
      label: t("home.why_stat_4", displayLocale),
    },
  ];

  return (
    <>
      {reviewsLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* ─── 1) Header is rendered in root layout (sticky already) ─── */}
      {/* ─── 2) Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-90"
            decoding="async"
            fetchPriority="high"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-navy/35 via-navy/15 to-sand"
          />
        </div>

        <div className="container-narrow pt-20 pb-24 md:pt-28 md:pb-28">
          <p className="inline-flex items-center gap-2 rounded-full bg-sand/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-navy backdrop-blur">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sunrise-orange" />
            {hero.eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl md:text-6xl font-semibold leading-[1.05] text-balance">
            <span className="text-navy">{hero.title}</span>
            <br />
            <span className="text-ocean">{hero.titleAccent}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-anthracite leading-relaxed">
            {hero.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={hero.primaryCtaHref || "/destinations"}
              className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-sand hover:bg-ocean transition-colors"
            >
              {hero.primaryCtaLabel}
              <span aria-hidden>→</span>
            </Link>
            <a
              href={whatsappLink(hero.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-semibold text-sand hover:bg-whatsapp-hover transition-colors"
            >
              <WhatsappIcon />
              {t("common.whatsapp_cta", displayLocale)}
            </a>
          </div>

          <div className="mt-10">
            <QuickSearch
              locale={displayLocale}
              eyebrow={t("home.search_eyebrow", displayLocale)}
              hint={t("home.search_hint", displayLocale)}
              labels={{
                destination: t("home.search_destination", displayLocale),
                destinationPlaceholder: t("home.search_destination_placeholder", displayLocale),
                region: t("home.search_region", displayLocale),
                regionAll: t("home.search_region_all", displayLocale),
                startDate: t("home.search_start_date", displayLocale),
                travelers: t("home.search_travelers", displayLocale),
                btn: t("home.search_btn", displayLocale),
              }}
            />
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* ─── 3) Trust band ─── */}
      <section className="container-narrow py-14">
        <h2 className="font-display text-xl md:text-2xl font-semibold text-navy text-center text-balance">
          {t("home.trust_title", displayLocale)}
        </h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trustPoints.map((tp, i) => (
            <article
              key={tp.titleKey}
              className="rounded-xl border border-sand-deep bg-sand p-5"
            >
              <span
                aria-hidden
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ocean/10 text-ocean"
              >
                <TrustIcon name={TRUST_ICONS[i] ?? "compass"} />
              </span>
              <h3 className="mt-3 font-display text-base font-semibold text-navy">
                {t(tp.titleKey, displayLocale)}
              </h3>
              <p className="mt-1.5 text-sm text-graphite leading-relaxed">
                {("bodyInline" in tp && tp.bodyInline) || t(tp.bodyKey, displayLocale)}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── 4) Featured destinations ─── */}
      <section className="container-narrow pb-16">
        <header className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
              {t("home.featured_eyebrow", displayLocale)}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy text-balance">
              {t("home.featured_title", displayLocale)}
            </h2>
          </div>
          <Link href="/destinations" className="text-sm font-semibold text-ocean hover:text-navy whitespace-nowrap">
            {t("common.all_destinations", displayLocale)} →
          </Link>
        </header>

        {featuredDestinations.length === 0 ? (
          <EmptyState
            title={isFr ? "Catalogue en cours d'enrichissement" : "Catalogue being enriched"}
            body={t("home.featured_empty", displayLocale)}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDestinations.map((d) => (
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

      {/* ─── 5) Featured offers ─── */}
      <section className="container-narrow pb-16">
        <header className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
              {t("home.offers_eyebrow", displayLocale)}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy text-balance">
              {t("home.offers_title", displayLocale)}
            </h2>
          </div>
          <Link href="/offres" className="text-sm font-semibold text-ocean hover:text-navy whitespace-nowrap">
            {t("common.all_offers", displayLocale)} →
          </Link>
        </header>

        {displayOffers.length === 0 ? (
          <EmptyState
            title={isFr ? "Aucune offre en vedette" : "No offers featured"}
            body={t("home.offers_empty", displayLocale)}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayOffers.map((o) => (
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
                promoPriceFCFA={o.promoPriceFCFA}
                promoEndsAt={o.promoEndsAt}
                promoLabel={t("home.promo_badge", displayLocale)}
                locale={displayLocale}
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── 6) Services at a glance ─── */}
      <section className="bg-sand-deep/30 py-16">
        <div className="container-narrow">
          <header className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
                {t("home.services_eyebrow", displayLocale)}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-navy text-balance">
                {t("home.services_title", displayLocale)}
              </h2>
            </div>
            <Link href="/services" className="text-sm font-semibold text-ocean hover:text-navy whitespace-nowrap">
              {t("common.see_all", displayLocale)} →
            </Link>
          </header>

          {services.length === 0 ? (
            <EmptyState
              title={isFr ? "Catalogue en construction" : "Catalogue coming soon"}
              body={t("home.services_empty", displayLocale)}
            />
          ) : (
            <ServicesCompactGrid
              services={services.map((s) => ({
                id: s.id,
                slug: s.slug,
                title: s.title,
                shortDescription: s.shortDescription,
                category: s.category,
                icon: s.icon,
                imageId: s.imageId,
                priceFromFCFA: s.priceFromFCFA,
                priceNote: s.priceNote,
                isFeatured: s.isFeatured,
              }))}
            />
          )}
        </div>
      </section>

      {/* ─── 7) Why us ─── */}
      <section className="container-narrow py-20">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
              {t("home.why_eyebrow", displayLocale)}
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold text-navy text-balance">
              {t("home.why_title", displayLocale)}
            </h2>
            <div className="mt-5 space-y-4 text-graphite leading-relaxed">
              <p>{t("home.why_body_1", displayLocale)}</p>
              <p>{t("home.why_body_2", displayLocale)}</p>
            </div>
            <Link
              href="/a-propos"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-ocean hover:text-navy"
            >
              {isFr ? "Lire notre histoire complète →" : "Read our full story →"}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-sand-deep bg-sand p-5"
              >
                <p className="font-display text-3xl md:text-4xl font-semibold text-navy tabular-nums">
                  {s.value}
                </p>
                <p className="mt-1.5 text-xs uppercase tracking-wider text-graphite">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8) Testimonials ─── */}
      <section className="container-narrow pb-16">
        <header className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
              {t("home.testimonials_eyebrow", displayLocale)}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy">
              {t("home.testimonials_title", displayLocale)}
            </h2>
          </div>
          <Link
            href="/temoignages"
            className="text-sm font-semibold text-ocean hover:text-navy"
          >
            {t("testimonials.see_all", displayLocale)} →
          </Link>
        </header>

        {testimonials.length === 0 ? (
          <EmptyState
            title={isFr ? "Aucun témoignage" : "No testimonials yet"}
            body={t("home.testimonials_empty", displayLocale)}
          />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t) => (
              <TestimonialCard
                key={t.id}
                t={{
                  id: t.id,
                  author: t.author,
                  city: t.city,
                  content: t.content,
                  rating: t.rating,
                  tripSlug: t.tripSlug,
                  locale: t.locale as "fr" | "en",
                  avatarId: t.avatarId,
                  dateTrip: t.dateTrip ? t.dateTrip.toISOString() : null,
                }}
                variant="full"
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── 9) Blog preview ─── */}
      <section className="container-narrow pb-16">
        <header className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
              {t("home.blog_eyebrow", displayLocale)}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy text-balance">
              {t("home.blog_title", displayLocale)}
            </h2>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-ocean hover:text-navy whitespace-nowrap">
            {t("common.see_all", displayLocale)} →
          </Link>
        </header>

        {blogPreview.length === 0 ? (
          <EmptyState
            title={isFr ? "Le blog arrive bientôt" : "The blog is coming soon"}
            body={t("home.blog_empty", displayLocale)}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPreview.map((p) => (
              <BlogPreviewCard key={p.slug} post={p} locale={displayLocale} />
            ))}
          </div>
        )}
      </section>

      {/* ─── 10) Final CTA ─── */}
      <section className="container-narrow pb-20">
        <div className="rounded-3xl bg-navy p-8 md:p-12 text-sand relative overflow-hidden">
          <div aria-hidden className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-sunrise-orange/15 blur-2xl" />
          <div aria-hidden className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-whatsapp/20 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-yellow">
              {t("home.final_cta_eyebrow", displayLocale)}
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold text-sand text-balance">
              {t("home.final_cta_title", displayLocale)}
            </h2>
            <p className="mt-3 max-w-2xl text-mist/90 leading-relaxed">
              {t("home.final_cta_description", displayLocale)}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-sunrise-orange px-6 py-3 text-sm font-semibold text-navy hover:bg-sunrise-yellow transition-colors"
              >
                {t("common.request_quote", displayLocale)}
              </Link>
              <a
                href={whatsappLink(
                  isFr
                    ? "Bonjour Assirik Tours, j'aimerais des informations sur un voyage."
                    : "Hello Assirik Tours, I would like information about a trip.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-semibold text-sand hover:bg-whatsapp-hover transition-colors"
              >
                {t("common.whatsapp_cta", displayLocale)}
              </a>
              <a
                href="/a-propos"
                className="inline-flex items-center gap-2 rounded-full border border-sand/30 px-6 py-3 text-sm font-semibold text-sand hover:bg-sand/10 transition-colors"
              >
                {isFr ? "Découvrir l'équipe →" : "Meet the team →"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11) Footer is rendered in root layout ─── */}
    </>
  );
}

/* ---------- helpers ---------- */

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-sand-deep bg-sand-deep/30 px-6 py-10 text-center">
      <p className="font-display text-base font-semibold text-navy">{title}</p>
      <p className="mt-1.5 text-sm text-graphite">{body}</p>
    </div>
  );
}

async function QuickSearch({
  locale: _locale,
  eyebrow,
  hint,
  labels,
}: {
  locale: Locale;
  eyebrow: string;
  hint: string;
  labels: {
    destination: string;
    destinationPlaceholder: string;
    region: string;
    regionAll: string;
    startDate: string;
    travelers: string;
    btn: string;
  };
}) {
  const regions = await getActiveRegions();
  return (
    <form
      action="/destinations"
      method="get"
      className="rounded-2xl bg-sand/95 border border-sand-deep shadow-soft backdrop-blur p-4 max-w-4xl"
    >
      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-sunrise-coral mb-2">
        {eyebrow}
      </p>
      <div className="grid md:grid-cols-[1.6fr_1fr_1fr_0.9fr_auto] gap-2">
        <label className="flex flex-col rounded-lg bg-sand-deep/40 px-3 py-2 hover:bg-sand-deep transition-colors">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-graphite">
            {labels.destination}
          </span>
          <input
            name="q"
            placeholder={labels.destinationPlaceholder}
            className="mt-0.5 bg-transparent text-sm text-navy placeholder:text-silver outline-none"
          />
        </label>
        <label className="flex flex-col rounded-lg bg-sand-deep/40 px-3 py-2 hover:bg-sand-deep transition-colors">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-graphite">
            {labels.region}
          </span>
          <select
            name="region"
            defaultValue=""
            className="mt-0.5 bg-transparent text-sm text-navy outline-none"
          >
            <option value="">{labels.regionAll}</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.labelFr}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col rounded-lg bg-sand-deep/40 px-3 py-2 hover:bg-sand-deep transition-colors">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-graphite">
            {labels.startDate}
          </span>
          <input
            type="date"
            name="startDate"
            className="mt-0.5 bg-transparent text-sm text-navy placeholder:text-silver outline-none"
          />
        </label>
        <label className="flex flex-col rounded-lg bg-sand-deep/40 px-3 py-2 hover:bg-sand-deep transition-colors">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-graphite">
            {labels.travelers}
          </span>
          <select
            name="travelers"
            defaultValue="2"
            className="mt-0.5 bg-transparent text-sm text-navy outline-none"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5+">5+</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-sand hover:bg-ocean transition-colors"
        >
          {labels.btn}
        </button>
      </div>
      <p className="mt-2 px-1 text-xs text-graphite">{hint}</p>
    </form>
  );
}

function TrustIcon({ name }: { name: "compass" | "users" | "shield" | "whatsapp" }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <polygon points="15.5 8.5 11 11 8.5 15.5 13 13" fill="currentColor" stroke="none" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common}>
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      );
  }
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M16 3C9.4 3 4 8.4 4 15c0 2.5.8 4.9 2.2 6.9L4 29l7.3-2.1c1.9 1 4 1.6 6.2 1.6h.5c6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.9c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.3 1.2 1.2-4.2-.3-.4c-1.2-1.7-1.8-3.7-1.8-5.8 0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10z" />
    </svg>
  );
}
