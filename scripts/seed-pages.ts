/**
 * Seed for the PageContent table — fills the `about` and `services` slugs
 * in both FR and EN with sensible defaults the admin can refine.
 *
 * Idempotent: re-running upserts on (slug, locale).
 *
 * Usage: pnpm tsx scripts/seed-pages.ts
 */
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type Seed = {
  slug: "about" | "services";
  locale: "fr" | "en";
  title: string;
  subtitle: string | null;
  blocks: Prisma.InputJsonValue;
  seoMeta: Prisma.InputJsonValue;
};

const aboutFr: Seed = {
  slug: "about",
  locale: "fr",
  title: "Une agence dakaroise, pas une plateforme",
  subtitle: null,
  seoMeta: {
    title: "À propos — Assirik Tours",
    description:
      "L'histoire d'Assirik Tours, notre équipe à Dakar, nos agréments et notre manière de travailler — pour comprendre à qui vous confiez votre voyage.",
    ogImage: "",
    keywords: ["agence voyage dakar", "assirik tours", "equipe"],
  },
  blocks: [
    {
      type: "hero",
      props: {
        title: "Une agence dakaroise, pas une plateforme",
        subtitle:
          "Installés à Dakar depuis 2008, nous organisons vos voyages depuis le Sénégal — pour les Sénégalais, les résidents et la diaspora.",
        cta: { label: "Discuter avec un conseiller", href: "/contact" },
      },
    },
    {
      type: "stats",
      props: {
        items: [
          { value: "2008", label: "Année de fondation" },
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
          "## Notre histoire\n\nAssirik Tours est née à Fass Delorme en 2008 d'un constat simple : organiser un vol ou un voyage complet depuis Dakar demandait de naviguer entre cinq interlocuteurs, cinq factures, cinq versions de la même information.\n\nNous avons commencé par les billets d'avion et l'assistance visa, puis ajouté les séjours, les circuits et l'Omra — toujours avec la même équipe, le même interlocuteur, le même engagement de bout en bout.",
        right:
          "## Notre manière de travailler\n\nPas de formulaire perdu, pas de devis automatisé. Un conseiller vous rappelle, vérifie vos pièces, vous alerte sur les délais, et reste disponible jusqu'au retour.\n\nNous travaillons en partenariat direct avec les compagnies aériennes (IATA), les consulats (pour la partie visa) et une sélection d'hôtels et de guides locaux — pour pouvoir intervenir vite quand un voyage dérape.",
      },
    },
    {
      type: "team-grid",
      props: {
        members: [
          {
            name: "Aïssatou Diop",
            role: "Conseillère visa & Schengen",
            bio: "15 ans d'expérience consulat France / Belgique. Vérifie chaque dossier avant dépôt.",
          },
          {
            name: "Modou Ndiaye",
            role: "Responsable destination Sénégal",
            bio: "Ancien guide de la Casamance au Lac Rose. Conçoit nos séjours et nos circuits accompagnés.",
          },
          {
            name: "Cheikh Sène",
            role: "Coordinateur Omra & Hajj",
            bio: "Spécialiste des programmes Ramadan et hors Ramadan. A accompagné plus de 600 pèlerins.",
          },
          {
            name: "Mouhammad Bâ",
            role: "Service client & billetterie",
            bio: "Ancien agent Air Sénégal. Gère leslitiges compagnies et les dossiers de compensation.",
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
        title: "Un projet de voyage en tête ?",
        description:
          "Décrivez-le-nous en quelques phrases, un conseiller vous rappelle sous 24 heures ouvrées.",
        cta: { label: "Demander un devis", href: "/contact" },
      },
    },
  ],
};

const aboutEn: Seed = {
  ...aboutFr,
  locale: "en",
  title: "A Dakar-based agency, not a platform",
  subtitle: null,
  seoMeta: {
    title: "About — Assirik Tours",
    description:
      "The story of Assirik Tours, our team in Dakar, our accreditations and the way we work — so you know exactly who handles your trip.",
    ogImage: "",
    keywords: ["dakar travel agency", "assirik tours", "team"],
  },
  blocks: [
    {
      type: "hero",
      props: {
        title: "A Dakar-based agency, not a platform",
        subtitle:
          "Based in Dakar since 2008, we organise trips from Senegal — for Senegalese, residents and the diaspora.",
        cta: { label: "Talk to a consultant", href: "/contact" },
      },
    },
    {
      type: "stats",
      props: {
        items: [
          { value: "2008", label: "Founded" },
          { value: "4,800+", label: "Travellers served" },
          { value: "12", label: "Countries covered" },
          { value: "98%", label: "Happy travellers" },
        ],
      },
    },
    {
      type: "two-column",
      props: {
        left:
          "## Our story\n\nAssirik Tours was born in Fass Delorme in 2008 from a simple observation: organising a flight or a full trip from Dakar meant juggling five contacts, five invoices, five versions of the same information.\n\nWe started with air tickets and visa assistance, then added stays, escorted tours and Umrah — always with the same team, the same contact person, the same commitment end-to-end.",
        right:
          "## How we work\n\nNo lost form, no automated quote. A consultant calls you back, checks your paperwork, flags the timelines, and stays available until you return.\n\nWe work directly with airlines (IATA), consulates (for the visa side) and a curated list of hotels and local guides — so we can move fast when a trip goes sideways.",
      },
    },
    {
      type: "team-grid",
      props: {
        members: [
          {
            name: "Aïssatou Diop",
            role: "Visa & Schengen advisor",
            bio: "15 years at the French and Belgian consulates. Reviews every file before submission.",
          },
          {
            name: "Modou Ndiaye",
            role: "Senegal destination lead",
            bio: "Former guide from Casamance to the Pink Lake. Designs our escorted tours and stays.",
          },
          {
            name: "Cheikh Sène",
            role: "Umrah & Hajj coordinator",
            bio: "Ramadan and off-season specialist. Has supported 600+ pilgrims.",
          },
          {
            name: "Mouhammad Bâ",
            role: "Customer service & ticketing",
            bio: "Former Air Senegal agent. Handles airline disputes and compensation files.",
          },
        ],
      },
    },
    {
      type: "text",
      props: {
        body:
          "## Our commitments\n\n- **No hidden fees** — the quoted price is the price paid.\n- **One point of contact** per file, from quote to return.\n- **Financial guarantee** — licensed travel agency (Senegal Ministry of Tourism).\n- **Local commitment** — where possible, we work with Senegalese partners.",
        align: "left",
      },
    },
    {
      type: "cta-banner",
      props: {
        title: "A trip in mind?",
        description: "Tell us in a few lines — a consultant will get back within 24 business hours.",
        cta: { label: "Request a quote", href: "/contact" },
      },
    },
  ],
};

const servicesFr: Seed = {
  slug: "services",
  locale: "fr",
  title: "Tout ce qu'il faut autour du billet",
  subtitle: null,
  seoMeta: {
    title: "Services — Assirik Tours",
    description:
      "Assistance visa, hôtels, location de véhicule avec chauffeur, assurance voyage, transferts aéroport — tous les services complémentaires d'Assirik Tours.",
    ogImage: "",
    keywords: ["assistance visa", "transfert aeroport dakar", "assurance voyage"],
  },
  blocks: [
    {
      type: "hero",
      props: {
        title: "Tout ce qu'il faut autour du billet",
        subtitle:
          "Voyager, c'est aussi régler les formalités et le confort sur place. Voici les services que nous coordonnons pour vous.",
        cta: { label: "Demander un devis", href: "/contact" },
      },
    },
    {
      type: "service-list",
      props: {
        services: [
          {
            icon: "stamp",
            title: "Assistance visa",
            description:
              "Schengen, USA, Canada, Royaume-Uni, Omra. Constitution du dossier, vérification, accompagnement au dépôt si nécessaire.",
            priceFrom: 25000,
          },
          {
            icon: "pin",
            title: "Réservation d'hôtels",
            description:
              "Sélection d'hôtels et de lodges partenaires au Sénégal, en Casamance, à Saly, Saint-Louis et dans les destinations internationales.",
          },
          {
            icon: "car",
            title: "Véhicule avec chauffeur",
            description:
              "Transferts AIBD, déplacements Dakar, circuits privatisés. Chauffeurs francophones et anglophones.",
            priceFrom: 35000,
          },
          {
            icon: "shield",
            title: "Assurance voyage",
            description:
              "Annulation, rapatriement, bagages. PDF fourni en 24h, compatible avec les exigences consulats.",
            priceFrom: 8000,
          },
          {
            icon: "building",
            title: "Transferts aéroport",
            description:
              "AIBD ↔ Dakar centre, Saly, Saint-Louis. Accueil personnalisé à l'arrivée, suivi du vol en temps réel.",
            priceFrom: 15000,
          },
          {
            icon: "ticket",
            title: "Sur-mesure entreprise",
            description:
              "Déplacements pros, séminaires, incentives. Gestion centralisée pour les équipes et reporting.",
          },
        ],
      },
    },
    {
      type: "two-column",
      props: {
        left:
          "## Ce qui est inclus\n\nTous nos services incluent une assistance 7j/7 pendant le voyage. En cas d'imprévu (vol retardé, hôtel fermé, problème de visa), un conseiller joignable reprend le dossier.\n\nLes tarifs sont indicatifs : ils dépendent de la destination, des dates et du niveau de service choisi. Le devis final est toujours confirmé avant paiement.",
        right:
          "## Notre approche\n\nNous ne vendons pas de packages « tout compris » figés. Chaque service est coordonné sur mesure selon votre projet, votre budget et vos contraintes de dates.\n\nPour les entreprises, nous proposons une facturation centralisée et un reporting par voyageur — utile pour les politiques voyages internes.",
      },
    },
    {
      type: "cta-banner",
      props: {
        title: "Besoin d'un devis détaillé ?",
        description:
          "Listez les services qui vous intéressent, un conseiller vous répond sous 24 heures.",
        cta: { label: "Nous contacter", href: "/contact" },
      },
    },
  ],
};

const servicesEn: Seed = {
  ...servicesFr,
  locale: "en",
  title: "Everything you need around the ticket",
  subtitle: null,
  seoMeta: {
    title: "Services — Assirik Tours",
    description:
      "Visa assistance, hotels, car with driver, travel insurance, airport transfers — every complementary service from Assirik Tours.",
    ogImage: "",
    keywords: ["visa assistance", "dakar airport transfer", "travel insurance"],
  },
  blocks: [
    {
      type: "hero",
      props: {
        title: "Everything you need around the ticket",
        subtitle:
          "Travelling means handling paperwork and on-the-ground comfort too. Here are the services we coordinate for you.",
        cta: { label: "Request a quote", href: "/contact" },
      },
    },
    {
      type: "service-list",
      props: {
        services: [
          {
            icon: "stamp",
            title: "Visa assistance",
            description:
              "Schengen, USA, Canada, UK, Umrah. File preparation, review and on-site deposit if needed.",
            priceFrom: 38,
          },
          {
            icon: "pin",
            title: "Hotel booking",
            description:
              "Curated hotels and lodges in Senegal — Casamance, Saly, Saint-Louis — plus international destinations.",
          },
          {
            icon: "car",
            title: "Car with driver",
            description:
              "AIBD airport transfers, Dakar moves, private tours. French and English-speaking drivers.",
            priceFrom: 55,
          },
          {
            icon: "shield",
            title: "Travel insurance",
            description:
              "Cancellation, repatriation, luggage. PDF in 24h, accepted by all consulates.",
            priceFrom: 12,
          },
          {
            icon: "building",
            title: "Airport transfers",
            description:
              "AIBD ↔ Dakar centre, Saly, Saint-Louis. Personal welcome on arrival, live flight tracking.",
            priceFrom: 23,
          },
          {
            icon: "ticket",
            title: "Corporate bespoke",
            description:
              "Business travel, seminars, incentives. Centralised billing and reporting per traveller.",
          },
        ],
      },
    },
    {
      type: "two-column",
      props: {
        left:
          "## What's included\n\nEvery service comes with 7/7 assistance during the trip. If something goes sideways — delayed flight, hotel closed, visa issue — a reachable consultant takes over.\n\nPrices are indicative: they depend on destination, dates and service level. The final quote is always confirmed before payment.",
        right:
          "## Our approach\n\nWe don't sell rigid all-inclusive packages. Every service is tailored to your project, your budget and your date constraints.\n\nFor companies we offer centralised billing and per-traveller reporting — useful for internal travel policies.",
      },
    },
    {
      type: "cta-banner",
      props: {
        title: "Need a detailed quote?",
        description: "List the services you need, a consultant replies within 24 hours.",
        cta: { label: "Contact us", href: "/contact" },
      },
    },
  ],
};

async function main() {
  const seeds = [aboutFr, aboutEn, servicesFr, servicesEn];
  for (const seed of seeds) {
    const row = await prisma.pageContent.upsert({
      where: { slug_locale: { slug: seed.slug, locale: seed.locale } },
      create: {
        slug: seed.slug,
        locale: seed.locale,
        title: seed.title,
        subtitle: seed.subtitle,
        blocks: seed.blocks,
        seoMeta: seed.seoMeta,
        isActive: true,
      },
      update: {
        title: seed.title,
        subtitle: seed.subtitle,
        blocks: seed.blocks,
        seoMeta: seed.seoMeta,
      },
    });
    console.log(`  ✓ ${row.slug}/${row.locale} — ${(row.blocks as unknown[]).length} bloc(s)`);
  }
  console.log(`\n[seed-pages] Done. ${seeds.length} page(s) upserted.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
