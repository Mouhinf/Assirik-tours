"use client";

import { setLocale, getLocaleCookie } from "@/lib/i18n-actions";
import { useTransition } from "react";

export function LangSwitcher({ current }: { current: "fr" | "en" }) {
  const [pending, start] = useTransition();
  const other = current === "fr" ? "en" : "fr";
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => setLocale(other))}
      aria-label="Switch language"
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wider text-graphite hover:text-ocean transition-colors"
    >
      <span aria-hidden>🌐</span>
      <span className={current === "fr" ? "text-navy font-bold" : "opacity-60"}>FR</span>
      <span aria-hidden className="opacity-30">/</span>
      <span className={current === "en" ? "text-navy font-bold" : "opacity-60"}>EN</span>
    </button>
  );
}
