import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  FAQ_CATEGORIES,
  FAQ_CATEGORY_LABELS_FR,
  FAQ_CATEGORY_LABELS_EN,
} from "@/lib/validators/faq";
import { AdminToggleFaqActiveButton } from "./toggle-faq-active-button";
import { AdminDeleteFaqButton } from "./delete-faq-button";
import { AdminReorderFaqs } from "./reorder-faqs";

const PAGE_SIZE = 30;

const CATEGORY_BADGE: Record<string, string> = {
  general: "bg-sky/15 text-ocean",
  payment: "bg-sunrise-orange/15 text-sunrise-coral",
  visa: "bg-emerald-100 text-emerald-700",
  flight: "bg-mist text-ocean",
  omra: "bg-sand-deep text-navy",
  services: "bg-graphite/15 text-graphite",
};

export default async function AdminFaqListPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    locale?: string;
    category?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const locale = sp.locale === "fr" || sp.locale === "en" ? sp.locale : undefined;
  const category = FAQ_CATEGORIES.includes(sp.category as never)
    ? (sp.category as string)
    : undefined;
  const status = sp.status;
  const page = Math.max(1, Number(sp.page) || 1);

  const session = await getSession();
  if (!session) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Session expirée.
      </p>
    );
  }
  if (!can(session.role, "faq:read")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const where = {
    ...(locale ? { locale } : {}),
    ...(category ? { category } : {}),
    ...(status === "active" ? { isActive: true } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
    ...(q
      ? {
          OR: [
            { question: { contains: q, mode: "insensitive" as const } },
            { answer: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.faqItem.findMany({
      where,
      orderBy: [
        { locale: "asc" },
        { category: "asc" },
        { order: "asc" },
      ],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.faqItem.count({ where }),
  ]);

  const canWrite = can(session.role, "faq:write");
  const canDelete = can(session.role, "faq:delete");

  // When grouping without filters → we still take a snapshot to display
  // reorder sections for the most populated (locale, category) pair.
  const canReorder = can(session.role, "faq:reorder");
  const groups = rows.reduce<Record<string, typeof rows>>((acc, r) => {
    const key = `${r.locale}/${r.category}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">FAQ</h1>
          <p className="mt-1 text-graphite">
            {rows.length} affichés · {total} correspondent aux filtres.
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/admin/faq/new"
            className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors"
          >
            + Nouvelle question
          </Link>
        ) : null}
      </header>

      <form className="rounded-xl border border-sand-deep bg-sand p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <label className="block lg:col-span-2">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
            Recherche
          </span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Question, réponse…"
            className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
            Langue
          </span>
          <select
            name="locale"
            defaultValue={locale ?? ""}
            className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
          >
            <option value="">Toutes</option>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
            Catégorie
          </span>
          <select
            name="category"
            defaultValue={category ?? ""}
            className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
          >
            <option value="">Toutes</option>
            {FAQ_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {FAQ_CATEGORY_LABELS_FR[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
            Statut
          </span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
          >
            <option value="">Tous</option>
            <option value="active">Active</option>
            <option value="inactive">Désactivée</option>
          </select>
        </label>
        <div className="flex items-end gap-2 lg:col-span-5">
          <button
            type="submit"
            className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy transition-colors"
          >
            Filtrer
          </button>
          <Link
            href="/admin/faq"
            className="rounded-md border border-sand-deep px-4 py-2 text-sm font-semibold text-graphite hover:text-navy transition-colors"
          >
            Réinitialiser
          </Link>
        </div>
      </form>

      <div className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-graphite">Aucune question ne correspond.</p>
            {canWrite ? (
              <Link
                href="/admin/faq/new"
                className="mt-3 inline-block text-sm font-semibold text-ocean hover:text-navy"
              >
                Créer la première →
              </Link>
            ) : null}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Question</th>
                <th className="text-left px-4 py-3 font-semibold">Catégorie</th>
                <th className="text-left px-4 py-3 font-semibold">Langue</th>
                <th className="text-left px-4 py-3 font-semibold">Statut</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {rows.map((r) => {
                const labels =
                  r.locale === "en" ? FAQ_CATEGORY_LABELS_EN : FAQ_CATEGORY_LABELS_FR;
                return (
                  <tr key={r.id} className="hover:bg-sand-deep/30">
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-navy line-clamp-1">
                          {r.question}
                        </p>
                        <p className="mt-0.5 text-xs text-silver italic max-w-md line-clamp-1">
                          {r.answer.slice(0, 80)}…
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider " +
                          (CATEGORY_BADGE[r.category] ?? "bg-silver/15 text-graphite")
                        }
                      >
                        {labels[r.category as keyof typeof labels]}
                      </span>
                      <span className="ml-2 inline-flex rounded-full bg-sand-deep/40 px-1.5 py-0.5 text-[0.6rem] font-mono text-graphite">
                        #{r.order}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider " +
                          (r.locale === "en"
                            ? "bg-sky/15 text-ocean"
                            : "bg-ocean/15 text-navy")
                        }
                      >
                        {r.locale.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {canWrite ? (
                        <AdminToggleFaqActiveButton
                          id={r.id}
                          isActive={r.isActive}
                        />
                      ) : r.isActive ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-silver/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-graphite">
                          Désactivée
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {canWrite ? (
                          <Link
                            href={`/admin/faq/${r.id}`}
                            className="text-sm font-medium text-ocean hover:text-navy"
                          >
                            Éditer
                          </Link>
                        ) : null}
                        {canDelete ? (
                          <AdminDeleteFaqButton id={r.id} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE ? (
        <nav className="flex items-center justify-center gap-2 text-sm">
          {page > 1 ? (
            <Link
              href={`/admin/faq?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(locale ? { locale } : {}),
                ...(category ? { category } : {}),
                ...(status ? { status } : {}),
                page: String(page - 1),
              }).toString()}`}
              className="inline-flex h-9 items-center justify-center rounded-md border border-sand-deep bg-sand px-3 text-graphite hover:text-navy"
            >
              ← Précédent
            </Link>
          ) : null}
          <span className="inline-flex h-9 items-center rounded-md bg-ocean px-3 font-semibold text-sand">
            Page {page} / {Math.ceil(total / PAGE_SIZE)}
          </span>
          {page * PAGE_SIZE < total ? (
            <Link
              href={`/admin/faq?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(locale ? { locale } : {}),
                ...(category ? { category } : {}),
                ...(status ? { status } : {}),
                page: String(page + 1),
              }).toString()}`}
              className="inline-flex h-9 items-center justify-center rounded-md border border-sand-deep bg-sand px-3 text-graphite hover:text-navy"
            >
              Suivant →
            </Link>
          ) : null}
        </nav>
      ) : null}

      {/* Reorder sections — shown when no filter is applied and we have multi-row groups */}
      {canReorder && !q && !category && !status ? (
        <div className="space-y-6">
          {Object.entries(groups).map(([key, list]) => {
            if (list.length < 2) return null;
            const [loc, cat] = key.split("/");
            const labels = loc === "en" ? FAQ_CATEGORY_LABELS_EN : FAQ_CATEGORY_LABELS_FR;
            return (
              <AdminReorderFaqs
                key={key}
                scope={`${labels[cat as keyof typeof labels]} · ${loc.toUpperCase()}`}
                items={list.map((r) => ({ id: r.id, label: r.question }))}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
