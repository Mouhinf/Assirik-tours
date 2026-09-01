/**
 * Manual validators for the GalleryItem entity.
 *
 * Same approach as faq.ts/testimonial.ts — no Zod dependency, equivalent
 * runtime checks. The shape is close enough to a Zod schema that swapping
 * later is mechanical.
 *
 * Constraints come from the brief §4:
 *   - cloudinaryId: non-empty
 *   - captionFr / captionEn: 0-280 chars
 *   - altText: 5-200 chars (required for a11y)
 *   - tags: ≤ 10 tags, each 0-30 chars
 *   - width / height: positive integers when provided
 */

import { DestinationRegion } from "@prisma/client";

export const GALLERY_REGION_KEYS = Object.values(DestinationRegion) as [
  DestinationRegion,
  ...DestinationRegion[],
];

export const REGION_LABELS_GALLERY: Record<DestinationRegion, string> = {
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

export type GalleryInput = {
  cloudinaryId: string;
  captionFr: string;
  captionEn: string;
  altText: string;
  location: string;
  region: DestinationRegion | null;
  takenAt: string | null; // ISO date
  photographer: string;
  tags: string[];
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  width: number | null;
  height: number | null;
};

export type ValidationOk<T> = { ok: true; data: T };
export type ValidationFail = { ok: false; error: string };
export type ValidationResult<T> = ValidationOk<T> | ValidationFail;

function str(v: FormDataEntryValue | null): string {
  return v == null ? "" : String(v).trim();
}

function intOpt(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

function dateOpt(v: FormDataEntryValue | null): string | null {
  const raw = str(v);
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function parseTags(v: FormDataEntryValue | null): string[] {
  if (!v) return [];
  return String(v)
    .split(/[,\n]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 10);
}

/** Derive a human alt-text from a Cloudinary public_id. */
export function deriveAltFromPublicId(publicId: string): string {
  const last = publicId.split("/").pop() ?? publicId;
  const cleaned = last
    .replace(/^[a-z0-9]+-/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
  if (!cleaned) return "Photographie de voyage";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function parseGalleryForm(form: FormData): ValidationResult<GalleryInput> {
  const cloudinaryId = str(form.get("cloudinaryId"));
  const captionFr = str(form.get("captionFr")).slice(0, 280);
  const captionEn = str(form.get("captionEn")).slice(0, 280);
  const altText = str(form.get("altText")).slice(0, 200);
  const location = str(form.get("location")).slice(0, 200);
  const regionRaw = str(form.get("region"));
  const region = (GALLERY_REGION_KEYS as string[]).includes(regionRaw)
    ? (regionRaw as DestinationRegion)
    : null;
  const takenAt = dateOpt(form.get("takenAt"));
  const photographer = str(form.get("photographer")).slice(0, 120);
  const tags = parseTags(form.get("tags"));
  const orderRaw = Number(form.get("order") ?? 0);
  const order = Number.isFinite(orderRaw) && orderRaw >= 0 ? Math.trunc(orderRaw) : 0;
  const isActive = form.get("isActive") === "on";
  const isFeatured = form.get("isFeatured") === "on";
  const width = intOpt(form.get("width"));
  const height = intOpt(form.get("height"));

  // Single tag length check
  for (const tag of tags) {
    if (tag.length > 30) {
      return { ok: false, error: `Tag trop long (max 30 car.) : "${tag}"` };
    }
  }

  if (!cloudinaryId) {
    return { ok: false, error: "L'identifiant Cloudinary est requis." };
  }
  if (captionFr.length > 280 || captionEn.length > 280) {
    return { ok: false, error: "Légende trop longue (max 280 caractères)." };
  }
  if (altText.length < 5) {
    return { ok: false, error: "Le texte alternatif doit faire au moins 5 caractères." };
  }
  if (altText.length > 200) {
    return { ok: false, error: "Le texte alternatif ne peut pas dépasser 200 caractères." };
  }
  if (tags.length > 10) {
    return { ok: false, error: "Maximum 10 tags par photo." };
  }
  if (width !== null && (!Number.isFinite(width) || width <= 0)) {
    return { ok: false, error: "La largeur doit être un entier positif." };
  }
  if (height !== null && (!Number.isFinite(height) || height <= 0)) {
    return { ok: false, error: "La hauteur doit être un entier positif." };
  }

  return {
    ok: true,
    data: {
      cloudinaryId,
      captionFr,
      captionEn,
      altText,
      location,
      region,
      takenAt,
      photographer,
      tags,
      order,
      isActive,
      isFeatured,
      width,
      height,
    },
  };
}

export function toGalleryData(input: GalleryInput) {
  return {
    cloudinaryId: input.cloudinaryId,
    captionFr: input.captionFr || null,
    captionEn: input.captionEn || null,
    altText: input.altText,
    location: input.location || null,
    region: input.region,
    takenAt: input.takenAt ? new Date(input.takenAt) : null,
    photographer: input.photographer || null,
    tags: input.tags,
    order: input.order,
    isActive: input.isActive,
    isFeatured: input.isFeatured,
    width: input.width,
    height: input.height,
  };
}
