import Link from "next/link";
import type { ServiceCategory, ServiceIcon } from "@/lib/service-catalog";
import { SERVICE_CATEGORY_LABELS } from "@/lib/service-catalog";
import { resolveImage, FALLBACK_BY_SLUG } from "@/lib/photos";

export type ServiceTeaser = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: ServiceCategory;
  icon: string | null;
  imageId: string | null;
  priceFromFCFA: number | null;
  priceNote: string | null;
  isFeatured: boolean;
};

const ICON_BG: Record<ServiceIcon, string> = {
  stamp: "bg-sunrise-coral/15 text-sunrise-coral",
  hotel: "bg-ocean/15 text-ocean",
  car: "bg-navy/15 text-navy",
  shield: "bg-emerald-100 text-emerald-700",
  transfer: "bg-ocean/15 text-ocean",
  briefcase: "bg-sand-deep text-graphite",
  compass: "bg-sunrise-orange/20 text-navy",
  users: "bg-ocean/15 text-ocean",
  card: "bg-emerald-100 text-emerald-700",
};

/**
 * Compact 6-cell grid of services. Used on the homepage and re-usable
 * elsewhere. Each tile is a small card (icon + title + blurb) that links
 * to /services#{anchor} on the catalogue page.
 */
export function ServicesCompactGrid({ services }: { services: ServiceTeaser[] }) {
  if (services.length === 0) return null;
  const items = services.slice(0, 6);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {items.map((s) => {
        const iconName = (s.icon ?? "compass") as ServiceIcon;
        const iconBg = ICON_BG[iconName] ?? ICON_BG.compass;
        return (
          <Link
            key={s.id}
            href={`/services#${slugToAnchor(s.slug)}`}
            className="group relative overflow-hidden rounded-xl border border-sand-deep bg-sand transition-all hover:shadow-soft hover:-translate-y-0.5"
          >
            <div className="relative aspect-[16/7] overflow-hidden bg-sand-deep">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImage(s.imageId, FALLBACK_BY_SLUG["dakar"] ?? "/photos/destinations/dakar.jpg", {
                  width: 600,
                  height: 280,
                  crop: "fill",
                })}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] opacity-90"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-sand via-sand/80 to-transparent"
              />
              <span
                aria-hidden
                className={`absolute top-3 left-3 inline-flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}
              >
                <ServiceGlyph name={iconName} />
              </span>
            </div>
            <div className="px-4 pb-4 -mt-6 relative">
              <span className="inline-block rounded-full bg-sand px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-graphite border border-sand-deep">
                {SERVICE_CATEGORY_LABELS[s.category]}
              </span>
              <h3 className="mt-2 font-display text-base font-semibold text-navy group-hover:text-ocean transition-colors">
                {s.title}
              </h3>
              <p className="mt-1 text-xs text-graphite leading-relaxed line-clamp-2">
                {s.shortDescription}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-ocean">
                {s.priceFromFCFA != null
                  ? new Intl.NumberFormat("fr-FR").format(s.priceFromFCFA) + " FCFA"
                  : "Sur devis"}
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function slugToAnchor(slug: string) {
  return `service-${slug}`;
}

function ServiceGlyph({ name }: { name: ServiceIcon }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "stamp":
      return (
        <svg {...common}>
          <path d="M5 22h14" />
          <path d="M19 17h-1a4 4 0 00-4-4H10a4 4 0 00-4 4H5" />
          <path d="M9 11V7a3 3 0 016 0v4" />
        </svg>
      );
    case "hotel":
      return (
        <svg {...common}>
          <path d="M3 18v-6a3 3 0 013-3h12a3 3 0 013 3v6" />
          <path d="M3 18h18" />
          <path d="M9 9V5h6v4" />
        </svg>
      );
    case "car":
      return (
        <svg {...common}>
          <path d="M3 17l2-5a3 3 0 013-2h8a3 3 0 013 2l2 5" />
          <path d="M3 17h18v3H3z" />
          <circle cx="7" cy="20" r="1.5" />
          <circle cx="17" cy="20" r="1.5" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "transfer":
      return (
        <svg {...common}>
          <path d="M3 17l9-13 9 13" />
          <path d="M5 17h14l-2 4H7z" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
          <path d="M3 12h18" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      );
    case "compass":
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <polygon points="15.5 8.5 11 11 8.5 15.5 13 13" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}
