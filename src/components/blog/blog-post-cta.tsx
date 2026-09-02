import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";
// (BlogCategory is referenced indirectly via the runtime category string;
// keeping the validators import commented out so eslint stays happy until
// we add a strict typed prop.)

/**
 * Contextual CTA shown at the bottom of a blog article.
 *
 * The copy and target adapt to the article's category so that high-value
 * categories (visa, omra, destinations) route visitors to the right
 * conversion surface:
 *   - visa       → assistance visa (deep-link with service slug)
 *   - omra       → contact with a pre-filled Omra subject
 *   - destinations → destinations listing
 *   - guides-pratiques → contact (general)
 *   - actualites / null → WhatsApp (lowest-friction)
 *
 * Kept deliberately short to avoid breaking the reading rhythm.
 */
type Variant = "visa" | "omra" | "destinations" | "guides" | "actualites" | "default";

function variantFor(category: string | null): Variant {
  switch (category) {
    case "visa":
      return "visa";
    case "omra":
      return "omra";
    case "destinations":
      return "destinations";
    case "guides-pratiques":
      return "guides";
    case "actualites":
      return "actualites";
    default:
      return "default";
  }
}

type CmsShape = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

const COPY: Record<Variant, CmsShape> = {
  visa: {
    eyebrow: "Besoin d'aide pour votre dossier",
    title: "Démarrer un dossier visa avec l'agence",
    description:
      "On reprend votre checklist, on relit vos pièces, on dépose pour vous. Premier échange gratuit.",
    primaryLabel: "Demander un devis visa",
    primaryHref: "/contact?service=assistance-visa&objet=demande-visa",
    secondaryLabel: "Parler sur WhatsApp",
    secondaryHref: whatsappLink(
      "Bonjour Assirik Tours, j'aimerais démarrer un dossier visa.",
    ),
  },
  omra: {
    eyebrow: "Préparer une Omra",
    title: "Demander un devis Omra personnalisé",
    description:
      "Dates, ville de départ, hôtel proche du Haram : on construit l'Omra qui vous correspond.",
    primaryLabel: "Demander un devis Omra",
    primaryHref: "/contact?objet=omra",
    secondaryLabel: "Parler sur WhatsApp",
    secondaryHref: whatsappLink(
      "Bonjour Assirik Tours, j'aimerais des informations sur l'Omra.",
    ),
  },
  destinations: {
    eyebrow: "Voir les destinations",
    title: "Trouver le voyage qui vous ressemble",
    description:
      "Filtrez par région, durée, budget. Tous nos séjours et circuits sont éditables depuis l'agence.",
    primaryLabel: "Voir les destinations",
    primaryHref: "/destinations",
    secondaryLabel: "Demander un devis sur mesure",
    secondaryHref: "/contact?objet=destination-sur-mesure",
  },
  guides: {
    eyebrow: "Une question ?",
    title: "On vous répond en moins de 24 h",
    description:
      "Un conseiller Assirik vous rappelle ou vous écrit. Sans engagement, sans relance abusive.",
    primaryLabel: "Nous contacter",
    primaryHref: "/contact",
    secondaryLabel: "Parler sur WhatsApp",
    secondaryHref: whatsappLink(
      "Bonjour Assirik Tours, j'aurais besoin d'un conseil voyage.",
    ),
  },
  actualites: {
    eyebrow: "Une situation à régler",
    title: "On vous aide à faire valoir vos droits",
    description:
      "Retard, annulation, surbooking : confiez-nous votre dossier, on s'occupe du reste.",
    primaryLabel: "Contacter l'agence",
    primaryHref: "/contact?objet=billetterie",
    secondaryLabel: "Parler sur WhatsApp",
    secondaryHref: whatsappLink(
      "Bonjour Assirik Tours, j'ai un problème avec mon vol.",
    ),
  },
  default: {
    eyebrow: "Aller plus loin",
    title: "Parler à un conseiller Assirik",
    description:
      "Un projet de voyage, une question précise : on vous répond rapidement.",
    primaryLabel: "Nous contacter",
    primaryHref: "/contact",
    secondaryLabel: "Parler sur WhatsApp",
    secondaryHref: whatsappLink(
      "Bonjour Assirik Tours, j'aimerais des informations sur un voyage.",
    ),
  },
};

export function BlogPostCta({
  category,
  postTitle,
}: {
  category: string | null;
  postTitle: string;
}) {
  const variant = variantFor(category);
  const copy = COPY[variant];

  return (
    <aside
      aria-label="Action recommandée après lecture"
      className="my-10 rounded-2xl border border-ocean/30 bg-ocean/5 p-6 md:p-8"
      data-blog-cta={variant}
    >
      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-ocean">
        {copy.eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold text-navy text-balance">
        {copy.title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm md:text-base text-graphite leading-relaxed">
        {copy.description}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href={copy.primaryHref}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand transition-colors hover:bg-navy"
        >
          {copy.primaryLabel} <span aria-hidden className="ml-1">→</span>
        </Link>
        {copy.secondaryHref && copy.secondaryLabel ? (
          <Link
            href={copy.secondaryHref}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-sand-deep bg-sand px-5 py-2.5 text-sm font-semibold text-graphite transition-colors hover:text-navy"
          >
            {copy.secondaryLabel}
          </Link>
        ) : null}
      </div>
      <p className="mt-4 text-[0.7rem] text-silver">
        Article : <span className="font-semibold text-graphite">{postTitle}</span>
      </p>
    </aside>
  );
}
