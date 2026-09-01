import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_LABELS_FR,
  type BlogCategory,
  type BlogLocale,
} from "@/lib/validators/blog";
import { AdminBlogPostRowActions } from "./blog-actions";

const PAGE_SIZE = 30;

type SearchParams = {
  q?: string;
  locale?: string;
  category?: string;
  status?: string;
  tag?: string;
  page?: string;
};

const CAT_BADGE: Record<BlogCategory, string> = {
  "guides-pratiques": "bg-sky/15 text-ocean",
  destinations: "bg-sunrise-yellow/20 text-sunrise-amber",
  visa: "bg-mist text-navy",
  omra: "bg-sunrise-orange/15 text-sunrise-coral",
  actualites: "bg-graphite/15 text-graphite",
};

export default async function AdminBlogListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const locale: BlogLocale | undefined =
    sp.locale === "fr" || sp.locale === "en" ? sp.locale : undefined;
  const category = BLOG_CATEGORIES.find((c) => c === sp.category);
  const status = sp.status === "published" || sp.status === "draft" ? sp.status : undefined;
  const tag = sp.tag?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const session = await getSession();
  if (!session) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Session expirée.
      </p>
    );
  }
  if (!can(session.role, "blog:read")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const canWrite = can(session.role, "blog:write");
  const canPublish = can(session.role, "blog:publish");
  const canDelete = can(session.role, "blog:delete");
  const canFeatured = can(session.role, "blog:featured");

  const where = {
    ...(locale ? { locale } : {}),
    ...(category ? { category } : {}),
    ...(status === "published" ? { publishedAt: { not: null } } : {}),
    ...(status === "draft" ? { publishedAt: null } : {}),
    ...(tag ? { tags: { has: tag.toLowerCase() } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { excerpt: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total, counts] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { author: { select: { name: true } } },
    }),
    prisma.blogPost.count({ where }),
    prisma.blogPost.groupBy({
      by: ["publishedAt"],
      _count: true,
    }),
  ]);

  const publishedCount = counts.filter((c) => c.publishedAt !== null).reduce((a, c) => a + c._count, 0);
  const draftCount = counts.filter((c) => c.publishedAt === null).reduce((a, c) => a + c._count, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">Blog</h1>
          <p className="mt-1 text-graphite">
            {rows.length} affichés · {total} correspondent aux filtres ·{" "}
            <span className="font-semibold text-emerald-700">{publishedCount} publiés</span>,{" "}
            <span className="font-semibold text-silver">{draftCount} brouillons</span>.
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/admin/blog/new"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand transition-colors hover:bg-navy"
          >
            <span aria-hidden>+</span> Nouvel article
          </Link>
        ) : null}
      </header>

      <form className="grid gap-3 rounded-xl border border-sand-deep bg-sand p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block lg:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-graphite">
            Recherche
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Titre, slug, extrait…"
            className="min-h-11 w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-base text-navy md:text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-graphite">
            Langue
          </span>
          <select
            name="locale"
            defaultValue={locale ?? ""}
            className="min-h-11 w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-base text-navy md:text-sm"
          >
            <option value="">Toutes</option>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-graphite">
            Catégorie
          </span>
          <select
            name="category"
            defaultValue={category ?? ""}
            className="min-h-11 w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-base text-navy md:text-sm"
          >
            <option value="">Toutes</option>
            {BLOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {BLOG_CATEGORY_LABELS_FR[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-graphite">
            Statut
          </span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="min-h-11 w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-base text-navy md:text-sm"
          >
            <option value="">Tous</option>
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-graphite">
            Tag
          </span>
          <input
            type="text"
            name="tag"
            defaultValue={tag ?? ""}
            placeholder="ex: visa"
            className="min-h-11 w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-base text-navy md:text-sm"
          />
        </label>
        <div className="flex items-end gap-2 lg:col-span-5">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-sand transition-colors hover:bg-navy"
          >
            Filtrer
          </button>
          <Link
            href="/admin/blog"
            className="inline-flex min-h-11 items-center rounded-md border border-sand-deep px-4 py-2 text-sm font-semibold text-graphite transition-colors hover:text-navy"
          >
            Réinitialiser
          </Link>
        </div>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-sand-deep bg-sand p-10 text-center md:p-12">
          <p className="text-graphite">Aucun article ne correspond aux filtres.</p>
          {canWrite ? (
            <Link
              href="/admin/blog/new"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-ocean hover:text-navy"
            >
              Créer le premier <span aria-hidden>→</span>
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-sand-deep bg-sand">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3 hidden md:table-cell">Langue</th>
                <th className="px-4 py-3 hidden lg:table-cell">Catégorie</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 hidden lg:table-cell">Auteur</th>
                <th className="px-4 py-3 hidden md:table-cell">Tags</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {rows.map((row) => {
                const cat = row.category as BlogCategory | null;
                return (
                  <tr key={row.id}>
                    <td className="px-4 py-3 align-top">
                      <Link href={`/admin/blog/${row.id}`} className="block">
                        <p className="font-semibold text-navy line-clamp-2">{row.title}</p>
                        <p className="mt-1 text-xs text-silver">
                          <code className="font-mono">{row.slug}</code>
                          {row.readingTime ? ` · ${row.readingTime} min` : ""}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 align-top hidden md:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${
                          row.locale === "fr"
                            ? "bg-sky/15 text-ocean"
                            : "bg-sunrise-yellow/20 text-sunrise-amber"
                        }`}
                      >
                        {row.locale.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top hidden lg:table-cell">
                      {cat ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${CAT_BADGE[cat]}`}
                        >
                          {BLOG_CATEGORY_LABELS_FR[cat]}
                        </span>
                      ) : (
                        <span className="text-silver text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {row.publishedAt ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-emerald-800">
                            Publié
                          </span>
                          <p className="text-[0.65rem] text-silver">
                            {new Date(row.publishedAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-sand-deep px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-graphite">
                          Brouillon
                        </span>
                      )}
                      {row.isFeatured ? (
                        <p className="mt-1 inline-flex items-center rounded-full bg-sunrise-orange/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-sunrise-amber">
                          ★ À la une
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-graphite hidden lg:table-cell">
                      {row.author?.name ?? <span className="text-silver">—</span>}
                    </td>
                    <td className="px-4 py-3 align-top hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {row.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center rounded-full bg-mist px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-ocean"
                          >
                            #{t}
                          </span>
                        ))}
                        {row.tags.length > 3 ? (
                          <span className="text-[0.6rem] text-silver">+{row.tags.length - 3}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <AdminBlogPostRowActions
                        id={row.id}
                        slug={row.slug}
                        locale={row.locale as BlogLocale}
                        published={Boolean(row.publishedAt)}
                        isFeatured={row.isFeatured}
                        canPublish={canPublish}
                        canFeatured={canFeatured}
                        canDelete={canDelete}
                        canDuplicate={canWrite}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {total > PAGE_SIZE ? (
        <nav aria-label="Pagination blog" className="flex items-center justify-center gap-2 text-sm">
          {page > 1 ? (
            <Link
              href={buildPageUrl({ q, locale, category, status, tag }, page - 1)}
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
              href={buildPageUrl({ q, locale, category, status, tag }, page + 1)}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-sand-deep bg-sand px-3 text-graphite hover:text-navy"
            >
              Suivant&nbsp;<span aria-hidden>→</span>
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}

function buildPageUrl(
  filters: { q: string; locale?: BlogLocale; category?: BlogCategory; status?: string; tag?: string },
  page: number,
) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.locale) params.set("locale", filters.locale);
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.tag) params.set("tag", filters.tag);
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  return q ? `/admin/blog?${q}` : "/admin/blog";
}
