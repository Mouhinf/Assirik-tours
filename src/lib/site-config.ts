/**
 * Site-wide configuration — single source of truth.
 * Update here, propagates everywhere.
 */
export const siteConfig = {
  name: "Assirik Tours",
  shortName: "Assirik",
  tagline: "Agence de voyages à Dakar",
  description:
    "Vols, visas et séjours sur mesure depuis Dakar. Sénégal, Omra, Maroc, Turquie, Dubaï, Europe.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://assiriktours.sn",
  email: "assiriktours@gmail.com",
  phones: {
    landline: "+221 33 821 01 81",
    landlineTel: "+221338210181",
    whatsapp: "+221 77 549 53 14",
    whatsappTel: "+221775495314",
  },
  address: {
    line1: "Rue 22 prolongée",
    line2: "Fass Delorme",
    city: "Dakar",
    country: "Sénégal",
  },
  hours: {
    weekdays: "Lundi – Vendredi : 8h30 – 18h00",
    saturday: "Samedi : 9h00 – 14h00",
    sunday: "Dimanche : sur rendez-vous",
  },
  social: {
    facebook: "https://facebook.com/assiriktours",
    instagram: "https://instagram.com/assiriktours",
    linkedin: "https://linkedin.com/company/assiriktours",
  },
  navigation: [
    { href: "/destinations", label: "Destinations" },
    { href: "/offres", label: "Offres" },
    { href: "/billetterie", label: "Billetterie" },
    { href: "/services", label: "Services" },
    { href: "/a-propos", label: "À propos" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;