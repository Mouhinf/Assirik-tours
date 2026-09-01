/**
 * Seed for the BlogPost table — imports the 4 hardcoded articles from the
 * original `src/lib/blog.ts` data and writes them into the database.
 *
 * Behaviour:
 *   - Each article is inserted in French (the original language) with its
 *     cover image pointing at the local path (covers live under
 *     `public/photos/blog/`). The admin can swap to Cloudinary later.
 *   - A duplicate EN row is created as a draft with a "TODO: translate"
 *     banner so editors can pick it up later.
 *   - AuthorId defaults to the first SUPER_ADMIN user.
 *   - Idempotent: re-running upserts on (slug, locale).
 *
 * Usage: pnpm tsx scripts/seed-blog.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Seed = {
  slug: string;
  title: string;
  excerpt: string;
  category: "guides-pratiques" | "destinations" | "visa" | "omra" | "actualites";
  publishedAt: Date;
  readingMinutes: number;
  cover: string;
  author: string;
  body: string[]; // paragraphs
  tags: string[];
};

// We deliberately translate the legacy "guides" / "destinations" / "actualites"
// categories to the new enum.
const SEEDS: Seed[] = [
  {
    slug: "documents-visa-schengen-checklist-2026",
    title: "Documents visa Schengen — checklist 2026 pour les voyageurs depuis Dakar",
    excerpt:
      "Le formulaire, les photos, l'assurance, les justificatifs : tout ce qu'il faut préparer, dans l'ordre, pour éviter un refus administratif.",
    category: "visa",
    publishedAt: new Date("2026-01-12"),
    readingMinutes: 7,
    cover: "/photos/blog/visa-schengen.jpg",
    author: "Aïssatou Diop, conseillère visa",
    tags: ["visa", "schengen", "formalites"],
    body: [
      "Le visa Schengen reste le point de friction n°1 pour nos clients. Pour mettre toutes les chances de votre côté, voici la liste des pièces demandées par les consulats (France, Belgique, Italie, Espagne, Allemagne) et l'ordre dans lequel nous vous recommandons de les préparer.",
      "1) Formulaire Schengen court séjour : à remplir en MAJUSCULES, daté et signé à la main. Les versions en ligne sont disponibles sur les sites officiels des consulats. 2) Deux photos d'identité récentes (35x45 mm, fond blanc, regard face caméra). 3) Passeport valide plus de 3 mois après la date de retour, avec au moins deux pages vierges. 4) Assurance voyage (couverture minimale 30 000 €, rapatriement inclus) — nous la fournissons en PDF. 5) Billet d'avion aller-retour ou réservation bloquée (nous la générons gratuitement). 6) Justificatifs d'hébergement : réservation d'hôtel nominative ou attestation d'accueil. 7) Justificatifs financiers : trois derniers relevés bancaires + attestation de travail ou de revenus. 8) Pour les salariés : attestation de travail + congés. Pour les indépendants : registre de commerce + trois dernières déclarations fiscales.",
      "Délais observés en 2025-2026 : 15 à 21 jours pour la France, 21 à 30 jours pour l'Allemagne et l'Espagne. La haute saison (juin-août) est plus chargée — déposez six semaines à l'avance. La Belgique dématérialise une partie des dépôts via TLScontact : comptez 2 à 3 jours de gagnés.",
      "Erreurs fréquentes : photos trop anciennes, signature manquante sur le formulaire, couverture d'assurance sans rapatriement explicite, relevé bancaire sans en-tête lisible. Notre back-office revoit systématiquement votre dossier avant dépôt.",
      "À noter : depuis 2024, certains consulats demandent un questionnaire complémentaire pour les primo-demandeurs. Nous l'intégrons automatiquement à votre dossier.",
    ],
  },
  {
    slug: "meilleure-periode-partir-senegal",
    title: "Quelle période partir au Sénégal ? Climat, saisons, événements",
    excerpt:
      "De novembre à avril pour le soleil, de juillet à septembre pour les oiseaux : un guide clair pour choisir la bonne fenêtre selon votre projet.",
    category: "destinations",
    publishedAt: new Date("2026-02-03"),
    readingMinutes: 5,
    cover: "/photos/blog/meilleures-periodes.jpg",
    author: "Modou Ndiaye, responsable destination Sénégal",
    tags: ["senegal", "climat", "saisons"],
    body: [
      "Le Sénégal a deux grandes saisons : une saison sèche (novembre à mai) et une saison des pluies (juin à octobre). Le choix dépend de ce que vous venez chercher.",
      "Saison sèche (novembre-mai) — la plus touristique. Températures entre 22 et 30 °C sur la côte, plus chaudes dans le nord (Saint-Louis, Lompoul). C'est la bonne fenêtre pour les séjours balnéaires à Saly, l'excursion au Lac Rose, le bivouac à Lompoul et la Casamance (où les pistes sont praticables). Les mois les plus confortables sont janvier et février.",
      "Saison humide (juin-octobre) — peu recommandée pour un premier voyage au Sénégal. Les pistes de Casamance deviennent difficiles, certains campements ferment. En revanche, c'est la fenêtre du Djembe Festival de Casamance (février — pardon, en saison sèche) et du Festival du Sahel (mars).",
      "Pour l'observation des oiseaux migrateurs : novembre à avril, avec un pic en janvier-février dans le parc national des oiseaux du Djoudj, près de Saint-Louis.",
      "Si vous combinez Sénégal + Europe ou Sénégal + Maroc : décembre et mars sont les meilleurs mois pour enchaîner sans subir les extrêmes de part et d'autre.",
    ],
  },
  {
    slug: "omra-ramadan-formalites-budget",
    title: "Omra Ramadan — formalités, budget, conseils terrain",
    excerpt:
      "Ce qui change pendant le Ramadan, les pièces spécifiques à fournir, le budget réaliste en 2026 et les pièges à éviter.",
    category: "omra",
    publishedAt: new Date("2026-02-20"),
    readingMinutes: 8,
    cover: "/photos/blog/omra-preparation.jpg",
    author: "Cheikh Sène, coordinateur Omra & Hajj",
    tags: ["omra", "ramadan", "hajj"],
    body: [
      "L'Omra reste un voyage spirituel majeur pour nos clients sénégalais et de la diaspora. Pendant le Ramadan, la demande explose : il faut réserver 3 à 6 mois à l'avance pour les meilleurs hôtels et les vols avec escale courte.",
      "Formalités spécifiques Omra : passeport valide plus de 6 mois, photo sur fond blanc récente, certificat de vaccination (méningite ACWY + fièvre jaune à jour — exigés à l'arrivée Jeddah/Médine), formulaire Ma'ayim pré-rempli, Mahram attesté pour les femmes de moins de 45 ans.",
      "Budget réaliste 2026 pour une Omra Ramadan de 10 jours depuis Dakar (vol + hôtel 4* + transferts + visa) : 1 400 000 à 1 900 000 FCFA par personne en chambre double. Pour une Omra hors Ramadan, comptez 25 à 35 % de moins.",
      "Pièges à éviter : agences qui sous-vendent la distance aux haram (Mecque vs Médine — vérifier les deux), hôtels 'vue partielle', vols avec correspondance de 12 heures à Doha ou Dubaï (fatigant avant la Omra). Nous détaillons tout dans notre fiche d'information envoyée avant chaque devis.",
      "Conseil pratique : emportez un dictionnaire français-arabe pour les premiers jours et un adaptateur secteur type G (UK) — l'Arabie saoudite n'a pas migré vers le type C universel.",
    ],
  },
  {
    slug: "droits-passagers-vol-retarde",
    title: "Retard ou annulation de vol : vos droits en tant que passager depuis le Sénégal",
    excerpt:
      "Compensation, assistance, remboursement : ce que prévoient les règlements européens et ce que vous pouvez réellement obtenir depuis Dakar.",
    category: "actualites",
    publishedAt: new Date("2026-03-08"),
    readingMinutes: 6,
    cover: "/photos/blog/droits-passagers.jpg",
    author: "Mouhammad Bâ, responsible service client",
    tags: ["billetterie", "droits-passagers", "compagnies"],
    body: [
      "Question que nos conseillers reçoivent chaque semaine : que faire quand un vol Air Senegal, Royal Air Maroc ou Turkish Airlines décolle avec 5 heures de retard ou est annulé la veille du départ ?",
      "Le règlement européen 261/2004 protège les passagers au départ d'un aéroport européen OU au départ d'un aéroport non-européen vers l'UE, à condition que la compagnie soit européenne. Concrètement : un vol Dakar-Paris sur Air France ou Royal Air Maroc (RAM étant marocaine, le règlement s'applique) vous ouvre des droits. Un vol sur Turkish Airlines avec escale à Istanbul vers Paris : idem.",
      "Compensation forfaitaire : 250 € pour un vol < 1500 km, 400 € pour un intra-Europe (1500-3500 km), 600 € pour un long-courrier. Réductions possibles si la compagnie prouve une circonstance extraordinaire (météo, grève sauvage, problème de sécurité).",
      "À noter pour le Sénégal : depuis 2023, l'ASECNA et la réglementation nationale commencent à intégrer des dispositions similaires pour les vols domestiques. En pratique, c'est encore inégal.",
      "Conseil pratique : conservez votre carte d'embarquement, le reçu d'enregistrement, toutes les dépenses (repas, taxi, hôtel) — elles sont remboursables au-delà de 2 heures d'attente. En cas de refus de la compagnie, saisissez le service client national du transporteur, puis le médiateur. Nous accompagnons nos clients dans ces démarches pour les dossiers réservés chez nous.",
    ],
  },
];

const TRANSLATION_BANNER =
  "<!-- TODO: translate -->\nThis article is awaiting translation into English.\n\n";

async function ensureAuthorId(): Promise<string> {
  const admin = await prisma.adminUser.findFirst({
    where: { role: "SUPER_ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (admin) return admin.id;
  // Fallback: any user
  const fallback = await prisma.adminUser.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!fallback) {
    throw new Error("No AdminUser found — run `pnpm admin:create` first.");
  }
  return fallback.id;
}

function bodyToMarkdown(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}

async function main() {
  const authorId = await ensureAuthorId();
  console.log(`[seed-blog] Using authorId=${authorId}`);

  for (const seed of SEEDS) {
    const cover = seed.cover.startsWith("/") ? `local:${seed.cover}` : seed.cover;
    const body = bodyToMarkdown(seed.body);

    // FR row (published)
    const fr = await prisma.blogPost.upsert({
      where: { slug_locale: { slug: seed.slug, locale: "fr" } },
      create: {
        slug: seed.slug,
        locale: "fr",
        title: seed.title,
        excerpt: seed.excerpt,
        body,
        coverImageId: cover,
        authorId,
        category: seed.category,
        tags: seed.tags,
        readingTime: seed.readingMinutes,
        publishedAt: seed.publishedAt,
        isFeatured: false,
        seoMeta: {
          title: seed.title,
          description: seed.excerpt,
          ogImage: cover,
          keywords: seed.tags,
        },
      },
      update: {
        title: seed.title,
        excerpt: seed.excerpt,
        body,
        coverImageId: cover,
        category: seed.category,
        tags: seed.tags,
        readingTime: seed.readingMinutes,
      },
    });
    console.log(`  ✓ FR "${fr.slug}" published=${Boolean(fr.publishedAt)}`);

    // EN draft (awaiting translation)
    const en = await prisma.blogPost.upsert({
      where: { slug_locale: { slug: seed.slug, locale: "en" } },
      create: {
        slug: seed.slug,
        locale: "en",
        title: seed.title, // placeholder until translated
        excerpt: seed.excerpt,
        body: `${TRANSLATION_BANNER}${body}`,
        coverImageId: cover,
        authorId,
        category: seed.category,
        tags: seed.tags,
        readingTime: seed.readingMinutes,
        publishedAt: null,
        isFeatured: false,
        seoMeta: {
          title: "",
          description: "",
          ogImage: cover,
          keywords: [],
        },
      },
      update: {},
    });
    console.log(`  ✓ EN "${en.slug}" published=${Boolean(en.publishedAt)} (draft)`);
  }

  console.log(`\n[seed-blog] Done. ${SEEDS.length} × 2 rows in DB.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
