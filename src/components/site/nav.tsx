"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/logo";
import { LangSwitcher } from "@/components/site/lang-switcher";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";
import { t, type Locale } from "@/lib/i18n";

const NAV_KEYS = [
  { href: "/destinations", key: "nav.destinations" },
  { href: "/offres", key: "nav.offres" },
  { href: "/billetterie", key: "nav.billetterie" },
  { href: "/services", key: "nav.services" },
  { href: "/a-propos", key: "nav.a_propos" },
  { href: "/blog", key: "nav.blog" },
  { href: "/contact", key: "nav.contact" },
] as const;

export function SiteNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-sand/90 backdrop-blur supports-[backdrop-filter]:bg-sand/75 border-b border-sand-deep">
      <div className="container-narrow">
        <div className="flex h-16 items-center justify-between gap-4">
          <BrandLogo />

          <nav
            aria-label="Navigation principale"
            className="hidden lg:flex items-center gap-7 text-[0.92rem] font-medium"
          >
            {NAV_KEYS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative py-2 transition-colors",
                    active ? "text-navy" : "text-graphite hover:text-navy",
                  )}
                >
                  {t(item.key, locale)}
                  {active ? (
                    <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-ocean" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <LocaleAwareLangSwitcher locale={locale} />
            <a
              href={whatsappLink("Bonjour Assirik Tours, j'aimerais des informations sur un voyage.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-whatsapp px-4 py-2 text-sm font-semibold text-sand transition-colors hover:bg-whatsapp-hover"
            >
              <WhatsappIcon />
              WhatsApp
            </a>
          </div>

          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-graphite hover:text-navy"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {open ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>

        {open ? (
          <div className="lg:hidden pb-5 pt-2 space-y-2">
            {NAV_KEYS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-graphite hover:bg-sand-deep/50 hover:text-navy"
                onClick={() => setOpen(false)}
              >
                {t(item.key, locale)}
              </Link>
            ))}
            <a
              href={whatsappLink("Bonjour Assirik Tours, j'aimerais des informations sur un voyage.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-whatsapp px-4 py-2 text-sm font-semibold text-sand hover:bg-whatsapp-hover"
            >
              <WhatsappIcon /> WhatsApp
            </a>
            <div className="pt-2"><LocaleAwareLangSwitcher locale={locale} /></div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

/**
 * The server layout supplies the cookie-backed locale, keeping the initial
 * client render and the language switcher's selected state in sync.
 */
function LocaleAwareLangSwitcher({ locale }: { locale: Locale }) {
  return <LangSwitcher current={locale} />;
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M16 3C9.4 3 4 8.4 4 15c0 2.5.8 4.9 2.2 6.9L4 29l7.3-2.1c1.9 1 4 1.6 6.2 1.6h.5c6.6 0 12-5.4 12-12S22.6 3 16 3z" />
    </svg>
  );
}
