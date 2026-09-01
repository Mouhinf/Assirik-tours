import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import {
  readSeoMeta,
  BLOG_CATEGORY_LABELS_FR,
  BLOG_LOCALES,
  type BlogCategory,
  type BlogLocale,
} from "@/lib/validators/blog";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await prisma.blogPost.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  });
  if (!row) notFound();

  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "blog:write")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const seo = readSeoMeta(row.seoMeta);
  const cat = row.category as BlogCategory | null;

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
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold text-navy">Éditer l&apos;article</h1>
          <span className="inline-flex items-center rounded-full bg-mist px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ocean">
            {row.locale}
          </span>
          {cat ? (
            <span className="inline-flex items-center rounded-full bg-sky/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ocean">
              {BLOG_CATEGORY_LABELS_FR[cat]}
            </span>
          ) : null}
          {row.publishedAt ? (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-emerald-800">
              Publié
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-sand-deep px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-graphite">
              Brouillon
            </span>
          )}
          {row.isFeatured ? (
            <span className="inline-flex items-center rounded-full bg-sunrise-orange/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-sunrise-amber">
              ★ À la une
            </span>
          ) : null}
        </div>
        <p className="text-sm text-graphite">
          {row.author?.name ? `Par ${row.author.name} · ` : ""}
          Mis à jour le {new Date(row.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <p className="text-xs text-silver font-mono break-all">
          <code>/blog/{row.slug}</code>
        </p>
        {BLOG_LOCALES.includes(row.locale as BlogLocale) && row.publishedAt ? (
          <p>
            <a
              href={`/blog/${row.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-ocean hover:text-navy"
            >
              Voir l&apos;article public ↗
            </a>
          </p>
        ) : null}
      </header>

      <BlogPostForm
        mode="edit"
        canPublish={can(session.role, "blog:publish")}
        canFeatured={can(session.role, "blog:featured")}
        canDelete={can(session.role, "blog:delete")}
        initial={{
          id: row.id,
          slug: row.slug,
          locale: row.locale as BlogLocale,
          title: row.title,
          excerpt: row.excerpt,
          body: row.body,
          coverImageId: row.coverImageId,
          category: cat,
          tags: row.tags,
          readingTime: row.readingTime,
          publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
          isFeatured: row.isFeatured,
          seoMeta: seo,
        }}
      />
    </div>
  );
}
