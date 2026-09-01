import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import {
  readSeoMeta,
  BLOG_LOCALES,
  type BlogCategory,
  type BlogLocale,
} from "@/lib/validators/blog";

export default async function TranslateBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const targetLocale: BlogLocale = sp.locale === "en" ? "en" : "fr";

  const source = await prisma.blogPost.findUnique({ where: { id } });
  if (!source) notFound();

  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "blog:write")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  // The actual duplication already happened in duplicateBlogPostAction
  // — the admin pressed "Dupliquer" on the list page and was redirected here.
  // We now locate the freshly-created counterpart and load it for editing.
  const counterpart = await prisma.blogPost.findFirst({
    where: {
      slug: source.slug,
      locale: targetLocale,
      NOT: { id: source.id },
    },
    orderBy: { createdAt: "desc" },
  });

  // If for some reason no counterpart exists (admin typed the URL directly),
  // we render the source as a starting point with a banner.
  const target = counterpart ?? source;
  const seo = readSeoMeta(target.seoMeta);
  const cat = target.category as BlogCategory | null;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p>
          <Link
            href="/admin/blog"
            className="text-sm font-semibold text-ocean hover:text-navy"
          >
            ← Retour au blog
          </Link>
        </p>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Traduire l&apos;article
        </h1>
        <p className="text-sm text-graphite">
          Source : <code className="font-mono">{source.locale}</code> —{" "}
          Cible : <code className="font-mono">{targetLocale}</code>
        </p>
        {!counterpart ? (
          <p className="rounded-lg bg-sunrise-yellow/20 border border-sunrise-yellow/40 px-3 py-2 text-sm text-sunrise-amber">
            Aucun duplicata trouvé. Éditez ci-dessous : changez la langue vers {targetLocale.toUpperCase()} et ajustez le slug.
          </p>
        ) : (
          <p className="rounded-lg bg-mist border border-sky/30 px-3 py-2 text-sm text-ocean">
            ✓ Article dupliqué en brouillon ({targetLocale.toUpperCase()}). Traduisez le titre, l&apos;extrait et le corps. La publication se fait via la liste.
          </p>
        )}
        {BLOG_LOCALES.includes(targetLocale) ? null : null}
      </header>

      <BlogPostForm
        mode={counterpart ? "edit" : "create"}
        canPublish={can(session.role, "blog:publish")}
        canFeatured={can(session.role, "blog:featured")}
        canDelete={can(session.role, "blog:delete") && Boolean(counterpart)}
        initial={{
          id: counterpart?.id,
          slug: counterpart?.slug ?? `${target.slug}-${targetLocale}`,
          locale: targetLocale,
          title: counterpart?.title ?? target.title,
          excerpt: counterpart?.excerpt ?? target.excerpt,
          body: counterpart?.body ?? target.body,
          coverImageId: counterpart?.coverImageId ?? target.coverImageId,
          category: cat,
          tags: counterpart?.tags ?? target.tags,
          readingTime: counterpart?.readingTime ?? target.readingTime,
          publishedAt: counterpart?.publishedAt ? counterpart.publishedAt.toISOString() : null,
          isFeatured: counterpart?.isFeatured ?? false,
          seoMeta: seo,
        }}
      />
    </div>
  );
}
