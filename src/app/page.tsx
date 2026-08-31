import Link from "next/link";
import { WaveDivider } from "@/components/brand/wave-divider";
import { DestinationCard } from "@/components/site/destination-card";
import { OfferCard } from "@/components/site/offer-card";
import { TestimonialCard } from "@/components/site/testimonial-card";
import { prisma } from "@/lib/prisma";
import { resolveImage, FALLBACK_BY_SLUG } from "@/lib/photos";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { getLocaleCookie } from "@/lib/i18n-actions";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import { buildReviewsJsonLd } from "@/lib/seo/jsonld";

const trustPoints = [
  {
    title: "Une expertise de terrain",
    body: "Plus de 15 ans à organiser des voyages depuis Dakar — nous parlons la langue du pays et de ses réalités administratives.",
  },
  {
    title: "Un interlocuteur unique",
    body: "De la première estimation jusqu'au retour, vous traitez avec la même personne. Pas de standard, pas de ticket anonyme.",
  },
  {
    title: "Visa, vol, séjour — tout au même endroit",
    body: "Billets, hébergement, transferts, formalités visa, assurance : nous coordonnons l'ensemble pour vous.",
  },
];

export default async function HomePage() {
  const cookieLocale = await getLocaleCookie();
  const displayLocale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  const [featuredDestinations, latestOffers, testimonials] = await Promise.all([
    prisma.destination.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: "asc" },
      take: 6,
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
      take: 3,
    }),
  ]);

  // JSON-LD: also pull a slightly wider set (still capped to 10) for SEO.
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

  const heroImage = resolveImage(null, FALLBACK_BY_SLUG["lac-rose"] ?? "/photos/destinations/lac-rose.jpg", {
    width: 1920, height: 1080, crop: "fill",
  });

  return (
    <>
      {reviewsLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsLd) }}
        />
      ) : null}

      {/* Hero */}
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
            className="absolute inset-0 bg-gradient-to-b from-navy/30 via-navy/15 to-sand"
          />
        </div>

        <div className="container-narrow pt-20 pb-28 md:pt-28 md:pb-32">
          <p className="inline-flex items-center gap-2 rounded-full bg-sand/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-navy backdrop-blur">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sunrise-orange" />
            Dakar · Sénégal · depuis 2009
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl md:text-6xl font-semibold leading-[1.05] text-balance">
            <span className="text-navy">Vols, visas, séjours.</span>
            <br />
            <span className="text-ocean">Un interlocuteur unique à Dakar.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-anthracite leading-relaxed">
            Nous organisons vos voyages depuis le Sénégal — Sénégal, Omra, Maroc, Turquie, Dubaï, Europe.
            Billets, formalités visa et séjours coordonnés par une équipe qui connaît le terrain.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-sand hover:bg-ocean transition-colors"
            >
              Explorer les destinations
              <span aria-hidden>→</span>
            </Link>
            <a
              href={whatsappLink("Bonjour Assirik Tours, j'aimerais des informations sur un voyage.")}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-semibold text-sand hover:bg-whatsapp-hover transition-colors"
            >
              <WhatsappIcon />
              Discuter sur WhatsApp
            </a>
          </div>

          <div className="mt-10">
            <QuickSearch />
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* Trust points */}
      <section className="container-narrow py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {trustPoints.map((tp) => (
            <div key={tp.title}>
              <h3 className="font-display text-lg font-semibold text-navy">{tp.title}</h3>
              <p className="mt-2 text-graphite leading-relaxed">{tp.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured destinations */}
      <section className="container-narrow pb-16">
        <header className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
              Destinations phare
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy text-balance">
              Là où nous allons le plus souvent
            </h2>
          </div>
          <Link href="/destinations" className="text-sm font-semibold text-ocean hover:text-navy">
            Toutes les destinations →
          </Link>
        </header>

        {featuredDestinations.length === 0 ? (
          <p className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
            Catalogue en cours d&apos;enrichissement.
          </p>
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

      {/* Offers */}
      {latestOffers.length > 0 ? (
        <section className="container-narrow pb-16">
          <header className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
                Offres du moment
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-navy text-balance">
                Trois voyages prêts à réserver
              </h2>
            </div>
            <Link href="/offres" className="text-sm font-semibold text-ocean hover:text-navy">
              Toutes les offres →
            </Link>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestOffers.map((o) => (
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
      ) : null}

      {/* Testimonials */}
      {testimonials.length > 0 ? (
        <section className="container-narrow pb-16">
          <header className="flex items-end justify-between gap-4 mb-6 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
                {displayLocale === "en" ? "They travelled with us" : "Ils ont voyagé avec nous"}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-navy">
                {displayLocale === "en"
                  ? "Verified testimonials"
                  : "Témoignages vérifiés"}
              </h2>
            </div>
            <Link
              href="/temoignages"
              className="text-sm font-semibold text-ocean hover:text-navy"
            >
              {displayLocale === "en"
                ? "See all testimonials →"
                : "Voir tous les témoignages →"}
            </Link>
          </header>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
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
        </section>
      ) : null}

      {/* Final CTA */}
      <section className="container-narrow pb-20">
        <div className="rounded-2xl bg-navy p-8 md:p-12 text-sand">
          <h2 className="font-display text-3xl font-semibold text-sand text-balance">
            Une idée de voyage en tête ?
          </h2>
          <p className="mt-3 max-w-2xl text-mist/90 leading-relaxed">
            Décrivez-nous votre projet en quelques phrases — destination, dates approximatives, nombre de voyageurs, budget indicatif. Un conseiller vous rappelle avec une première estimation sous 24h ouvrées.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-sunrise-orange px-6 py-3 text-sm font-semibold text-navy hover:bg-sunrise-yellow transition-colors">
              Demander un devis
            </Link>
            <a
              href={whatsappLink("Bonjour Assirik Tours, j'aimerais des informations sur un voyage.")}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-semibold text-sand hover:bg-whatsapp-hover transition-colors"
            >
              Discuter sur WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- local sub-components ---------- */

function QuickSearch() {
  // Pre-fills the real search page with the destination keyword entered
  // by the visitor — no client-side state needed beyond a GET form.
  return (
    <form action="/recherche" className="rounded-xl bg-sand/95 border border-sand-deep shadow-soft backdrop-blur p-3 max-w-2xl">
      <div className="grid md:grid-cols-[1.4fr_1fr_auto] gap-2">
        <label className="flex flex-col rounded-lg bg-sand-deep/40 px-3 py-2 hover:bg-sand-deep transition-colors">
          <span className="text-[0.75rem] font-semibold uppercase tracking-wider text-graphite">
            Destination
          </span>
          <input
            name="q"
            placeholder="Lac Rose, Casamance, Omra, Schengen…"
            className="mt-0.5 bg-transparent text-sm text-navy placeholder:text-silver outline-none"
          />
        </label>
        <label className="flex flex-col rounded-lg bg-sand-deep/40 px-3 py-2 hover:bg-sand-deep transition-colors">
          <span className="text-[0.75rem] font-semibold uppercase tracking-wider text-graphite">
            Région
          </span>
          <select name="region" className="mt-0.5 bg-transparent text-sm text-navy outline-none">
            <option value="">Toutes</option>
            <option value="DAKAR">Dakar</option>
            <option value="PETITE_COTE">Petite-Côte</option>
            <option value="CASAMANCE">Casamance</option>
            <option value="MOYEN_ORIENT">Moyen-Orient (Omra)</option>
            <option value="EUROPE">Europe</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-sand hover:bg-ocean transition-colors"
        >
          Rechercher
        </button>
      </div>
      <p className="mt-2 px-1 text-xs text-graphite">
        Recherche indicative — confirmation par un conseiller sous 24h ouvrées.
      </p>
    </form>
  );
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M16 3C9.4 3 4 8.4 4 15c0 2.5.8 4.9 2.2 6.9L4 29l7.3-2.1c1.9 1 4 1.6 6.2 1.6h.5c6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.9c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.3 1.2 1.2-4.2-.3-.4c-1.2-1.7-1.8-3.7-1.8-5.8 0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10z" />
    </svg>
  );
}
