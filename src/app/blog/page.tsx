import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { BlogPostCard } from "@/components/blog/post-card";
import { BlogVisaRail } from "@/components/blog/blog-visa-rail";
import { listBlogPosts, resolveBlogCover } from "@/lib/blog";
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_LABELS_FR,
  type BlogCategory,
} from "@/lib/validators/blog";
import { getLocaleCookie } from "@/lib/i18n-actions";
import { t } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleCookie();
  return {
    title: locale === "en"
      ? "Blog & guides | Assirik Tours"
      : "Blog & guides | Assirik Tours",
    description: locale === "en"
      ? "Practical guides for preparing your trip: Schengen visa documents, best times to travel, health and safety advice."
      : "Guides pratiques pour préparer un voyage : documents visa Schengen, meilleurs moments pour partir, conseils santé et sécurité.",
    alternates: { canonical: "/blog" },
  };
}

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
  const locale = await getLocaleCookie();
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

  // Visa rail: shown only when no filter is active (otherwise it would
  // duplicate the filtered listing on category=visa). Sourced from the FULL
  // post set so a "tagged" or "page 2" view can still see the rail.
  const visaPosts = activeCategory || activeTag
    ? []
    : all.filter((p) => p.category === "visa");

  // Featured row: prefer the editor's pick (isFeatured). If none is set
  // (common while the blog is being seeded), promote the latest visa post
  // — that aligns with the home page's emphasis and never feels random.
  const editorPick = filtered.find((p) => p.isFeatured) ?? null;
  const featured =
    editorPick ??
    (activeCategory === "visa" || activeCategory
      ? null
      : all.find((p) => p.category === "visa") ?? null);

  const restFeatured = featured
    ? filtered.filter((p) => p.id !== featured.id)
    : filtered;
  const featuredCover = featured;

  const total = filtered.length;
  const start = (page - 1) * PAGE_SIZE;
  const visible = restFeatured.slice(start, start + PAGE_SIZE);

  // ItemList JSON-LD only on the unfiltered first page (avoids emitting a
  // confusing "full list" JSON-LD on page 2 or category views).
  const itemListJsonLd =
    !activeCategory && !activeTag && page === 1
      ? {
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Blog Assirik Tours",
          description:
            "Guides pratiques pour préparer un voyage : visa, destinations, Omra.",
          url: "/blog",
          blogPost: all.slice(0, 10).map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `/blog/${p.slug}`,
            datePublished: p.publishedAt ? p.publishedAt.toISOString() : undefined,
            image: resolveBlogCover(p.coverImageId, { width: 800 }),
          })),
        }
      : null;

  return (
    <>
      <PageHero
        eyebrow={locale === "en" ? "Blog" : "Blog"}
        title={locale === "en"
          ? "Practical guides to travel prepared"
          : "Guides pratiques pour partir préparé"}
        description={locale === "en"
          ? "Short, concrete articles written by the Assirik team and our local partners. No SEO-bait — content that saves you time."
          : "Articles courts et concrets, écrits par l'équipe Assirik et nos partenaires locaux. Pas de SEO-bait — du contenu qui fait gagner du temps."}
      />

      {/* Filters */}
      <section className="container-narrow pt-2 pb-6" aria-label={locale === "en" ? "Blog filters" : "Filtres blog"}>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-graphite mr-1">
            {locale === "en" ? "Category:" : "Catégorie :"}
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
              {locale === "en" ? "Tags:" : "Tags :"}
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
          <EmptyState
            locale={locale}
            category={activeCategory}
            tag={activeTag}
          />
        ) : (
          <>
            {/* Visa rail: only on the unfiltered home of the blog */}
            {visaPosts.length > 0 ? <BlogVisaRail posts={visaPosts} /> : null}

            {featuredCover ? (
              <div className="mb-10">
                <FeaturedHero post={featuredCover} locale={locale} />
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
                    <span aria-hidden>←</span>&nbsp;{locale === "en" ? "Previous" : "Précédent"}
                  </Link>
                ) : null}
                <span className="inline-flex min-h-11 items-center rounded-md bg-ocean px-3 font-semibold text-sand">
                  {locale === "en" ? "Page" : "Page"} {page} / {Math.ceil(total / PAGE_SIZE)}
                </span>
                {page * PAGE_SIZE < total ? (
                  <Link
                    href={buildUrl({ category: activeCategory, tag: activeTag, page: page + 1 })}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-sand-deep bg-sand px-3 text-graphite hover:text-navy"
                  >
                    {locale === "en" ? "Next" : "Suivant"}&nbsp;<span aria-hidden>→</span>
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        )}
      </section>

      {itemListJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
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

function EmptyState({
  locale,
  category,
  tag,
}: {
  locale: "fr" | "en";
  category: BlogCategory | null;
  tag: string | null;
}) {
  const filters: string[] = [];
  if (category) filters.push(`${locale === "en" ? "category" : "catégorie"} « ${BLOG_CATEGORY_LABELS_FR[category]} »`);
  if (tag) filters.push(`tag #${tag}`);

  return (
    <div className="rounded-2xl border border-sand-deep bg-sand p-8 md:p-12 text-center">
      <p className="font-display text-2xl font-semibold text-navy">
        {locale === "en" ? "No articles yet" : "Aucun article pour le moment"}
      </p>
      {filters.length > 0 ? (
        <p className="mt-3 text-sm text-graphite">
          {locale === "en"
            ? `No article matching ${filters.join(" and ")} yet.`
            : `Pas encore d'article correspondant à ${filters.join(" et ")}.`}
        </p>
      ) : (
        <p className="mt-3 text-sm text-graphite">
          {locale === "en"
            ? "The blog fills up as we gather field feedback. For a specific question, we answer quickly."
            : "Le blog se remplit au fur et à mesure de nos retours terrain. Pour une question précise, on vous répond rapidement."}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/blog"
          className="inline-flex min-h-11 items-center rounded-full border border-sand-deep bg-sand px-5 py-2.5 text-sm font-semibold text-graphite transition-colors hover:text-navy"
        >
          {locale === "en" ? "See all articles" : "Voir tous les articles"}
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand transition-colors hover:bg-navy"
        >
          {locale === "en" ? "Contact us" : "Nous contacter"}
        </Link>
      </div>
    </div>
  );
}

function FeaturedHero({ post, locale }: { post: { slug: string; title: string; excerpt: string; coverImageId: string; publishedAt: Date | null; readingTime: number | null; category: string | null; tags: string[] }; locale: "fr" | "en" }) {
  const catLabel = post.category && BLOG_CATEGORY_LABELS_FR[post.category as BlogCategory];
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })
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
            ★ {locale === "en" ? "Featured" : "À la une"} · {date}
            {post.readingTime ? ` · ${post.readingTime} ${locale === "en" ? "min read" : "min de lecture"}` : ""}
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
