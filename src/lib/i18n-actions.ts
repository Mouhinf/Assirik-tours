"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, type Locale, DEFAULT_LOCALE } from "@/lib/i18n";

const COOKIE = "ass_locale";

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}

export async function getLocaleCookie(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}
