import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { BlogPostCard } from "@/components/blog/post-card";
import { listBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog & guides",
  description:
    "Guides pratiques pour préparer un voyage : documents visa Schengen, meilleurs moments pour partir, conseils santé et sécurité.",
};

export default function BlogPage() {
  const posts = listBlogPosts();
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Guides pratiques pour partir préparé"
        description="Articles courts et concrets, écrits par l'équipe Assirik et nos partenaires locaux. Pas de SEO-bait — du contenu qui fait gagner du temps."
      />

      <section className="container-narrow pb-20">
        {posts.length === 0 ? (
          <p className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
            Les premiers articles arrivent bientôt.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <BlogPostCard key={p.slug} {...p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
