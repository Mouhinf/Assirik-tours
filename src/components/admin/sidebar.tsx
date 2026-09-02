"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: string };

const primaryItems: Item[] = [
  { href: "/admin", label: "Tableau de bord", icon: "dashboard" },
  { href: '/admin/accueil', label: "Page d'accueil", icon: 'home' },
  { href: "/admin/reservations", label: "Réservations", icon: "calendar" },
  { href: "/admin/visa", label: "Dossiers visa", icon: "stamp" },
  { href: "/admin/clients", label: "Clients (CRM)", icon: "users" },
  { href: "/admin/paiements", label: "Paiements", icon: "card" },
  { href: "/admin/destinations", label: "Destinations", icon: "map" },
  { href: "/admin/offres", label: "Offres", icon: "ticket" },
  { href: "/admin/services", label: "Services", icon: "compass" },
  { href: "/admin/media", label: "Médiathèque", icon: "image" },
  { href: "/admin/billetterie", label: "Billetterie", icon: "ticket" },
];

type ContenuSubItem = {
  href: string;
  label: string;
  icon: string;
  enabled: boolean;
};

const contenuSubItems: ContenuSubItem[] = [
  { href: "/admin/temoignages", label: "Témoignages", icon: "quote", enabled: true },
  { href: "/admin/faq", label: "FAQ", icon: "faq", enabled: true },
  { href: "/admin/blog", label: "Blog", icon: "blog", enabled: true },
  { href: "/admin/pages", label: "Pages", icon: "folder", enabled: true },
  { href: "/admin/galerie", label: "Galerie", icon: "gallery", enabled: true },
  { href: "/admin/destinations/regions", label: "Régions", icon: "map", enabled: true },
];

const trailingItems: Item[] = [
  { href: "/admin/communications", label: "Communications", icon: "megaphone" },
  { href: "/admin/rapports", label: "Rapports", icon: "chart" },
  { href: "/admin/audit", label: "Audit log", icon: "log" },
  { href: "/admin/users", label: "Utilisateurs", icon: "shield" },
  { href: "/admin/parametres", label: "Paramètres", icon: "cog" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  // Auto-open the Contenu section when one of its children is active.
  const contenuActive = contenuSubItems.some((it) =>
    it.enabled && pathname.startsWith(it.href),
  );
  const [contenuOpen, setContenuOpen] = useState(contenuActive);

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-navy text-mist">
      <div className="px-5 py-5 border-b border-white/10">
        <BrandLogo />
        <p className="mt-2 text-[0.7rem] uppercase tracking-wider text-mist/60">
          Assirik Tours · Admin
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {primaryItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-[0.85rem] transition-colors",
                active
                  ? "bg-white/10 text-sand"
                  : "text-mist/75 hover:bg-white/5 hover:text-sand",
              )}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}

        {/* Contenu section (collapsible) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setContenuOpen((v) => !v)}
            aria-expanded={contenuOpen}
            className={cn(
              "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-[0.85rem] transition-colors",
              contenuActive
                ? "text-sand"
                : "text-mist/75 hover:bg-white/5 hover:text-sand",
            )}
          >
            <Icon name="folder" />
            Contenu
            <span className="ml-auto text-mist/60">
              <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition: "transform 200ms",
                  transform: contenuOpen ? "rotate(0deg)" : "rotate(-90deg)",
                }}
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>

          {contenuOpen ? (
            <div className="mt-0.5 ml-4 space-y-0.5 border-l border-white/10 pl-2">
              {contenuSubItems.map((item) => {
                const active = pathname.startsWith(item.href);
                const baseClasses = cn(
                  "flex min-h-11 items-center gap-2.5 rounded-md px-3 py-1.5 text-[0.82rem] transition-colors",
                  item.enabled
                    ? active
                      ? "bg-white/10 text-sand"
                      : "text-mist/75 hover:bg-white/5 hover:text-sand"
                    : "text-mist/40 cursor-not-allowed",
                );
                const icon = <Icon name={item.icon} small />;

                if (!item.enabled) {
                  return (
                    <span
                      key={item.href}
                      className={baseClasses}
                      title="Bientôt disponible"
                    >
                      {icon}
                      <span className="flex-1">{item.label}</span>
                      <span className="text-[0.6rem] uppercase tracking-wider text-mist/40">
                        à venir
                      </span>
                    </span>
                  );
                }
                return (
                  <Link key={item.href} href={item.href} className={baseClasses}>
                    {icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        {trailingItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-[0.85rem] transition-colors",
                active
                  ? "bg-white/10 text-sand"
                  : "text-mist/75 hover:bg-white/5 hover:text-sand",
              )}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 text-[0.65rem] text-mist/60 uppercase tracking-wider">
        Phase 2 · en production
      </div>
    </aside>
  );
}

function Icon({ name, small = false }: { name: string; small?: boolean }) {
  const common = {
    width: small ? 14 : 16,
    height: small ? 14 : 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "dashboard":
      return <svg {...common}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>;
    case "calendar":
      return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "map":
      return <svg {...common}><polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21"/><line x1="8" y1="3" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="21"/></svg>;
    case "ticket":
      return <svg {...common}><path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 100-4V9z"/><line x1="13" y1="7" x2="13" y2="17"/></svg>;
    case "image":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
    case "cog":
      return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82v0a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
    case "users":
      return <svg {...common}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    case "card":
      return <svg {...common}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
    case "chart":
      return <svg {...common}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case "log":
      return <svg {...common}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>;
    case "stamp":
      return <svg {...common}><path d="M5 22h14"/><path d="M19 17h-1a4 4 0 00-4-4H10a4 4 0 00-4 4H5"/><path d="M5 17h14v-2H5z"/><path d="M9 11V7a3 3 0 016 0v4"/></svg>;
    case "megaphone":
      return <svg {...common}><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>;
    case "shield":
      return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case "quote":
      return (
        <svg {...common}>
          <path d="M7 8a3 3 0 00-3 3v5h5v-5H6a2 2 0 012-2V8z" fill="currentColor" stroke="none" />
          <path d="M16 8a3 3 0 00-3 3v5h5v-5h-3a2 2 0 012-2V8z" fill="currentColor" stroke="none" />
          <path d="M7 8a3 3 0 00-3 3v5h5v-5H6m10-3a3 3 0 00-3 3v5h5v-5h-3" />
        </svg>
      );
    case "faq":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2 2-2 2.5" />
          <line x1="12" y1="14.5" x2="12" y2="17" />
        </svg>
      );
    case "blog":
      return (
        <svg {...common}>
          <path d="M4 4h12l4 4v12H4z" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="13" y2="17" />
        </svg>
      );
    case "gallery":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );
    case "home":
      return <svg {...common}><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>;
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <polygon points="15.5 8.5 11 11 8.5 15.5 13 13" fill="currentColor" stroke="none" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
      );
    default:
      return null;
  }
}
