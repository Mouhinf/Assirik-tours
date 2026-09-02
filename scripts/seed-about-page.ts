/**
 * Seed / upgrade the `about` PageContent rows (FR + EN).
 *
 * Idempotent: re-running upserts the same slugs and overwrites blocks only
 * if the existing row has been *manually* emptied (heuristic: if blocks count
 * is 0). Otherwise we leave agency-edited content untouched.
 *
 * Run with: `pnpm tsx scripts/seed-about-page.ts`
 */
import { prisma } from "../src/lib/prisma";

const FR_BLOCKS = [
  {
    type: "hero",
    props: {
      cta: { href: "/contact", label: "Discuter avec un conseiller" },
      title: "Une agence dakaroise, pas une plateforme",
      subtitle:
        "Installés à Dakar depuis 2009, nous organisons vos voyages depuis le Sénégal — pour les Sénégalais, les résidents et la diaspora.",
    },
  },
  {
    type: "stats",
    props: {
      items: [
        { value: "2009", label: "Année de fondation" },
        { value: "17", label: "Années d'expérience" },
        { value: "4 800+", label: "Voyageurs accompagnés" },
        { value: "12", label: "Pays desservis" },
        { value: "98 %", label: "Voyageurs satisfaits" },
      ],
    },
  },
  {
    type: "two-column",
    props: {
      left:
        "## Notre histoire\n\nAssirik Tours est née à Fass Delorme en 2009 d'un constat simple : organiser un vol ou un voyage complet depuis Dakar demandait de naviguer entre cinq interlocuteurs, cinq factures, cinq versions de la même information.\n\nNous avons commencé par les billets d'avion et l'assistance visa, puis ajouté les séjours, les circuits et l'Omra — toujours avec la même équipe, le même interlocuteur, le même engagement de bout en bout.",
      right:
        "## Notre manière de travailler\n\nPas de formulaire perdu, pas de devis automatisé. Un conseiller vous rappelle, vérifie vos pièces, vous alerte sur les délais, et reste disponible jusqu'au retour.\n\nNous travaillons en partenariat direct avec les compagnies aériennes (IATA), les consulats (pour la partie visa) et une sélection d'hôtels et de guides locaux — pour pouvoir intervenir vite quand un voyage dérape.",
    },
  },
  {
    type: "team-grid",
    props: {
      members: [
        {
          bio: "17 ans d'expérience consulat France / Belgique. Vérifie chaque dossier avant dépôt.",
          name: "Aïssatou Diop",
          role: "Conseillère visa & Schengen",
        },
        {
          bio: "Ancien guide de la Casamance au Lac Rose. Conçoit nos séjours et nos circuits accompagnés.",
          name: "Modou Ndiaye",
          role: "Responsable destination Sénégal",
        },
        {
          bio: "Spécialiste des programmes Ramadan et hors Ramadan. A accompagné plus de 600 pèlerins.",
          name: "Cheikh Sène",
          role: "Coordinateur Omra & Hajj",
        },
        {
          bio: "Ancien agent Air Sénégal. Gère les litiges compagnies et les dossiers de compensation.",
          name: "Mouhammad Bâ",
          role: "Service client & billetterie",
        },
      ],
    },
  },
  {
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
  },
  {
    type: "text",
    props: {
      body:
        "## Nos engagements\n\n- **Pas de frais cachés** — le prix annoncé est le prix payé.\n- **Un seul interlocuteur** par dossier, du devis au retour.\n- **Garantie financière** — licence agence de voyages (Ministère du Tourisme, Sénégal).\n- **Engagement local** — quand c'est possible, nous travaillons avec des partenaires sénégalais.",
      align: "left",
    },
  },
  {
    type: "cta-banner",
    props: {
      cta: { href: "/contact", label: "Demander un devis" },
      title: "Un projet de voyage en tête ?",
      description:
        "Décrivez-le-nous en quelques phrases, un conseiller vous rappelle sous 24 heures ouvrées.",
    },
  },
];

const EN_BLOCKS = FR_BLOCKS.map((b) => JSON.parse(JSON.stringify(b))); // start from FR
// Quick i18n of the user-facing strings
EN_BLOCKS[0] = {
  type: "hero",
  props: {
    cta: { href: "/contact", label: "Talk to an advisor" },
    title: "A Dakar-based agency, not a platform",
    subtitle:
      "Based in Dakar since 2009, we organise your trips from Senegal — for Senegalese, expats and the diaspora.",
  },
};
EN_BLOCKS[1] = {
  type: "stats",
  props: {
    items: [
      { value: "2009", label: "Founded" },
      { value: "17", label: "Years of experience" },
      { value: "4,800+", label: "Travellers served" },
      { value: "12", label: "Countries covered" },
      { value: "98%", label: "Satisfied travellers" },
    ],
  },
};

async function main() {
  for (const [locale, blocks, title] of [
    ["fr", FR_BLOCKS, "Une agence dakaroise, pas une plateforme"],
    ["en", EN_BLOCKS, "A Dakar-based agency, not a platform"],
  ] as const) {
    const existing = await prisma.pageContent.findUnique({
      where: { slug_locale: { slug: "about", locale } },
    });
    if (!existing) {
      await prisma.pageContent.create({
        data: {
          slug: "about",
          locale,
          title,
          blocks: blocks as never,
          isActive: true,
        },
      });
      console.log(`+ about/${locale} (created)`);
    } else {
      const existingBlocks = Array.isArray(existing.blocks) ? existing.blocks : [];
      const isEmpty = existingBlocks.length === 0;
      if (isEmpty) {
        await prisma.pageContent.update({
          where: { id: existing.id },
          data: { blocks: blocks as never },
        });
        console.log(`↻ about/${locale} (re-seeded — was empty)`);
      } else {
        console.log(`· about/${locale} (skipped — has ${existingBlocks.length} blocks)`);
      }
    }
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
