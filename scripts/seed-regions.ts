/**
 * Seeds default Regions matching the legacy DestinationRegion enum values
 * (plus a "Dakar & environs" aggregation). Idempotent: re-running is a no-op
 * because the upserts key on the slug.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Seed = {
  slug: string;
  labelFr: string;
  labelEn: string;
  group: "senegal" | "international";
  order: number;
  legacyEnumKeys: string[];
};

const SEEDS: Seed[] = [
  {
    slug: "dakar-environs",
    labelFr: "Dakar & environs",
    labelEn: "Dakar area",
    group: "senegal",
    order: 10,
    legacyEnumKeys: ["DAKAR", "NIAYES", "SAINT_LOUIS"],
  },
  {
    slug: "petite-cote",
    labelFr: "Petite-Côte",
    labelEn: "Petite-Côte",
    group: "senegal",
    order: 20,
    legacyEnumKeys: ["PETITE_COTE"],
  },
  {
    slug: "casamance",
    labelFr: "Casamance",
    labelEn: "Casamance",
    group: "senegal",
    order: 30,
    legacyEnumKeys: ["CASAMANCE"],
  },
  {
    slug: "senegal-oriental",
    labelFr: "Sénégal Oriental",
    labelEn: "Eastern Senegal",
    group: "senegal",
    order: 40,
    legacyEnumKeys: ["SENEGAL_ORIENTAL"],
  },
  {
    slug: "afrique-ouest",
    labelFr: "Afrique de l'Ouest",
    labelEn: "West Africa",
    group: "international",
    order: 50,
    legacyEnumKeys: ["AFRIQUE_OUEST"],
  },
  {
    slug: "europe",
    labelFr: "Europe",
    labelEn: "Europe",
    group: "international",
    order: 60,
    legacyEnumKeys: ["EUROPE"],
  },
  {
    slug: "moyen-orient",
    labelFr: "Moyen-Orient (Omra)",
    labelEn: "Middle East (Umrah)",
    group: "international",
    order: 70,
    legacyEnumKeys: ["MOYEN_ORIENT"],
  },
  {
    slug: "asie",
    labelFr: "Asie",
    labelEn: "Asia",
    group: "international",
    order: 80,
    legacyEnumKeys: ["ASIE"],
  },
  {
    slug: "amerique",
    labelFr: "Amérique",
    labelEn: "Americas",
    group: "international",
    order: 90,
    legacyEnumKeys: ["AMERIQUE"],
  },
];

async function main() {
  for (const s of SEEDS) {
    await prisma.region.upsert({
      where: { slug: s.slug },
      create: s,
      update: {
        labelFr: s.labelFr,
        labelEn: s.labelEn,
        group: s.group,
        order: s.order,
        legacyEnumKeys: s.legacyEnumKeys,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${SEEDS.length} regions (idempotent).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
