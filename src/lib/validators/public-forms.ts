/**
 * Shared validators and spam-protection helpers for public-facing forms.
 *
 * - `EMAIL_RE` / `PHONE_RE` — conservative regexes, used server-side.
 * - `checkHoneypot(formData)` — returns true when the hidden honeypot field
 *   has been filled in, which is the canonical signal of a bot.
 * - `getClientIp()` — best-effort client IP for rate-limit keys.
 * - `formRateLimit(key, ...)` — in-memory token bucket per (form, ip+email).
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Allows "+", " " and "-" between digits. We strip formatting before applying
// a digit-count check.
export const PHONE_RE = /^[+\d][\d\s().+-]{6,}$/;

export const HONEYPOT_FIELD = "website_url";

/** Returns true if the submission looks like a bot. */
export function checkHoneypot(formData: FormData): boolean {
  const v = formData.get(HONEYPOT_FIELD);
  if (v == null) return false;
  const str = String(v).trim();
  // A real human never fills this hidden field. Anything non-empty is suspicious.
  return str.length > 0;
}

export function isValidEmail(email: string) {
  return EMAIL_RE.test(email);
}

export function isValidPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 8 || cleaned.length > 16) return false;
  return PHONE_RE.test(phone.trim());
}

/** Detects obvious garbage payloads (huge strings, control chars, etc.). */
export function isPlausibleInput(value: string, maxLen = 4000) {
  if (typeof value !== "string") return false;
  if (value.length === 0 || value.length > maxLen) return false;
  // Reject control chars except newline / tab / carriage-return.
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(value)) return false;
  return true;
}

/** Strips any HTML tags from a free-text field before persisting it. */
export function sanitizePlainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ─── In-memory rate-limit token bucket ─────────────────────────────── */

type Bucket = { count: number; resetAt: number; lockedUntil?: number };
const BUCKETS = new Map<string, Bucket>();

export type RateLimitConfig = {
  /** Time window in ms (sliding reset). */
  windowMs: number;
  /** Max submissions within the window before locking. */
  max: number;
  /** Hard lock duration after exceeding the limit (ms). */
  lockMs: number;
};

export type RateLimitResult =
  | { ok: true }
  | { ok: false; error: string };

const DEFAULTS: RateLimitConfig = {
  windowMs: 10 * 60 * 1000,
  max: 5,
  lockMs: 30 * 60 * 1000,
};

/**
 * Atomically registers a submission. Returns `ok: true` if under the limit,
 * `ok: false` with a user-facing French error otherwise.
 */
export function formRateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {},
): RateLimitResult {
  const cfg = { ...DEFAULTS, ...config };
  const now = Date.now();
  const bucket = BUCKETS.get(key);
  if (bucket?.lockedUntil && bucket.lockedUntil > now) {
    const min = Math.ceil((bucket.lockedUntil - now) / 60000);
    return { ok: false, error: `Trop de tentatives. Réessayez dans ${min} min.` };
  }
  if (!bucket || bucket.resetAt < now) {
    BUCKETS.set(key, { count: 1, resetAt: now + cfg.windowMs });
    return { ok: true };
  }
  bucket.count += 1;
  if (bucket.count > cfg.max) {
    bucket.lockedUntil = now + cfg.lockMs;
    return {
      ok: false,
      error: `Trop de tentatives. Réessayez dans ${Math.ceil(cfg.lockMs / 60000)} min.`,
    };
  }
  return { ok: true };
}

export function resetFormRate(key: string) {
  BUCKETS.delete(key);
}
