/**
 * One-shot migration: insert a `credentials-grid` block into the existing
 * `about` PageContent rows (FR + EN) at position 4 (after team-grid, before
 * the engagements text block).
 *
 * Idempotent: if the block is already present, do nothing.
 *
 * Run with: `pnpm tsx scripts/migrate-about-credentials.ts`
 */
import { prisma } from "../src/lib/prisma";

const CREDENTIALS_FR = {
  type: "credentials-grid",
  props: {
    items: [
      {
        name: "Licence agence de voyages",
        issuer: "Ministère du Tourisme (Sénégal)",
        description:
          "Agréé pour la vente de forfaits et l'assistance visa sur le territoire sénégalais.",
      },
      {
        name: "IATA",
        issuer: "International Air Transport Association",
        description:
          "Achat direct en compte auprès des compagnies aériennes — pas d'intermédiaire caché.",
      },
      {
        name: "Partenaire VFS / TLS",
        issuer: "Centres de demande visa",
        description:
          "Prise de rendez-vous et dépôt de dossiers pour la France, la Belgique, l'Espagne, etc.",
      },
      {
        name: "Membre APS",
        issuer: "Association des Professionnels du Sénégal",
        description:
          "Engagement déontologique vis-à-vis de la profession et des voyageurs.",
      },
    ],
  },
};

const CREDENTIALS_EN = {
  type: "credentials-grid",
  props: {
    items: [
      {
        name: "Travel agency licence",
        issuer: "Ministry of Tourism (Senegal)",
        description:
          "Licensed to sell packages and assist with visas on Senegalese territory.",
      },
      {
        name: "IATA",
        issuer: "International Air Transport Association",
        description:
          "Direct account with airlines — no hidden intermediary.",
      },
      {
        name: "VFS / TLS partner",
        issuer: "Visa application centres",
        description:
          "Appointment booking and file drop-off for France, Belgium, Spain, etc.",
      },
      {
        name: "APS member",
        issuer: "Senegal Travel Professionals Association",
        description:
          "Commitment to professional ethics towards the trade and travellers.",
      },
    ],
  },
};

async function main() {
  for (const [locale, block] of [
    ["fr", CREDENTIALS_FR],
    ["en", CREDENTIALS_EN],
  ] as const) {
    const row = await prisma.pageContent.findUnique({
      where: { slug_locale: { slug: "about", locale } },
    });
    if (!row) {
      console.log(`· about/${locale} (row missing, skipped)`);
      continue;
    }
    const blocks = (Array.isArray(row.blocks) ? row.blocks : []) as Array<Record<string, unknown>>;
    if (blocks.some((b) => b.type === "credentials-grid")) {
      console.log(`· about/${locale} (already has credentials-grid, skipped)`);
      continue;
    }
    // Insert after the first team-grid; if none, append before cta-banner; else append at end.
    const teamIdx = blocks.findIndex((b) => b.type === "team-grid");
    const ctaIdx = blocks.findIndex((b) => b.type === "cta-banner");
    let insertAt =
      teamIdx >= 0 ? teamIdx + 1 : ctaIdx >= 0 ? ctaIdx : blocks.length;
    const next = [...blocks];
    next.splice(insertAt, 0, block as Record<string, unknown>);
    await prisma.pageContent.update({
      where: { id: row.id },
      data: { blocks: next as never },
    });
    console.log(`↻ about/${locale} (credentials-grid inserted at index ${insertAt})`);
  }
  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
