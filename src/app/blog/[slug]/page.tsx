import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostCard } from "@/components/blog/post-card";
import { getBlogPost, listBlogPosts } from "@/lib/blog";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return listBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article introuvable" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${slug}`,
      type: "article",
      images: [{ url: post.cover, width: 1280, height: 720, alt: post.title }],
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.cover],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const date = new Date(post.publishedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const related = listBlogPosts().filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <article>
        <header className="container-narrow pt-14 pb-10 md:pt-20 md:pb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
            <Link href="/blog" className="hover:text-sunrise-orange">← Tous les articles</Link>
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl md:text-5xl font-semibold text-navy leading-[1.1] text-balance">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-graphite leading-relaxed">
            {post.excerpt}
          </p>
          <p className="mt-6 text-sm text-graphite">
            Par <span className="font-semibold text-navy">{post.author}</span> ·{" "}
            <time dateTime={post.publishedAt}>{date}</time> · {post.readingMinutes} min de lecture
          </p>
        </header>

        <div className="container-narrow pb-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-sand-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>

        <div className="container-narrow max-w-3xl pb-16">
          <div className="space-y-5 text-graphite leading-relaxed text-[1.05rem]">
            {post.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="container-narrow pb-20">
          <h2 className="font-display text-2xl font-semibold text-navy mb-6">À lire aussi</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <BlogPostCard key={p.slug} {...p} />
            ))}
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          image: post.cover,
          datePublished: post.publishedAt,
          author: { "@type": "Person", name: post.author },
          publisher: { "@type": "Organization", name: "Assirik Tours" },
        }) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
          { name: "Accueil", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ])) }}
      />
    </>
  );
}
