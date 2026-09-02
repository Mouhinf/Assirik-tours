/**
 * Manual validators for the Testimonial entity.
 *
 * NOTE: This project does not currently use zod (and the prompt suggested zod
 * but the project hasn't pulled it). We implement equivalent runtime checks
 * here — same defensive shape, no extra dependency. If/when zod is added,
 * swap these for schemas without touching callers.
 */

export type TestimonialLocale = "fr" | "en";

export type TestimonialInput = {
  author: string;
  city: string | null;
  content: string;
  rating: number;
  tripSlug: string | null;
  locale: TestimonialLocale;
  avatarId: string | null;
  dateTrip: Date | null;
  order: number;
  approved: boolean;
};

export type ValidationOk<T> = { ok: true; data: T };
export type ValidationFail = { ok: false; error: string };
export type ValidationResult<T> = ValidationOk<T> | ValidationFail;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Convert an unknown FormDataEntryValue to a trimmed string (or "" if null). */
function str(v: FormDataEntryValue | null): string {
  return v == null ? "" : String(v).trim();
}

/** Convert a value to a non-negative integer; null if empty/invalid. */
function intOpt(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : null;
}

export function parseTestimonialForm(form: FormData): ValidationResult<TestimonialInput> {
  const author = str(form.get("author"));
  const city = str(form.get("city")) || null;
  const content = str(form.get("content"));
  const tripSlugRaw = str(form.get("tripSlug")) || null;
  const avatarId = str(form.get("avatarId")) || null;
  const dateTripRaw = str(form.get("dateTrip"));
  const ratingRaw = intOpt(form.get("rating")) ?? 5;
  const orderRaw = intOpt(form.get("order")) ?? 0;
  const localeRaw = str(form.get("locale")) || "fr";
  const approved = form.get("approved") === "on";

  // ── Constraints ──
  if (author.length < 2 || author.length > 100) {
    return { ok: false, error: "L'auteur doit faire entre 2 et 100 caractères." };
  }
  if (city !== null && city.length > 100) {
    return { ok: false, error: "La ville ne peut pas dépasser 100 caractères." };
  }
  if (content.length < 20 || content.length > 2000) {
    return { ok: false, error: "Le contenu doit faire entre 20 et 2000 caractères." };
  }
  if (ratingRaw < 1 || ratingRaw > 5) {
    return { ok: false, error: "La note doit être un entier entre 1 et 5." };
  }
  if (orderRaw < 0) {
    return { ok: false, error: "L'ordre doit être un entier ≥ 0." };
  }
  if (localeRaw !== "fr" && localeRaw !== "en") {
    return { ok: false, error: "Langue invalide (fr ou en)." };
  }
  if (tripSlugRaw !== null && !SLUG_RE.test(tripSlugRaw)) {
    return {
      ok: false,
      error: "Le slug du voyage doit être alphanumérique avec tirets (ex: casamance-7j).",
    };
  }
  if (avatarId !== null && avatarId.length > 200) {
    return { ok: false, error: "Identifiant Cloudinary invalide." };
  }

  let dateTrip: Date | null = null;
  if (dateTripRaw) {
    const parsed = new Date(dateTripRaw);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "Date de voyage invalide." };
    }
    // Reject future dates (only same-day is allowed for edge-clock safety)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (parsed.getTime() > today.getTime()) {
      return { ok: false, error: "La date du voyage ne peut pas être dans le futur." };
    }
    dateTrip = parsed;
  }

  return {
    ok: true,
    data: {
      author,
      city,
      content,
      rating: ratingRaw,
      tripSlug: tripSlugRaw,
      locale: localeRaw,
      avatarId,
      dateTrip,
      order: orderRaw,
      approved,
    },
  };
}

/**
 * Public submission validator — used by the unauthenticated testimonial
 * form on /temoignages/nouveau. Stricter than the admin validator:
 *   - `locale` is taken from the i18n cookie (not the form) so attackers
 *     can't mass-spam in "en" or any non-existent locale.
 *   - No `approved`, no `order`, no avatar upload — those are admin-only.
 *   - No email required (privacy-friendly); city and dateTrip stay
 *     optional.
 *
 * Always paired with `approved: false` at the action layer (moderation
 * queue) regardless of what the form posts.
 */
export type PublicTestimonialInput = {
  author: string;
  city: string | null;
  content: string;
  rating: number;
  tripSlug: string | null;
  locale: TestimonialLocale;
  dateTrip: Date | null;
};

export function parsePublicTestimonialForm(
  form: FormData,
  locale: TestimonialLocale,
): ValidationResult<PublicTestimonialInput> {
  const author = str(form.get("author"));
  const city = str(form.get("city")) || null;
  const content = str(form.get("content"));
  const tripSlugRaw = str(form.get("tripSlug")) || null;
  const ratingRaw = intOpt(form.get("rating")) ?? 5;
  const dateTripRaw = str(form.get("dateTrip"));

  // ── Constraints (mirror the admin ones for consistency) ──
  if (author.length < 2 || author.length > 100) {
    return { ok: false, error: "Le nom doit faire entre 2 et 100 caractères." };
  }
  if (city !== null && city.length > 100) {
    return { ok: false, error: "La ville ne peut pas dépasser 100 caractères." };
  }
  if (content.length < 20 || content.length > 2000) {
    return { ok: false, error: "Le témoignage doit faire entre 20 et 2000 caractères." };
  }
  if (ratingRaw < 1 || ratingRaw > 5) {
    return { ok: false, error: "La note doit être un entier entre 1 et 5." };
  }
  if (tripSlugRaw !== null && !SLUG_RE.test(tripSlugRaw)) {
    return {
      ok: false,
      error: "Le voyage sélectionné est invalide.",
    };
  }

  let dateTrip: Date | null = null;
  if (dateTripRaw) {
    const parsed = new Date(dateTripRaw);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "Date de voyage invalide." };
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (parsed.getTime() > today.getTime()) {
      return { ok: false, error: "La date du voyage ne peut pas être dans le futur." };
    }
    dateTrip = parsed;
  }

  return {
    ok: true,
    data: {
      author,
      city,
      content,
      rating: ratingRaw,
      tripSlug: tripSlugRaw,
      locale,
      dateTrip,
    },
  };
}

/**
 * Build the Prisma data shape from a validated TestimonialInput.
 * Separated so tests/callers can re-use the same normalization.
 */
/**
 * Union of the two validated shapes. Lets the admin path and the public
 * submission path share the same Prisma writer.
 */
export type TestimonialDataInput = TestimonialInput | PublicTestimonialInput;

export function toTestimonialData(input: TestimonialDataInput) {
  // Public submissions are always sent to the moderation queue with no
  // avatar and a "last" order value (will be re-ordered by an admin).
  const approved = "approved" in input ? input.approved : false;
  const order = "order" in input ? input.order : 99;
  const avatarId = "avatarId" in input ? input.avatarId : null;
  return {
    author: input.author,
    city: input.city,
    content: input.content,
    rating: input.rating,
    tripSlug: input.tripSlug,
    locale: input.locale,
    avatarId,
    dateTrip: input.dateTrip,
    order,
    approved,
  };
}
