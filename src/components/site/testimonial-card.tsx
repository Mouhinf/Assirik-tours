/**
 * Testimonial card — reused on the home (featured) and the public /temoignages
 * page. Variants:
 *   - "compact" — small figure with avatar, name, 1-line quote, stars.
 *   - "full"    — full content, optional trip link, date trip.
 *
 * Pure presentation: takes a typed prop shape (no Prisma reference, so this
 * can be used from server or client components and from JSON-LD adapters).
 */
import Link from "next/link";
import { deliveryUrl } from "@/lib/cloudinary-url";

export type TestimonialCardData = {
  id: string;
  author: string;
  city: string | null;
  content: string;
  rating: number;
  tripSlug: string | null;
  locale: "fr" | "en";
  avatarId: string | null;
  dateTrip: string | null; // ISO string when passed across boundaries
};

export function TestimonialCard({
  t,
  variant = "full",
}: {
  t: TestimonialCardData;
  variant?: "compact" | "full";
}) {
  const initials = initialsFromName(t.author);
  const avatarUrl = t.avatarId ? deliveryUrl(t.avatarId, { width: 96, height: 96, crop: "fill" }) : null;
  const isCompact = variant === "compact";

  return (
    <figure
      className="rounded-lg border border-sand-deep bg-surface p-5 transition-colors hover:border-ocean/40"
      data-testid={`testimonial-${t.id}`}
    >
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            aria-hidden
            className="h-12 w-12 rounded-full object-cover border border-sand-deep"
          />
        ) : (
          <span
            aria-hidden
            className="h-12 w-12 rounded-full bg-mist text-navy inline-flex items-center justify-center font-display font-semibold text-sm"
          >
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-navy truncate">
            {t.author}
          </p>
          {t.city ? (
            <p className="text-sm text-graphite truncate">{t.city}</p>
          ) : null}
        </div>
      </div>

      {/* Stars */}
      <p className="mt-3 flex items-center gap-0.5" aria-label={`Note ${t.rating} sur 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            width={14}
            height={14}
            fill={i < t.rating ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
            className={i < t.rating ? "text-sunrise-orange" : "text-silver"}
            aria-hidden
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
          </svg>
        ))}
        <span className="sr-only">{t.rating} / 5</span>
      </p>

      <blockquote
        className={
          "mt-4 text-graphite leading-relaxed " +
          (isCompact ? "line-clamp-3" : "")
        }
      >
        &ldquo;{t.content}&rdquo;
      </blockquote>

      {!isCompact && (
        <figcaption className="mt-4 flex items-center justify-between gap-3 text-sm">
          <div className="flex flex-col">
            {t.dateTrip ? (
              <span className="text-xs text-silver">
                Voyage de {formatDate(t.dateTrip, t.locale)}
              </span>
            ) : null}
            {t.tripSlug ? (
              <Link
                href={`/destinations/${t.tripSlug}`}
                prefetch={false}
                className="mt-1 text-sm font-semibold text-ocean hover:text-navy"
              >
                {t.locale === "en" ? "See this trip →" : "Voir ce voyage →"}
              </Link>
            ) : null}
          </div>
          {t.tripSlug ? <span aria-hidden className="text-sand-deep">·</span> : null}
        </figcaption>
      )}
    </figure>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function initialsFromName(name: string) {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .filter((p) => !["&", "et", "and", "Mrs", "M.", "Mr", "Mme", "M"].includes(p));
  const picks = parts.slice(0, 2);
  if (picks.length === 0) return "AT";
  return picks.map((p) => p.charAt(0).toUpperCase()).join("").slice(0, 2);
}

function formatDate(iso: string, locale: "fr" | "en") {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const fmtLocale = locale === "en" ? "en-US" : "fr-FR";
    return d.toLocaleDateString(fmtLocale, { month: "long", year: "numeric" });
  } catch {
    return "";
  }
}
