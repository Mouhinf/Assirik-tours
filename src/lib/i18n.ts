/**
 * Lightweight i18n — the public site defaults to French and exposes an
 * English copy for the key surfaces (home, nav, footer CTAs). We avoid
 * next-intl on purpose to keep the App Router simple; pages that need
 * translation call `t("nav.destinations", "en")`.
 *
 * If a key is missing in the target locale, the function falls back to
 * the FR version, then to the key itself.
 */
import fr from "../../messages/fr.json";
import en from "../../messages/en.json";

type Dict = Record<string, unknown>;
const DICTS: Record<string, Dict> = { fr: fr as Dict, en: en as Dict };

export type Locale = "fr" | "en";
export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fr" || value === "en";
}

/** Resolve a dotted key like "nav.destinations" against a dict. */
export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  const parts = key.split(".");
  for (const dict of [DICTS[locale], DICTS[DEFAULT_LOCALE]]) {
    let cur: unknown = dict;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in (cur as Dict)) {
        cur = (cur as Dict)[p];
      } else {
        cur = undefined;
        break;
      }
    }
    if (typeof cur === "string") return cur;
  }
  return key;
}

/** Detect locale from a Next.js cookies() store. */
export async function getRequestLocale(): Promise<Locale> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const v = store.get("ass_locale")?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}
