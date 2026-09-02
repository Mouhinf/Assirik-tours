import { prisma } from "@/lib/prisma";
import { cache } from "react";

// ── Static label maps (legacy enum-based) ──────────────────────────────────
// These stay exported for components that render enum-based labels
// (destination cards, offer cards, etc.) where the enum value is still
// the canonical source. New admin-managed Regions live in the Region table
// and are surfaced via `getActiveRegions()` / `regionWhere()` below.

export const REGION_LABELS_FR: Record<string, string> = {
  DAKAR: "Dakar",
  NIAYES: "Niayes",
  PETITE_COTE: "Petite-Côte",
  CASAMANCE: "Casamance",
  SENEGAL_ORIENTAL: "Sénégal Oriental",
  SAINT_LOUIS: "Saint-Louis",
  AFRIQUE_OUEST: "Afrique de l'Ouest",
  EUROPE: "Europe",
  MOYEN_ORIENT: "Moyen-Orient",
  ASIE: "Asie",
  AMERIQUE: "Amérique",
};

export const REGION_LABELS_EN: Record<string, string> = {
  DAKAR: "Dakar",
  NIAYES: "Niayes",
  PETITE_COTE: "Petite-Côte",
  CASAMANCE: "Casamance",
  SENEGAL_ORIENTAL: "Eastern Senegal",
  SAINT_LOUIS: "Saint-Louis",
  AFRIQUE_OUEST: "West Africa",
  EUROPE: "Europe",
  MOYEN_ORIENT: "Middle East",
  ASIE: "Asia",
  AMERIQUE: "Americas",
};

export const OFFER_KIND_LABELS_FR: Record<string, string> = {
  SEJOUR: "Séjour",
  CIRCUIT: "Circuit",
  SUR_MESURE: "Sur mesure",
  OMRA: "Omra",
  HAJJ: "Hajj",
  BILLETERIE: "Billetterie",
};

export const OFFER_KIND_LABELS_EN: Record<string, string> = {
  SEJOUR: "Stay",
  CIRCUIT: "Tour",
  SUR_MESURE: "Tailor-made",
  OMRA: "Umrah",
  HAJJ: "Hajj",
  BILLETERIE: "Flights",
};

export const LANGUAGE_BADGE: Record<string, string> = {
  fr: "Français",
  en: "English",
};

// ── Admin-managed Regions ──────────────────────────────────────────────────

export type RegionView = {
  id: string;
  slug: string;
  labelFr: string;
  labelEn: string;
  group: string;
  order: number;
  legacyEnumKeys: string[];
};

/**
 * Fetches the active Regions ordered by their public-facing order.
 * Cached per-request via React's `cache` so multiple components can call it
 * without re-hitting the DB during a single render.
 */
export const getActiveRegions = cache(async (): Promise<RegionView[]> => {
  try {
    const rows = await prisma.region.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { labelFr: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      labelFr: r.labelFr,
      labelEn: r.labelEn,
      group: r.group,
      order: r.order,
      legacyEnumKeys: r.legacyEnumKeys,
    }));
  } catch {
    // DB unreachable or migration not applied yet — return an empty list
    // so the public site never breaks.
    return [];
  }
});

/**
 * Returns the Prisma `where` fragment that matches a given Region id
 * against `Destination` rows: either via `customRegionId` (admin-managed)
 * or via the legacy enum value(s) the Region covers.
 *
 * The fragment is an `OR` so a single filter selection works whether the
 * destination uses the legacy enum or the new FK.
 */
export function regionWhere(regionId: string, legacyEnumKeys: string[]) {
  return {
    OR: [
      { customRegionId: regionId },
      ...(legacyEnumKeys.length > 0
        ? [{ region: { in: legacyEnumKeys as never } }]
        : []),
    ],
  };
}
