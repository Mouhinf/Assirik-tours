import Link from "next/link";
import { cn } from "@/lib/utils";
import { resolveImage, FALLBACK_BY_SLUG } from "@/lib/photos";
import { REGION_LABELS_FR, REGION_LABELS_EN } from "@/lib/regions";

/**
 * Shared destination card — used on the home page, the destinations
 * index and the blog footer. Renders a real photo (Cloudinary when
 * heroImageId is set, local fallback otherwise).
 */
export function DestinationCard({
  slug,
  title,
  region,
  summary,
  heroImageId,
  variant = "default",
  locale = "fr",
}: {
  slug: string;
  title: string;
  region: string;
  summary: string;
  heroImageId?: string | null;
  variant?: "default" | "compact";
  locale?: "fr" | "en";
}) {
  const labels = locale === "en" ? REGION_LABELS_EN : REGION_LABELS_FR;
  const fallback = FALLBACK_BY_SLUG[slug] ?? "/photos/destinations/dakar.jpg";
  const image = resolveImage(heroImageId, fallback, {
    width: variant === "compact" ? 640 : 960,
    height: variant === "compact" ? 480 : 720,
    crop: "fill",
  });

  return (
    <Link
      href={`/destinations/${slug}`}
      className={cn(
        "group block rounded-xl overflow-hidden border border-sand-deep bg-sand transition-all hover:shadow-soft hover:-translate-y-0.5",
        variant === "compact" && "sm:flex sm:items-stretch",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "relative overflow-hidden bg-sand-deep",
          variant === "compact" ? "sm:w-1/2 aspect-[4/3] sm:aspect-auto" : "aspect-[4/3]",
        )}
      >
        {/* Using plain img because the source may be a remote Cloudinary URL */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={`${title} — ${labels[region] ?? region}`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-sand/90 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-navy backdrop-blur">
        {labels[region] ?? region}
        </span>
      </div>
      <div className={cn("p-5", variant === "compact" && "sm:w-1/2 sm:p-6")}>
        <h3 className="font-display text-lg font-semibold text-navy group-hover:text-ocean transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm text-graphite leading-relaxed line-clamp-3">
          {summary}
        </p>
        <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ocean">
          Découvrir
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </p>
      </div>
    </Link>
  );
}
