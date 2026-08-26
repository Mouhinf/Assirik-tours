"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/logo";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

export function SiteNav() {
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
            {siteConfig.navigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative py-2 transition-colors",
                    active
                      ? "text-ocean"
                      : "text-graphite hover:text-navy",
                  )}
                >
                  {item.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-ocean rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={whatsappLink(
                "Bonjour Assirik Tours, j'aimerais des informations sur un voyage.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-sand shadow-soft hover:bg-navy transition-colors"
            >
              Demander un devis
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-navy hover:bg-sand-deep"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {open ? (
                  <>
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="6" y1="18" x2="18" y2="6" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav
            aria-label="Navigation mobile"
            className="lg:hidden pb-4 pt-2 grid gap-1 border-t border-sand-deep"
          >
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium",
                  pathname === item.href
                    ? "bg-sand-deep text-ocean"
                    : "text-graphite hover:bg-sand-deep hover:text-navy",
                )}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={whatsappLink(
                "Bonjour Assirik Tours, j'aimerais des informations sur un voyage.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex justify-center rounded-full bg-ocean px-4 py-2.5 text-sm font-semibold text-sand hover:bg-navy"
            >
              Demander un devis
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}