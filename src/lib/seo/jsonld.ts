/**
 * JSON-LD structured data for SEO.
 * Schema.org TravelAgency + WebSite + potential TouristTrip.
 * https://schema.org/TravelAgency
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://assiriktours.sn";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "@id": `${SITE_URL}/#organization`,
  name: "Assirik Tours",
  alternateName: "Assirik",
  description:
    "Agence de voyages à Dakar spécialisée dans les vols, visas et séjours sur mesure depuis le Sénégal.",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og-default.png`,
  telephone: "+221-33-821-01-81",
  email: "assiriktours@gmail.com",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rue 22 prolongée, Fass Delorme",
    addressLocality: "Dakar",
    addressCountry: "SN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 14.6928,
    longitude: -17.4467,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:30",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "14:00",
    },
  ],
  sameAs: [
    "https://facebook.com/assiriktours",
    "https://instagram.com/assiriktours",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+221-77-549-53-14",
    contactType: "customer service",
    availableLanguage: ["French", "English"],
    areaServed: ["SN", "FR", "BE", "CH", "US", "CA"],
  },
  // NOTE: aggregateRating is intentionally NOT declared on the static
  // organization document. It is added at runtime by buildReviewsJsonLd(),
  // computed from real approved Testimonial rows. Hard-coded values would
  // violate Google structured-data policy (fake reviews) and risk a manual
  // action against the site.
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Assirik Tours",
  inLanguage: "fr-SN",
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/destinations?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

/** Per-destination TouristTrip schema for SEO rich results. */
export function destinationJsonLd(opts: {
  name: string;
  description: string;
  slug: string;
  imageId?: string;
}) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const imageUrl = opts.imageId && cloud
    ? `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_1200/${opts.imageId}`
    : `${SITE_URL}/og-default.png`;

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}/destinations/${opts.slug}`,
    image: imageUrl,
    provider: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "XOF",
      price: "0",
      url: `${SITE_URL}/contact`,
      validFrom: new Date().toISOString(),
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Reviews / AggregateRating JSON-LD for Google rich results.
 *
 * Schema.org expects reviews to be tied to a thing — we use the TravelAgency
 * organization as the subject (the legal schema is identical to what we
 * already declared in `organizationJsonLd.aggregateRating`, but here it's
 * generated dynamically from real approved Testimonial rows).
 *
 * Google caps visible reviews at ~10 per rich result; we slice to keep the
 * payload lean and let the rest live as plain HTML.
 */
export type ReviewableForSeo = {
  author: string;
  rating: number;
  content: string;
  dateTrip?: Date | string | null;
  locale: "fr" | "en";
};

export function buildReviewsJsonLd(reviews: ReviewableForSeo[]) {
  const list = (reviews ?? [])
    .filter((r) => Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5)
    .slice(0, 10);

  if (list.length === 0) return null;

  const avg =
    list.reduce((acc, r) => acc + r.rating, 0) / list.length;

  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}/#organization`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount: list.length,
      bestRating: "5",
      worstRating: "1",
    },
    review: list.map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.author,
      },
      dateReviewed:
        r.dateTrip instanceof Date
          ? r.dateTrip.toISOString().slice(0, 10)
          : typeof r.dateTrip === "string"
          ? r.dateTrip.slice(0, 10)
          : undefined,
      reviewBody: r.content,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: "5",
        worstRating: "1",
      },
      inLanguage: r.locale === "en" ? "en" : "fr-FR",
    })),
  };
}

/**
 * Per-offer Product JSON-LD for Google Merchant / rich results.
 * Schema.org Product is the right type for individual travel packages.
 */
export function offerJsonLd(opts: {
  name: string;
  description: string;
  slug: string;
  price: number; // price in XOF
  imageId?: string;
  destinationTitle: string;
  availability?: "https://schema.org/InStock" | "https://schema.org/PreOrder" | "https://schema.org/SoldOut";
}) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const imageUrl = opts.imageId && cloud
    ? `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_1200/${opts.imageId}`
    : `${SITE_URL}/og-default.png`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}/offres/${opts.slug}`,
    image: imageUrl,
    brand: { "@type": "Brand", name: "Assirik Tours" },
    offers: {
      "@type": "Offer",
      availability: opts.availability ?? "https://schema.org/InStock",
      priceCurrency: "XOF",
      price: opts.price,
      url: `${SITE_URL}/offres/${opts.slug}`,
      seller: { "@id": `${SITE_URL}/#organization` },
    },
    // aggregateRating intentionally omitted — Google penalizes aggregateRating
    // attached to individual Products when there are no real Product reviews.
    // TravelAgency-wide rating lives in buildReviewsJsonLd().
    ...(opts.destinationTitle
      ? { category: `Voyage — ${opts.destinationTitle}` }
      : {}),
  };
}

/**
 * FAQPage JSON-LD — Schema.org Question/acceptedAnswer list.
 *
 * We are generous on count (Google accepts up to ~50 questions per page
 * but we cap at 30 to stay kind to the rich-result tester) and skip
 * empty answer bodies. Markdown markers are stripped from the rendered
 * snippet so the JSON-LD reads clean.
 */
export type FaqForSeo = {
  question: string;
  answer: string;
};

export function buildFaqJsonLd(faqs: FaqForSeo[]) {
  const list = (faqs ?? [])
    .filter((f) => f.question.trim().length > 0 && f.answer.trim().length > 0)
    .slice(0, 30);

  if (list.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripMarkdown(f.answer),
      },
    })),
  };
}

/**
 * Reduce Markdown to a plain-text approximation: drop emphasis/list markers,
 * but keep ##/### headings as text (they help both humans and the
 * rich-result tester).
 */
function stripMarkdown(input: string): string {
  return input
    .replace(/^#{2,3}[ \t]+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^\\])\*(?!\s)([^*\n]+)\*(?!\*)/g, "$1$2")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^[ \t]*- /gm, "• ")
    .trim();
}
