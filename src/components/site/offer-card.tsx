import Link from "next/link";
import { cn } from "@/lib/utils";
import { resolveImage, FALLBACK_BY_SLUG } from "@/lib/photos";
import { OFFER_KIND_LABELS_FR, OFFER_KIND_LABELS_EN } from "@/lib/regions";
import { formatFCFA } from "@/lib/utils";

export function OfferCard({
  slug,
  title,
  summary,
  kind,
  priceFCFA,
  durationDays,
  destinationSlug,
  destinationTitle,
  coverImageId,
  promoPriceFCFA,
  promoEndsAt,
  promoLabel,
  locale = "fr",
}: {
  slug: string;
  title: string;
  summary: string;
  kind: string;
  priceFCFA: number;
  durationDays?: number | null;
  destinationSlug: string;
  destinationTitle: string;
  coverImageId?: string | null;
  promoPriceFCFA?: number | null;
  promoEndsAt?: Date | string | null;
  promoLabel?: string;
  locale?: "fr" | "en";
}) {
  const labels = locale === "en" ? OFFER_KIND_LABELS_EN : OFFER_KIND_LABELS_FR;
  const fallback = FALLBACK_BY_SLUG[destinationSlug] ?? "/photos/destinations/dakar.jpg";
  const image = resolveImage(coverImageId, fallback, {
    width: 960,
    height: 540,
    crop: "fill",
  });

  // Promo is only considered live if price < regular price and end-date has
  // not passed (or no end-date).
  const endsAtDate =
    typeof promoEndsAt === "string"
      ? new Date(promoEndsAt)
      : promoEndsAt ?? null;
  const promoLive =
    typeof promoPriceFCFA === "number" &&
    promoPriceFCFA > 0 &&
    promoPriceFCFA < priceFCFA &&
    (!endsAtDate || endsAtDate.getTime() > Date.now());

  return (
    <Link
      href={`/offres/${slug}`}
      className="group block rounded-xl overflow-hidden border border-sand-deep bg-sand transition-all hover:shadow-soft hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-sand-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={`${title} — ${destinationTitle}`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-sand/90 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-navy backdrop-blur">
          {labels[kind] ?? kind}
        </span>
        {promoLive ? (
          <span
            className="absolute top-3 right-3 inline-flex items-center rounded-full bg-sunrise-coral px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-sand shadow-md"
            aria-label={promoLabel ?? "Promo"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mr-1">
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="M4.93 4.93l2.83 2.83" />
              <path d="M16.24 16.24l2.83 2.83" />
              <path d="M2 12h4" />
              <path d="M18 12h4" />
              <path d="M4.93 19.07l2.83-2.83" />
              <path d="M16.24 7.76l2.83-2.83" />
            </svg>
            {promoLabel ?? (locale === "en" ? "Promo" : "Promo")}
          </span>
        ) : durationDays ? (
          <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-navy/85 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-sand">
            {durationDays} {locale === "en" ? "days" : "jours"}
          </span>
        ) : null}
      </div>
      <div className="p-5">
        <p className="text-[0.7rem] uppercase tracking-wider text-graphite font-semibold">
          {destinationTitle}
        </p>
        <h3 className="mt-1.5 font-display text-lg font-semibold text-navy group-hover:text-ocean transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm text-graphite leading-relaxed line-clamp-3">
          {summary}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-sand-deep pt-3">
          <p>
            <span className="block text-[0.7rem] uppercase tracking-wider text-graphite font-semibold">
              {locale === "en" ? "From" : "À partir de"}
            </span>
            <span
              className={cn(
                "font-display text-lg font-semibold",
                promoLive ? "text-sunrise-coral" : "text-navy",
              )}
            >
              {formatFCFA(promoLive ? promoPriceFCFA! : priceFCFA)}
            </span>
            {promoLive ? (
              <>
                <span className="ml-1.5 text-xs text-graphite line-through">
                  {formatFCFA(priceFCFA)}
                </span>
                <span className="ml-1 text-xs text-graphite"> / {locale === "en" ? "person" : "pers."}</span>
              </>
            ) : (
              <span className="text-xs text-graphite"> / {locale === "en" ? "person" : "pers."}</span>
            )}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ocean">
            {locale === "en" ? "View offer" : "Voir l'offre"}
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
