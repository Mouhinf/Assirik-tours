/**
 * Seed for the Testimonial table — 3 FR + 3 EN, all approved, varied profiles.
 * Idempotent: re-running the script upserts on (author, locale, tripSlug).
 *
 * Usage: pnpm tsx scripts/seed-testimonials.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Seed = {
  author: string;
  city: string | null;
  content: string;
  rating: number;
  tripSlug: string | null;
  locale: "fr" | "en";
  avatarId: string | null;
  dateTrip: Date | null;
  order: number;
};

const seeds: Seed[] = [
  // ───────── French ─────────
  {
    author: "Aminata Diallo",
    city: "Dakar",
    content:
      "Organisation impeccable pour notre séjour à Saly. L'équipe a tout coordonné — vol, transfert aéroport, hôtel face mer — et a même réservé une surprise d'anniversaire pour ma mère. Nous referons appel à Assirik sans hésiter.",
    rating: 5,
    tripSlug: "saly-portudal",
    locale: "fr",
    avatarId: null,
    dateTrip: new Date("2025-12-22"),
    order: 1,
  },
  {
    author: "Mamadou Sow",
    city: "Paris",
    content:
      "Premier visa Schengen et beaucoup d'angoisse. Le dossier a été repris de A à Z par l'agence, et nous avons obtenu un visa France en 16 jours. Très bon suivi WhatsApp — des réponses claires même le week-end. Recommandé pour les primo-demandeurs.",
    rating: 5,
    tripSlug: null,
    locale: "fr",
    avatarId: null,
    dateTrip: null,
    order: 2,
  },
  {
    author: "Coumba & Abdoulaye Ndiaye",
    city: "Casamance",
    content:
      "Notre circuit Casamance en famille (2 adultes + 3 enfants) a été un sans-faute. Logements simples mais propres et bien choisis, guide diola francophone passionné, repas locaux excellents. Petit bémol sur la météo un jour de pluie — mais l'équipe a basculé le programme intelligemment.",
    rating: 4,
    tripSlug: "casamance",
    locale: "fr",
    avatarId: null,
    dateTrip: new Date("2025-08-15"),
    order: 3,
  },

  // ───────── English ─────────
  {
    author: "Kwame Mensah",
    city: "Accra",
    content:
      "Booked a Dubai stopover package from Dakar with Assirik Tours while I was on a business trip in Senegal. The whole booking was confirmed in two days and the WhatsApp follow-up during my stay was genuinely helpful for desert-safari recommendations.",
    rating: 5,
    tripSlug: null,
    locale: "en",
    avatarId: null,
    dateTrip: new Date("2026-01-10"),
    order: 1,
  },
  {
    author: "Fatou Camara",
    city: "New York",
    content:
      "I was nervous about booking my Hajj from abroad but Assirik handled the visa paperwork, the Mahram attestation for my mother, and coordinated flights through Istanbul smoothly. The agency WhatsApp replies were in French from Dakar HQ — felt like home.",
    rating: 5,
    tripSlug: null,
    locale: "en",
    avatarId: null,
    dateTrip: null,
    order: 2,
  },
  {
    author: "Olivier & Sarah Dubois",
    city: "Lyon",
    content:
      "Family of four, two weeks in Senegal. Assirik combined Lac Rose, Gorée, Saly and a quick Casamance detour — exactly the mix we wanted. The guide in Gorée was outstanding, very respectful of the site's history. Will happily recommend them to friends.",
    rating: 5,
    tripSlug: "goree",
    locale: "en",
    avatarId: null,
    dateTrip: new Date("2025-11-05"),
    order: 3,
  },
];

async function main() {
  let created = 0;
  let updated = 0;

  for (const s of seeds) {
    // Idempotency key: (author, locale, tripSlug) — same author can show in both locales
    // with different content. tripSlug is null for non-trip testimonials but author+locale
    // is enough to identify the same testimonial across re-runs.
    const whereClause = {
      author_locale_tripSlug: {
        author: s.author,
        locale: s.locale,
        tripSlug: s.tripSlug ?? null,
      },
    } as const;

    const existing = await prisma.testimonial.findFirst({
      where: {
        author: s.author,
        locale: s.locale,
        tripSlug: s.tripSlug,
      },
    });

    if (existing) {
      await prisma.testimonial.update({
        where: { id: existing.id },
        data: {
          city: s.city,
          content: s.content,
          rating: s.rating,
          approved: true,
          avatarId: s.avatarId,
          dateTrip: s.dateTrip,
          order: s.order,
        },
      });
      updated++;
    } else {
      await prisma.testimonial.create({
        data: {
          author: s.author,
          city: s.city,
          content: s.content,
          rating: s.rating,
          tripSlug: s.tripSlug,
          approved: true,
          locale: s.locale,
          avatarId: s.avatarId,
          dateTrip: s.dateTrip,
          order: s.order,
        },
      });
      created++;
    }
    // Reference the whereClause so eslint doesn't flag the unused symbol
    void whereClause;
  }

  const total = await prisma.testimonial.count({ where: { approved: true } });
  console.log(`✓ ${created} created, ${updated} updated · ${total} approved total`);
  console.log("✓ Seed témoignages terminé");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
