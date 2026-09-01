import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { BlogPostCard } from "@/components/blog/post-card";
import { listBlogPosts, resolveBlogCover } from "@/lib/blog";
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_LABELS_FR,
  type BlogCategory,
} from "@/lib/validators/blog";

export const metadata: Metadata = {
  title: "Blog & guides | Assirik Tours",
  description:
    "Guides pratiques pour préparer un voyage : documents visa Schengen, meilleurs moments pour partir, conseils santé et sécurité.",
};

export const revalidate = 120;

const PAGE_SIZE = 9;

type SearchParams = {
  category?: string;
  tag?: string;
  page?: string;
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const activeCategory: BlogCategory | null =
    BLOG_CATEGORIES.find((c) => c === sp.category) ?? null;
  const activeTag = sp.tag?.trim() || null;
  const page = Math.max(1, Number(sp.page) || 1);

  // Always query the full set for "featured" / "all categories" tabs
  const all = await listBlogPosts();

  // Apply filters in memory (cheap with the dataset size we expect)
  const filtered = all.filter((post) => {
    if (activeCategory && post.category !== activeCategory) return false;
    if (activeTag && !post.tags.includes(activeTag.toLowerCase())) return false;
    return true;
  });

  // Collect all tags for the tag filter
  const allTags = Array.from(
    new Set(all.flatMap((p) => p.tags ?? [])),
  ).sort();

  // Featured row: at most one, from the top of the list (already sorted
  // isFeatured desc in the adapter).
  const featured = filtered.find((p) => p.isFeatured) ?? null;
  const restFeatured = featured
    ? filtered.filter((p) => p.id !== featured.id)
    : filtered;
  const featuredCover: typeof filtered[number] | null = featured;

  const total = filtered.length;
  const start = (page - 1) * PAGE_SIZE;
  const visible = restFeatured.slice(start, start + PAGE_SIZE);

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Guides pratiques pour partir préparé"
        description="Articles courts et concrets, écrits par l'équipe Assirik et nos partenaires locaux. Pas de SEO-bait — du contenu qui fait gagner du temps."
      />

      {/* Filters */}
      <section className="container-narrow pt-2 pb-6" aria-label="Filtres blog">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-graphite mr-1">
            Catégorie :
          </span>
          <FilterChip href="/blog" active={!activeCategory}>
            Toutes
          </FilterChip>
          {BLOG_CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              href={buildUrl({ category: c, tag: activeTag, page: 1 })}
              active={activeCategory === c}
            >
              {BLOG_CATEGORY_LABELS_FR[c]}
            </FilterChip>
          ))}
        </div>
        {allTags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-graphite mr-1">
              Tags :
            </span>
            <FilterChip href={buildUrl({ category: activeCategory, tag: null, page: 1 })} active={!activeTag}>
              Tous
            </FilterChip>
            {allTags.map((t) => (
              <FilterChip
                key={t}
                href={buildUrl({ category: activeCategory, tag: t, page: 1 })}
                active={activeTag === t}
              >
                #{t}
              </FilterChip>
            ))}
          </div>
        ) : null}
      </section>

      <section className="container-narrow pb-10">
        {total === 0 ? (
          <p className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
            Aucun article ne correspond à ces filtres.
          </p>
        ) : (
          <>
            {featuredCover ? (
              <div className="mb-10">
                <FeaturedHero post={featuredCover} />
              </div>
            ) : null}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((p) => (
                <BlogPostCard
                  key={p.id}
                  slug={p.slug}
                  title={p.title}
                  excerpt={p.excerpt}
                  category={p.category}
                  tags={p.tags}
                  publishedAt={p.publishedAt}
                  readingTime={p.readingTime}
                  coverImageId={p.coverImageId}
                />
              ))}
            </div>

            {total > PAGE_SIZE ? (
              <nav
                aria-label="Pagination blog"
                className="mt-10 flex items-center justify-center gap-2 text-sm"
              >
                {page > 1 ? (
                  <Link
                    href={buildUrl({ category: activeCategory, tag: activeTag, page: page - 1 })}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-sand-deep bg-sand px-3 text-graphite hover:text-navy"
                  >
                    <span aria-hidden>←</span>&nbsp;Précédent
                  </Link>
                ) : null}
                <span className="inline-flex min-h-11 items-center rounded-md bg-ocean px-3 font-semibold text-sand">
                  Page {page} / {Math.ceil(total / PAGE_SIZE)}
                </span>
                {page * PAGE_SIZE < total ? (
                  <Link
                    href={buildUrl({ category: activeCategory, tag: activeTag, page: page + 1 })}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-sand-deep bg-sand px-3 text-graphite hover:text-navy"
                  >
                    Suivant&nbsp;<span aria-hidden>→</span>
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}

function buildUrl(opts: { category: string | null; tag: string | null; page: number }): string {
  const params = new URLSearchParams();
  if (opts.category) params.set("category", opts.category);
  if (opts.tag) params.set("tag", opts.tag);
  if (opts.page > 1) params.set("page", String(opts.page));
  const q = params.toString();
  return q ? `/blog?${q}` : "/blog";
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-ocean text-sand"
          : "border border-sand-deep bg-sand text-graphite hover:text-navy"
      }`}
    >
      {children}
    </Link>
  );
}

function FeaturedHero({ post }: { post: { slug: string; title: string; excerpt: string; coverImageId: string; publishedAt: Date | null; readingTime: number | null; category: string | null; tags: string[] } }) {
  const catLabel = post.category && BLOG_CATEGORY_LABELS_FR[post.category as BlogCategory];
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "";
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-2xl border border-sand-deep bg-sand"
    >
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-0">
        <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-sand-deep">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveBlogCover(post.coverImageId, { width: 1200 })}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {catLabel ? (
            <span className="absolute top-4 left-4 inline-flex items-center rounded-full bg-sand/95 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-navy">
              {catLabel}
            </span>
          ) : null}
        </div>
        <div className="p-6 lg:p-8 flex flex-col justify-center">
          <p className="text-xs text-graphite">
            ★ À la une · {date}
            {post.readingTime ? ` · ${post.readingTime} min de lecture` : ""}
          </p>
          <h2 className="mt-3 font-display text-2xl lg:text-3xl font-semibold text-navy group-hover:text-ocean transition-colors text-balance">
            {post.title}
          </h2>
          <p className="mt-3 text-sm text-graphite leading-relaxed">{post.excerpt}</p>
          {post.tags.length > 0 ? (
            <p className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full bg-mist px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ocean"
                >
                  #{t}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
