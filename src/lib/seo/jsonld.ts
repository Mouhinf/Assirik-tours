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
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "127",
    bestRating: "5",
    worstRating: "1",
  },
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