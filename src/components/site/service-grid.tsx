import Link from "next/link";
import { formatFCFA } from "@/lib/utils";
import { resolveImage, FALLBACK_BY_SLUG } from "@/lib/photos";
import type { ServiceCategory } from "@prisma/client";

type ServiceRow = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string | null;
  category: ServiceCategory;
  icon: string | null;
  imageId: string | null;
  priceFromFCFA: number | null;
  priceNote: string | null;
  isFeatured: boolean;
  ctaLabel: string | null;
  ctaHref: string | null;
};

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  VISA: "Assistance visa",
  HOTELS: "Hôtels",
  CHAUFFEUR: "Véhicule avec chauffeur",
  ASSURANCE: "Assurance voyage",
  TRANSFERT: "Transferts aéroport",
  ENTREPRISE: "Sur-mesure entreprise",
  AUTRE: "Autres services",
};

// Public display order for categories
const CATEGORY_ORDER: ServiceCategory[] = [
  "VISA",
  "HOTELS",
  "CHAUFFEUR",
  "TRANSFERT",
  "ASSURANCE",
  "ENTREPRISE",
  "AUTRE",
];

export function ServiceGrid({ services }: { services: ServiceRow[] }) {
  if (services.length === 0) return null;

  // Group by category, preserve category public order, then by service.order ASC.
  const grouped = new Map<ServiceCategory, ServiceRow[]>();
  for (const s of services) {
    const list = grouped.get(s.category) ?? [];
    list.push(s);
    grouped.set(s.category, list);
  }
  const groups = CATEGORY_ORDER
    .filter((c) => grouped.has(c))
    .map((c) => ({ category: c, items: grouped.get(c) ?? [] }));

  return (
    <>
      {groups.map(({ category, items }, idx) => (
        <section
          key={category}
          className={`container-narrow ${idx === 0 ? "pb-12" : "pb-16"}`}
        >
          <header className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
                Catégorie
              </p>
              <h2 className="mt-1 font-display text-2xl md:text-3xl font-semibold text-navy text-balance">
                {CATEGORY_LABELS[category]}
              </h2>
            </div>
            {category === "VISA" ? (
              <Link
                href="/contact?service=visa"
                className="text-sm font-semibold text-ocean hover:text-navy whitespace-nowrap"
              >
                Démarrer un dossier →
              </Link>
            ) : null}
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </section>
      ))}

      {/* Soft CTA banner — sits below the services */}
      <section className="container-narrow pb-20">
        <div className="rounded-2xl bg-navy p-8 md:p-12 text-sand">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand text-balance">
            Besoin d&apos;un service sur-mesure ?
          </h2>
          <p className="mt-3 max-w-2xl text-mist/90 leading-relaxed">
            Pour les groupes, les voyages d&apos;entreprise, les tournages ou
            tout autre cas spécifique : décrivez-nous votre besoin — un
            conseiller vous rappelle sous 24h ouvrées.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact?objet=service-sur-mesure"
              className="inline-flex items-center gap-2 rounded-full bg-sunrise-orange px-6 py-3 text-sm font-semibold text-navy hover:bg-sunrise-yellow transition-colors"
            >
              Demander un devis sur mesure
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-semibold text-sand hover:bg-whatsapp-hover transition-colors"
            >
              Discuter sur WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function ServiceCard({ service: s }: { service: ServiceRow }) {
  const image = resolveImage(
    s.imageId,
    FALLBACK_BY_SLUG["dakar"] ?? "/photos/destinations/dakar.jpg",
    { width: 800, height: 480, crop: "fill" },
  );

  const ctaHref =
    s.ctaHref && s.ctaHref.length > 0 ? s.ctaHref : `/contact?service=${s.slug}`;
  const ctaLabel = s.ctaLabel && s.ctaLabel.length > 0 ? s.ctaLabel : "Demander un devis";

  // Special highlight for visa — biggest friction point
  const isVisa = s.category === "VISA";

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-xl border bg-sand transition-all hover:shadow-soft hover:-translate-y-0.5 ${
        isVisa
          ? "border-ocean/60 ring-1 ring-ocean/30"
          : "border-sand-deep"
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-sand-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={s.title}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-sand/95 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-navy backdrop-blur">
          <ServiceIcon name={s.icon ?? "compass"} />
          {CATEGORY_LABELS[s.category]}
        </span>
        {s.isFeatured ? (
          <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-sunrise-orange px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-navy">
            Phare
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-navy group-hover:text-ocean transition-colors">
          {s.title}
        </h3>
        <p className="mt-2 text-sm text-graphite leading-relaxed line-clamp-3 flex-1">
          {s.shortDescription}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-sand-deep pt-3">
          <p>
            {s.priceFromFCFA != null ? (
              <>
                <span className="block text-[0.7rem] uppercase tracking-wider text-graphite font-semibold">
                  À partir de
                </span>
                <span className="font-display text-lg font-semibold text-navy">
                  {formatFCFA(s.priceFromFCFA)}
                </span>
                {s.priceNote ? (
                  <span className="text-xs text-graphite"> / {s.priceNote}</span>
                ) : null}
              </>
            ) : (
              <>
                <span className="block text-[0.7rem] uppercase tracking-wider text-graphite font-semibold">
                  Tarification
                </span>
                <span className="font-display text-base font-semibold text-navy italic">
                  Sur devis
                </span>
              </>
            )}
          </p>
          <Link
            href={ctaHref}
            className={`inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap ${
              isVisa ? "text-ocean" : "text-ocean"
            }`}
          >
            {ctaLabel}
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function ServiceIcon({ name }: { name: string }) {
  const common = {
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
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
          <path d="M3 22h18" />
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
          <path d="M9 13h6" />
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
