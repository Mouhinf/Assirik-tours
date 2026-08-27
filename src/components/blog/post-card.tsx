import Link from "next/link";

const CATEGORY_LABELS_FR: Record<string, string> = {
  guides: "Guide",
  actualites: "Actualité",
  destinations: "Destination",
};

export function BlogPostCard({
  slug,
  title,
  excerpt,
  category,
  publishedAt,
  readingMinutes,
  cover,
}: {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingMinutes: number;
  cover: string;
}) {
  const date = new Date(publishedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <Link
      href={`/blog/${slug}`}
      className="group block rounded-xl overflow-hidden border border-sand-deep bg-sand transition-all hover:shadow-soft hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-sand-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={title}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-sand/90 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-navy backdrop-blur">
          {CATEGORY_LABELS_FR[category] ?? category}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs text-graphite">
          <time dateTime={publishedAt}>{date}</time> · {readingMinutes} min de lecture
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
