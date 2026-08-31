/**
 * Region labels (FR/EN) and per-region accent classes used across the
 * public site. Single source of truth so the destination page, the
 * destination cards and the breadcrumb all stay in sync.
 */
export const REGION_LABELS_FR: Record<string, string> = {
  DAKAR: "Dakar & environs",
  NIAYES: "Niayes & côte nord",
  PETITE_COTE: "Petite-Côte",
  CASAMANCE: "Casamance",
  SENEGAL_ORIENTAL: "Sénégal Oriental",
  SAINT_LOUIS: "Saint-Louis & nord",
  AFRIQUE_OUEST: "Afrique de l'Ouest",
  EUROPE: "Europe",
  MOYEN_ORIENT: "Moyen-Orient",
  ASIE: "Asie",
  AMERIQUE: "Amérique",
};

export const REGION_LABELS_EN: Record<string, string> = {
  DAKAR: "Dakar & surroundings",
  NIAYES: "Niayes & northern coast",
  PETITE_COTE: "Petite-Côte",
  CASAMANCE: "Casamance",
  SENEGAL_ORIENTAL: "Eastern Senegal",
  SAINT_LOUIS: "Saint-Louis & the north",
  AFRIQUE_OUEST: "West Africa",
  EUROPE: "Europe",
  MOYEN_ORIENT: "Middle East",
  ASIE: "Asia",
  AMERIQUE: "Americas",
};

export const OFFER_KIND_LABELS_FR: Record<string, string> = {
  SEJOUR: "Séjour",
  CIRCUIT: "Circuit accompagné",
  SUR_MESURE: "Sur mesure",
  OMRA: "Omra",
  HAJJ: "Hajj",
  BILLETERIE: "Billetterie",
};

export const OFFER_KIND_LABELS_EN: Record<string, string> = {
  SEJOUR: "Stay",
  CIRCUIT: "Guided tour",
  SUR_MESURE: "Tailor-made",
  OMRA: "Umrah",
  HAJJ: "Hajj",
  BILLETERIE: "Air tickets",
};

/** Style badge used to flag testimonials by language in admin & public lists. */
export const LANGUAGE_BADGE: Record<"fr" | "en", string> = {
  fr: "bg-ocean/15 text-navy",
  en: "bg-sky/15 text-ocean",
};
