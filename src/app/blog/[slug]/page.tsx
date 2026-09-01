import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listBlogSlugs, resolveBlogCover } from "@/lib/blog";
import { BlogPostCard } from "@/components/blog/post-card";
import { renderBlogBody, readSeoMeta, BLOG_CATEGORY_LABELS_FR } from "@/lib/validators/blog";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { ShareLinkButton as ShareLink } from "@/components/blog/share-link-button";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await listBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug_locale: { slug, locale: "fr" } },
    include: { author: { select: { name: true } } },
  });
  if (!post || !post.publishedAt) {
    return { title: "Article introuvable" };
  }
  const seo = readSeoMeta(post.seoMeta);
  const title = seo.title || post.title;
  const description = seo.description || post.excerpt;
  const ogImage = seo.ogImage || post.coverImageId;
  const ogUrl = ogImage.startsWith("local:") ? ogImage.slice("local:".length) : resolveBlogCover(ogImage, { width: 1280 });
  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      url: `/blog/${slug}`,
      type: "article",
      images: [{ url: ogUrl, width: 1280, height: 720, alt: post.title }],
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug_locale: { slug, locale: "fr" } },
    include: { author: { select: { name: true } } },
  });
  if (!post || !post.publishedAt) notFound();

  const dateLong = new Date(post.publishedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const updatedLong =
    post.updatedAt.getTime() - post.createdAt.getTime() > 7 * 24 * 3600 * 1000
      ? new Date(post.updatedAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  const coverUrl = resolveBlogCover(post.coverImageId, { width: 1280 });

  // Related: same category first, then any other post — max 3, excluding current.
  const related = await prisma.blogPost.findMany({
    where: {
      id: { not: post.id },
      locale: "fr",
      publishedAt: { not: null },
      OR: post.category
        ? [{ category: post.category }, { tags: { hasSome: post.tags } }]
        : [{ tags: { hasSome: post.tags } }],
    },
    orderBy: [{ publishedAt: "desc" }],
    take: 3,
  });

  const bodyHtml = renderBlogBody(post.body);

  return (
    <>
      <article>
        <header className="container-narrow pt-14 pb-10 md:pt-20 md:pb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
            <Link href="/blog" className="hover:text-sunrise-orange">
              ← Tous les articles
            </Link>
          </p>
          {post.category && BLOG_CATEGORY_LABELS_FR[post.category as keyof typeof BLOG_CATEGORY_LABELS_FR] ? (
            <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-wider text-ocean">
              {BLOG_CATEGORY_LABELS_FR[post.category as keyof typeof BLOG_CATEGORY_LABELS_FR]}
            </p>
          ) : null}
          <h1 className="mt-2 max-w-3xl font-display text-4xl md:text-5xl font-semibold text-navy leading-[1.1] text-balance">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-graphite leading-relaxed">
            {post.excerpt}
          </p>
          <p className="mt-6 text-sm text-graphite">
            {post.author?.name ? (
              <>
                Par <span className="font-semibold text-navy">{post.author.name}</span> ·{" "}
              </>
            ) : null}
            <time dateTime={post.publishedAt.toISOString()}>{dateLong}</time>
            {post.readingTime ? ` · ${post.readingTime} min de lecture` : ""}
          </p>
          {updatedLong ? (
            <p className="mt-1 text-xs text-silver">
              Mis à jour le <time dateTime={post.updatedAt.toISOString()}>{updatedLong}</time>
            </p>
          ) : null}
        </header>

        <div className="container-narrow pb-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-sand-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>

        <div
          className="container-narrow max-w-3xl pb-16"
          // The body is rendered via renderBlogBody which escapes HTML and
          // allows only a small inline-Markdown subset (no <script>/<iframe>).
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {post.tags.length > 0 ? (
          <div className="container-narrow max-w-3xl pb-12">
            <p className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-graphite">
                Tags :
              </span>
              {post.tags.map((t) => (
                <Link
                  key={t}
                  href={`/blog?tag=${encodeURIComponent(t)}`}
                  className="inline-flex items-center rounded-full bg-mist px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ocean hover:bg-sky/30"
                >
                  #{t}
                </Link>
              ))}
            </p>
          </div>
        ) : null}

        <ShareLink path={`/blog/${post.slug}`} title={post.title} />
      </article>

      {related.length > 0 ? (
        <section className="container-narrow pb-20">
          <h2 className="font-display text-2xl font-semibold text-navy mb-6">À lire aussi</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
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
        </section>
      ) : null}

      {/* JSON-LD: BlogPosting + BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: coverUrl,
            datePublished: post.publishedAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: post.author?.name
              ? { "@type": "Person", name: post.author.name }
              : { "@type": "Organization", name: "Assirik Tours" },
            publisher: {
              "@type": "Organization",
              name: "Assirik Tours",
              logo: { "@type": "ImageObject", url: "/logo.png" },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `/blog/${post.slug}`,
            },
            keywords: post.tags.join(", "),
            inLanguage: "fr",
            wordCount: post.body.split(/\s+/).length,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Accueil", url: "/" },
              { name: "Blog", url: "/blog" },
              { name: post.title, url: `/blog/${post.slug}` },
            ]),
          ),
        }}
      />
    </>
  );
}

