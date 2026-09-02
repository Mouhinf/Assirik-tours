/**
 * Seed the 6 default services described on /services (assistance visa,
 * hôtels, véhicule avec chauffeur, assurance voyage, transferts aéroport,
 * sur-mesure entreprise).
 *
 * Idempotent: re-running upserts the same slugs and leaves manual
 * additions untouched.
 *
 * Run with: `pnpm tsx scripts/seed-services.ts`
 */
import { prisma } from "../src/lib/prisma";

type Seed = {
  slug: string;
  title: string;
  shortDescription: string;
  category: "VISA" | "HOTELS" | "CHAUFFEUR" | "ASSURANCE" | "TRANSFERT" | "ENTREPRISE";
  icon: string;
  priceFromFCFA: number | null;
  priceNote: string | null;
  order: number;
  isFeatured: boolean;
  ctaLabel: string | null;
  ctaHref: string | null;
};

const SEEDS: Seed[] = [
  {
    slug: "assistance-visa",
    title: "Assistance visa",
    shortDescription:
      "On s'occupe de votre dossier de A à Z : checklist documents, RDV consulat, suivi jusqu'à la décision. Schengen, USA, Canada, UK, Omra…",
    category: "VISA",
    icon: "stamp",
    priceFromFCFA: 50000,
    priceNote: "par dossier",
    order: 10,
    isFeatured: true,
    ctaLabel: "Démarrer un dossier",
    ctaHref: "/contact?service=assistance-visa",
  },
  {
    slug: "hotels",
    title: "Hôtels",
    shortDescription:
      "Sélection négociée à Dakar et dans toutes les destinations de notre catalogue : 3★ économiques, 4★ confort, 5★ prestige.",
    category: "HOTELS",
    icon: "hotel",
    priceFromFCFA: 35000,
    priceNote: "par nuit, petit-déj inclus",
    order: 20,
    isFeatured: false,
    ctaLabel: "Demander un devis",
    ctaHref: "/contact?service=hotels",
  },
  {
    slug: "vehicule-chauffeur",
    title: "Véhicule avec chauffeur",
    shortDescription:
      "Berline, minivan ou 4×4 avec chauffeur francophone. Idéal pour les transferts longue distance, road trips ou mises à disposition à la journée.",
    category: "CHAUFFEUR",
    icon: "car",
    priceFromFCFA: 25000,
    priceNote: "par course (≤ 50 km)",
    order: 30,
    isFeatured: false,
    ctaLabel: "Réserver un chauffeur",
    ctaHref: "/contact?service=vehicule-chauffeur",
  },
  {
    slug: "transferts-aeroport",
    title: "Transferts aéroport",
    shortDescription:
      "Accueil personnalisé pancarte à l'arrivée, suivi du vol en temps réel, véhicule climatisé. AIBD, Las Palmas, Casablanca, Abidjan…",
    category: "TRANSFERT",
    icon: "transfer",
    priceFromFCFA: 15000,
    priceNote: "par trajet",
    order: 40,
    isFeatured: false,
    ctaLabel: "Réserver un transfert",
    ctaHref: "/contact?service=transferts-aeroport",
  },
  {
    slug: "assurance-voyage",
    title: "Assurance voyage",
    shortDescription:
      "Couverture annulation, assistance rapatriement, frais médicaux à l'étranger. Contrats Allianz et Chapka selon la destination.",
    category: "ASSURANCE",
    icon: "shield",
    priceFromFCFA: 12000,
    priceNote: "pour 1 semaine",
    order: 50,
    isFeatured: false,
    ctaLabel: "Souscrire une assurance",
    ctaHref: "/contact?service=assurance-voyage",
  },
  {
    slug: "sur-mesure-entreprise",
    title: "Sur-mesure entreprise",
    shortDescription:
      "Séminaires, incentives, voyages de récompense, déplacements professionnels : devis dédié, facturation entreprise, reporting.",
    category: "ENTREPRISE",
    icon: "briefcase",
    priceFromFCFA: null,
    priceNote: null,
    order: 60,
    isFeatured: true,
    ctaLabel: "Demander un devis entreprise",
    ctaHref: "/contact?service=sur-mesure-entreprise",
  },
];

async function main() {
  let created = 0;
  let updated = 0;
  for (const s of SEEDS) {
    const existing = await prisma.service.findUnique({ where: { slug: s.slug } });
    if (existing) {
      await prisma.service.update({
        where: { slug: s.slug },
        data: {
          title: s.title,
          shortDescription: s.shortDescription,
          category: s.category,
          icon: s.icon,
          priceFromFCFA: s.priceFromFCFA,
          priceNote: s.priceNote,
          order: s.order,
          isFeatured: s.isFeatured,
          ctaLabel: s.ctaLabel,
          ctaHref: s.ctaHref,
          // Don't reset isActive — preserve agency choice after first seed
        },
      });
      updated++;
      console.log(`↻ ${s.slug} (updated)`);
    } else {
      await prisma.service.create({
        data: {
          ...s,
          isActive: true,
        },
      });
      created++;
      console.log(`+ ${s.slug} (created)`);
    }
  }
  console.log(`\nDone. ${created} created, ${updated} updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
