/**
 * Seed script — populates the DB with sample destinations and offers so
 * the admin and public site have something to display on first run.
 *
 * Usage: pnpm tsx scripts/seed.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const destinations = [
    {
      slug: "lac-rose",
      title: "Lac Rose",
      region: "NIAYES" as const,
      summary:
        "Baignade et dunes au bord d'un lac salé unique, à moins d'une heure de Dakar.",
      description:
        "Le Lac Rose (Retba) est un lac peu profond à la forte teneur en sel, situé à environ 35 km au nord-est de Dakar. Sa couleur rosée varie selon l'ensoleillement et la saison.",
      featured: true,
      published: true,
    },
    {
      slug: "goree",
      title: "Île de Gorée",
      region: "DAKAR" as const,
      summary:
        "Mémoire, patrimoine et traversée en chaloupe — l'escale incontournable du Sénégal.",
      description:
        "L'île de Gorée, située à 3 km de Dakar, est un lieu de mémoire de la traite négrière. Ses maisons coloniales colorées et la Maison des Esclaves en font un site classé UNESCO.",
      featured: true,
      published: true,
    },
    {
      slug: "casamance",
      title: "Casamance",
      region: "CASAMANCE" as const,
      summary:
        "Mangroves, bolongs et villages entre terre et mer, dans le sud verdoyant du pays.",
      description:
        "La Casamance, au sud du Sénégal, se distingue par ses paysages luxuriants, ses bolongs navigables et la richesse de ses traditions, notamment chez les Diolas.",
      featured: true,
      published: true,
    },
    {
      slug: "saly-portudal",
      title: "Saly-Portudal",
      region: "PETITE_COTE" as const,
      summary:
        "Plages, resorts et animations pour un séjour en bord de mer en famille ou en couple.",
      description:
        "Saly-Portudal, sur la Petite-Côte à 80 km au sud de Dakar, est la principale station balnéaire du Sénégal.",
      featured: true,
      published: true,
    },
    {
      slug: "lompoul",
      title: "Désert de Lompoul",
      region: "NIAYES" as const,
      summary:
        "Dunes sahéliennes et bivouac sous les étoiles, à 2h de Dakar.",
      published: false,
    },
  ];

  for (const d of destinations) {
    await prisma.destination.upsert({
      where: { slug: d.slug },
      create: d,
      update: d,
    });
  }
  console.log(`✓ ${destinations.length} destinations`);

  // Sample offers — linked to first 4 destinations
  const dests = await prisma.destination.findMany({
    where: { published: true },
    take: 4,
  });

  if (dests.length > 0) {
    const offers = [
      {
        slug: "goree-lac-rose-2j",
        title: "Escapade Gorée + Lac Rose",
        kind: "SEJOUR" as const,
        summary: "Deux jours pour découvrir l'essentiel autour de Dakar.",
        priceFCFA: 85000,
        durationDays: 2,
        maxGuests: 8,
        destinationId: dests[0]?.id ?? "",
        published: true,
      },
      {
        slug: "casamance-7j",
        title: "Circuit Casamance authentique",
        kind: "CIRCUIT" as const,
        summary:
          "Une semaine en Casamance entre Ziguinchor, les bolongs et les villages diolas.",
        priceFCFA: 540000,
        durationDays: 7,
        maxGuests: 10,
        destinationId: dests[2]?.id ?? dests[0]?.id ?? "",
        published: true,
      },
      {
        slug: "saly-weekend",
        title: "Week-end à Saly",
        kind: "SEJOUR" as const,
        summary: "Deux nuits en bord de mer sur la Petite-Côte.",
        priceFCFA: 120000,
        durationDays: 3,
        maxGuests: 6,
        destinationId: dests[3]?.id ?? dests[0]?.id ?? "",
        published: true,
      },
    ];

    for (const o of offers) {
      if (!o.destinationId) continue;
      await prisma.offer.upsert({
        where: { slug: o.slug },
        create: o,
        update: o,
      });
    }
    console.log(`✓ ${offers.filter((o) => o.destinationId).length} offres`);
  }

  console.log("✓ Seed terminé");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());