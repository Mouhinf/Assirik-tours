import Link from "next/link";
import { deliveryUrl } from "@/lib/cloudinary-url";

export type BlogPreviewPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageId: string | null;
  category: string | null;
  publishedAt: Date | null;
  readingTime: number | null;
};

const CATEGORY_LABELS_FR: Record<string, string> = {
  "guides-pratiques": "Guides pratiques",
  destinations: "Destinations",
  visa: "Visa",
  omra: "Omra & Hajj",
  actualites: "Actualités",
};
const CATEGORY_LABELS_EN: Record<string, string> = {
  "guides-pratiques": "Practical guides",
  destinations: "Destinations",
  visa: "Visa",
  omra: "Umrah & Hajj",
  actualites: "News",
};

export function BlogPreviewCard({
  post,
  locale = "fr",
}: {
  post: BlogPreviewPost;
  locale?: "fr" | "en";
}) {
  const labels = locale === "en" ? CATEGORY_LABELS_EN : CATEGORY_LABELS_FR;
  const cover =
    post.coverImageId && !post.coverImageId.startsWith("local:")
      ? deliveryUrl(post.coverImageId, { width: 800, height: 480, crop: "fill" })
      : post.coverImageId?.startsWith("local:")
        ? post.coverImageId.slice("local:".length)
        : null;
  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  const categoryLabel = post.category ? labels[post.category] ?? post.category : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-sand-deep bg-sand transition-all hover:shadow-soft hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-sand-deep">
        {cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={cover}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-ocean/15 via-navy/10 to-sand-deep/30" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
        {categoryLabel ? (
          <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-sand/90 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-navy backdrop-blur">
            {categoryLabel}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-semibold text-navy group-hover:text-ocean transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-graphite leading-relaxed line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        <p className="mt-3 flex items-center gap-3 text-xs text-silver">
          {dateStr ? <time>{dateStr}</time> : null}
          {post.readingTime ? (
            <>
              {dateStr ? <span aria-hidden>·</span> : null}
              <span>
                {post.readingTime} {locale === "en" ? "min read" : "min de lecture"}
              </span>
            </>
          ) : null}
          <span aria-hidden className="ml-auto text-ocean transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </p>
      </div>
    </Link>
  );
}
