import Link from "next/link";
import type { FaqItem } from "@prisma/client";
import { FaqCategoryIcon } from "@/components/faq-category-icon";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import {
  FAQ_CATEGORIES,
  FAQ_CATEGORY_LABELS_EN,
  FAQ_CATEGORY_LABELS_FR,
  type FaqCategory,
} from "@/lib/validators/faq";
import { AdminDeleteFaqButton } from "./delete-faq-button";
import { AdminReorderFaqs } from "./reorder-faqs";
import { AdminToggleFaqActiveButton } from "./toggle-faq-active-button";

const PAGE_SIZE = 30;

const CATEGORY_BADGE: Record<FaqCategory, string> = {
  general: "bg-sky/15 text-ocean",
  payment: "bg-sunrise-orange/15 text-sunrise-coral",
  visa: "bg-mist text-navy",
  flight: "bg-sky/15 text-ocean",
  omra: "bg-sunrise-yellow/20 text-sunrise-coral",
  services: "bg-graphite/15 text-graphite",
};

type SearchParams = {
  q?: string;
  locale?: string;
  category?: string;
  status?: string;
  page?: string;
};

export default async function AdminFaqListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const locale = sp.locale === "fr" || sp.locale === "en" ? sp.locale : undefined;
  const category = FAQ_CATEGORIES.find((item) => item === sp.category);
  const status =
    sp.status === "active" || sp.status === "inactive"
      ? sp.status
      : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const session = await getSession();
  if (!session) {
    return <PermissionMessage>Session expirée.</PermissionMessage>;
  }
  if (!can(session.role, "faq:read")) {
    return <PermissionMessage>Accès refusé.</PermissionMessage>;
  }

  const canWrite = can(session.role, "faq:write");
  const canDelete = can(session.role, "faq:delete");
  const canReorder = can(session.role, "faq:reorder");
  const showGrouped = !q && !locale && !category && !status;

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

  const [rows, total, reorderRows] = await Promise.all([
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
    canReorder && showGrouped
      ? prisma.faqItem.findMany({
          orderBy: [
            { locale: "asc" },
            { category: "asc" },
            { order: "asc" },
          ],
        })
      : Promise.resolve([] as FaqItem[]),
  ]);

  const categoryGroups = FAQ_CATEGORIES.map((item) => ({
    category: item,
    rows: rows.filter((row) => row.category === item),
  })).filter((group) => group.rows.length > 0);

  const reorderGroups = reorderRows.reduce<Record<string, FaqItem[]>>(
    (groups, row) => {
      const key = `${row.locale}/${row.category}`;
      (groups[key] ??= []).push(row);
      return groups;
    },
    {},
  );
  const reorderEntries = Object.entries(reorderGroups).filter(
    ([, items]) => items.length > 1,
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">FAQ</h1>
          <p className="mt-1 text-graphite">
            {rows.length} affichées · {total} correspondent aux filtres.
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/admin/faq/new"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand transition-colors hover:bg-navy"
          >
            <span aria-hidden>+</span> Nouvelle question
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
            placeholder="Question, réponse…"
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
            {FAQ_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {FAQ_CATEGORY_LABELS_FR[item]}
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
            <option value="active">Active</option>
            <option value="inactive">Désactivée</option>
          </select>
        </label>
        <div className="flex items-end gap-2 lg:col-span-5">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-sand transition-colors hover:bg-navy"
          >
            Filtrer
          </button>
          <Link
            href="/admin/faq"
            className="inline-flex min-h-11 items-center rounded-md border border-sand-deep px-4 py-2 text-sm font-semibold text-graphite transition-colors hover:text-navy"
          >
            Réinitialiser
          </Link>
        </div>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-sand-deep bg-sand p-10 text-center md:p-12">
          <p className="text-graphite">Aucune question ne correspond.</p>
          {canWrite ? (
            <Link
              href="/admin/faq/new"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-ocean hover:text-navy"
            >
              Créer la première <span aria-hidden>→</span>
            </Link>
          ) : null}
        </div>
      ) : showGrouped ? (
        <div className="space-y-3">
          {categoryGroups.map((group) => (
            <details
              key={group.category}
              open
              className="group overflow-hidden rounded-xl border border-sand-deep bg-sand"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
                <FaqCategoryIcon
                  category={group.category}
                  size={19}
                  className="shrink-0 text-ocean"
                />
                <span className="font-display font-semibold text-navy">
                  {FAQ_CATEGORY_LABELS_FR[group.category]}
                </span>
                <span className="text-sm tabular-nums text-silver">
                  {group.rows.length} question{group.rows.length > 1 ? "s" : ""}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="ml-auto text-graphite transition-transform group-open:rotate-180 motion-reduce:transition-none"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <FaqTable
                rows={group.rows}
                canWrite={canWrite}
                canDelete={canDelete}
                showCategory={false}
              />
            </details>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-sand-deep bg-sand">
          <FaqTable
            rows={rows}
            canWrite={canWrite}
            canDelete={canDelete}
            showCategory
          />
        </div>
      )}

      {total > PAGE_SIZE ? (
        <nav aria-label="Pagination FAQ" className="flex items-center justify-center gap-2 text-sm">
          {page > 1 ? (
            <Link
              href={buildPageUrl({ q, locale, category, status }, page - 1)}
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
              href={buildPageUrl({ q, locale, category, status }, page + 1)}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-sand-deep bg-sand px-3 text-graphite hover:text-navy"
            >
              Suivant&nbsp;<span aria-hidden>→</span>
            </Link>
          ) : null}
        </nav>
      ) : null}

      {canReorder && showGrouped && reorderEntries.length > 0 ? (
        <details className="group rounded-xl border border-sand-deep bg-sand p-1">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="font-display font-semibold text-navy">
              Réorganiser l’ordre d’affichage
            </span>
            <span className="text-sm text-silver">Super-admin uniquement</span>
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="ml-auto text-graphite transition-transform group-open:rotate-180 motion-reduce:transition-none"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="space-y-4 p-3 pt-0">
            {reorderEntries.map(([key, items]) => {
              const [itemLocale, itemCategory] = key.split("/");
              const labels =
                itemLocale === "en"
                  ? FAQ_CATEGORY_LABELS_EN
                  : FAQ_CATEGORY_LABELS_FR;
              return (
                <AdminReorderFaqs
                  key={key}
                  scope={`${labels[itemCategory as FaqCategory]} · ${itemLocale.toUpperCase()}`}
                  items={items.map((item) => ({
                    id: item.id,
                    label: item.question,
                  }))}
                />
              );
            })}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function PermissionMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-sunrise-coral/30 bg-sunrise-coral/10 px-4 py-3 text-sm text-sunrise-coral">
      {children}
    </p>
  );
}

function FaqTable({
  rows,
  canWrite,
  canDelete,
  showCategory,
}: {
  rows: FaqItem[];
  canWrite: boolean;
  canDelete: boolean;
  showCategory: boolean;
}) {
  return (
    <>
      <ul className="divide-y divide-sand-deep border-t border-sand-deep md:hidden">
        {rows.map((row) => {
          const faqCategory =
            FAQ_CATEGORIES.find((item) => item === row.category) ?? "general";
          const labels =
            row.locale === "en"
              ? FAQ_CATEGORY_LABELS_EN
              : FAQ_CATEGORY_LABELS_FR;
          const answerPreview = `${row.answer.slice(0, 105)}${
            row.answer.length > 105 ? "…" : ""
          }`;

          return (
            <li key={row.id} className="space-y-3 p-4">
              <div className="min-w-0">
                <p className="font-medium leading-snug text-navy">
                  {row.question}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-silver">
                  {answerPreview}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {showCategory ? (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${CATEGORY_BADGE[faqCategory]}`}
                  >
                    <FaqCategoryIcon category={faqCategory} size={13} />
                    {labels[faqCategory]}
                  </span>
                ) : null}
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${
                    row.locale === "en"
                      ? "bg-sky/15 text-ocean"
                      : "bg-ocean/15 text-navy"
                  }`}
                >
                  {row.locale.toUpperCase()}
                </span>
                <span className="inline-flex rounded-full bg-sand-deep/40 px-2 py-1 font-mono text-[0.65rem] text-graphite">
                  #{row.order}
                </span>
                {canWrite ? (
                  <AdminToggleFaqActiveButton
                    id={row.id}
                    isActive={row.isActive}
                  />
                ) : (
                  <span className="text-xs font-medium text-graphite">
                    {row.isActive ? "Active" : "Désactivée"}
                  </span>
                )}
              </div>

              {canWrite || canDelete ? (
                <div className="flex items-center justify-end gap-2 border-t border-sand-deep pt-2">
                  {canWrite ? (
                    <Link
                      href={`/admin/faq/${row.id}`}
                      className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-ocean hover:text-navy"
                    >
                      Éditer
                    </Link>
                  ) : null}
                  {canDelete ? <AdminDeleteFaqButton id={row.id} /> : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto border-t border-sand-deep first:border-t-0 md:block">
      <table className="w-full min-w-[46rem] text-sm">
        <caption className="sr-only">Questions fréquentes administrables</caption>
        <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              Question
            </th>
            {showCategory ? (
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                Catégorie
              </th>
            ) : null}
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              Langue
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              Statut
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-deep">
          {rows.map((row) => {
            const faqCategory =
              FAQ_CATEGORIES.find((item) => item === row.category) ?? "general";
            const labels =
              row.locale === "en"
                ? FAQ_CATEGORY_LABELS_EN
                : FAQ_CATEGORY_LABELS_FR;
            const answerPreview = `${row.answer.slice(0, 80)}${
              row.answer.length > 80 ? "…" : ""
            }`;

            return (
              <tr key={row.id} className="transition-colors hover:bg-sand-deep/30">
                <td className="px-4 py-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 max-w-lg font-medium text-navy">
                      {row.question}
                    </p>
                    <p className="mt-1 line-clamp-1 max-w-lg text-xs text-silver">
                      {answerPreview}
                    </p>
                  </div>
                </td>
                {showCategory ? (
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${CATEGORY_BADGE[faqCategory]}`}
                    >
                      <FaqCategoryIcon category={faqCategory} size={13} />
                      {labels[faqCategory]}
                    </span>
                    <span className="ml-2 inline-flex rounded-full bg-sand-deep/40 px-1.5 py-0.5 font-mono text-[0.6rem] text-graphite">
                      #{row.order}
                    </span>
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${
                      row.locale === "en"
                        ? "bg-sky/15 text-ocean"
                        : "bg-ocean/15 text-navy"
                    }`}
                  >
                    {row.locale.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {canWrite ? (
                    <AdminToggleFaqActiveButton
                      id={row.id}
                      isActive={row.isActive}
                    />
                  ) : row.isActive ? (
                    <span className="inline-flex rounded-full bg-mist px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-navy">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-silver/15 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-graphite">
                      Désactivée
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    {canWrite ? (
                      <Link
                        href={`/admin/faq/${row.id}`}
                        className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-ocean hover:text-navy"
                      >
                        Éditer
                      </Link>
                    ) : null}
                    {canDelete ? <AdminDeleteFaqButton id={row.id} /> : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </>
  );
}

function buildPageUrl(
  filters: {
    q: string;
    locale?: string;
    category?: FaqCategory;
    status?: string;
  },
  page: number,
) {
  const params = new URLSearchParams({
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.locale ? { locale: filters.locale } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    page: String(page),
  });
  return `/admin/faq?${params.toString()}`;
}
