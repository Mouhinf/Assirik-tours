import { prisma } from "@/lib/prisma";
import { resolveImage } from "@/lib/photos";

/**
 * Hero config editable from /admin/accueil (mini-CMS).
 *
 * Stored as a PageContent row with slug="home-hero" and locale "fr" | "en".
 * The blocks JSON contains a single block of type "home-hero" with all
 * editable fields. Anything missing falls back to safe defaults so the
 * homepage never breaks when the admin row hasn't been filled yet.
 */
export type HomeHeroProps = {
  eyebrow: string;
  title: string;        // first line (rendered in navy)
  titleAccent: string;  // second line (rendered in ocean)
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  whatsappMessage: string;
  heroImageId: string | null;
};

const DEFAULT_FR: HomeHeroProps = {
  eyebrow: "Dakar · Sénégal · depuis 2009",
  title: "Vols, visas, séjours.",
  titleAccent: "Un interlocuteur unique à Dakar.",
  description:
    "Nous organisons vos voyages depuis le Sénégal — Sénégal, Omra, Maroc, Turquie, Dubaï, Europe. Billets, formalités visa et séjours coordonnés par une équipe qui connaît le terrain.",
  primaryCtaLabel: "Explorer les destinations",
  primaryCtaHref: "/destinations",
  whatsappMessage: "Bonjour Assirik Tours, j'aimerais des informations sur un voyage.",
  heroImageId: null,
};

const DEFAULT_EN: HomeHeroProps = {
  eyebrow: "Dakar · Senegal · since 2009",
  title: "Flights, visas, stays.",
  titleAccent: "A single point of contact in Dakar.",
  description:
    "We organise your trips from Senegal — Senegal, Umrah, Morocco, Turkey, Dubai, Europe. Tickets, visa paperwork and stays coordinated by a team that knows the ground.",
  primaryCtaLabel: "Browse destinations",
  primaryCtaHref: "/destinations",
  whatsappMessage: "Hello Assirik Tours, I would like information about a trip.",
  heroImageId: null,
};

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v : fallback;
}

function asStringOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

/**
 * Parses a PageContent.blocks payload into a HomeHeroProps object.
 * Tolerant: returns defaults if the JSON is missing or malformed.
 */
export function parseHomeHeroBlocks(blocks: unknown, locale: "fr" | "en"): HomeHeroProps {
  const defaults = locale === "en" ? DEFAULT_EN : DEFAULT_FR;
  if (!Array.isArray(blocks) || blocks.length === 0) return defaults;
  const first = blocks[0];
  if (!first || typeof first !== "object") return defaults;
  const props = (first as { props?: Record<string, unknown> }).props ?? {};
  return {
    eyebrow: asString(props.eyebrow, defaults.eyebrow),
    title: asString(props.title, defaults.title),
    titleAccent: asString(props.titleAccent, defaults.titleAccent),
    description: asString(props.description, defaults.description),
    primaryCtaLabel: asString(props.primaryCtaLabel, defaults.primaryCtaLabel),
    primaryCtaHref: asString(props.primaryCtaHref, defaults.primaryCtaHref),
    whatsappMessage: asString(props.whatsappMessage, defaults.whatsappMessage),
    heroImageId: asStringOrNull(props.heroImageId),
  };
}

/**
 * Reads the hero config for the homepage, with safe fallbacks.
 */
export async function getHomeHero(locale: "fr" | "en"): Promise<HomeHeroProps> {
  try {
    const row = await prisma.pageContent.findUnique({
      where: { slug_locale: { slug: "home-hero", locale } },
    });
    if (!row || !row.isActive) {
      return locale === "en" ? DEFAULT_EN : DEFAULT_FR;
    }
    return parseHomeHeroBlocks(row.blocks, locale);
  } catch {
    // DB unreachable or schema missing — never break the homepage.
    return locale === "en" ? DEFAULT_EN : DEFAULT_FR;
  }
}

/**
 * Returns the resolved Cloudinary URL for the hero background image,
 * or null if no image is set (caller decides on a CSS fallback).
 */
export function heroImageUrl(heroImageId: string | null): string | null {
  if (!heroImageId) return null;
  return resolveImage(heroImageId, "", {
    width: 1920,
    height: 1080,
    crop: "fill",
  });
}
