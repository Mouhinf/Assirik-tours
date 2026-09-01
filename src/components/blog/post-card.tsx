import Link from "next/link";
import { resolveBlogCover } from "@/lib/blog";
import {
  BLOG_CATEGORY_LABELS_FR,
  BLOG_CATEGORY_LABELS_EN,
  type BlogCategory,
} from "@/lib/validators/blog";

export type BlogPostCardProps = {
  slug: string;
  locale?: "fr" | "en";
  title: string;
  excerpt: string;
  category: string | null;
  tags?: string[];
  publishedAt: Date | string | null;
  readingTime?: number | null;
  coverImageId: string;
  author?: string | null;
};

export function BlogPostCard({
  slug,
  locale = "fr",
  title,
  excerpt,
  category,
  publishedAt,
  readingTime,
  coverImageId,
}: BlogPostCardProps) {
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const labels =
    locale === "en" ? BLOG_CATEGORY_LABELS_EN : BLOG_CATEGORY_LABELS_FR;
  const catLabel =
    category && (labels as Record<string, string>)[category]
      ? (labels as Record<string, string>)[category as BlogCategory]
      : null;

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block rounded-xl overflow-hidden border border-sand-deep bg-sand transition-all hover:shadow-soft hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-sand-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveBlogCover(coverImageId, { width: 800 })}
          alt={title}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {catLabel ? (
          <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-sand/90 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-navy backdrop-blur">
            {catLabel}
          </span>
        ) : null}
      </div>
      <div className="p-5">
        <p className="text-xs text-graphite">
          {date ? <time dateTime={String(publishedAt)}>{date}</time> : null}
          {readingTime ? ` · ${readingTime} min de lecture` : ""}
        </p>
        <h3 className="mt-2 font-display text-lg font-semibold text-navy group-hover:text-ocean transition-colors text-balance">
          {title}
        </h3>
        <p className="mt-2 text-sm text-graphite leading-relaxed line-clamp-3">{excerpt}</p>
        <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ocean">
          Lire l&apos;article
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
        </p>
      </div>
    </Link>
  );
}
