import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PageBlockEditor } from "@/components/admin/page-block-editor";
import { parseSeoMeta, type SeoMetaInput } from "@/lib/validators/page-blocks";
import type { Block } from "@/lib/page-blocks";

type SearchParams = { locale?: string };

const SLUGS = ["about", "services"] as const;
type SupportedSlug = (typeof SLUGS)[number];

const SLUG_LABELS: Record<SupportedSlug, { title: string; livePath: string }> = {
  about: { title: "À propos", livePath: "/a-propos" },
  services: { title: "Services", livePath: "/services" },
};

export default async function EditPageContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  if (!(SLUGS as readonly string[]).includes(slug)) notFound();
  const supportedSlug = slug as SupportedSlug;

  const sp = await searchParams;
  const activeLocale = sp.locale === "en" ? "en" : "fr";

  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "page:write")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  // Load all locales for this slug so we can switch tabs.
  const allRows = await prisma.pageContent.findMany({
    where: { slug: supportedSlug },
  });
  const activeRow = allRows.find((r) => r.locale === activeLocale);
  const frRow = allRows.find((r) => r.locale === "fr");
  const enRow = allRows.find((r) => r.locale === "en");

  const initial = activeRow
    ? {
        id: activeRow.id,
        title: activeRow.title,
        subtitle: activeRow.subtitle ?? "",
        blocks: (Array.isArray(activeRow.blocks) ? activeRow.blocks : []) as Block[],
        seoMeta: parseSeoMeta(activeRow.seoMeta) as SeoMetaInput,
        isActive: activeRow.isActive,
      }
    : undefined;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p>
          <Link
            href="/admin/pages"
            className="text-sm font-semibold text-ocean hover:text-navy"
          >
            ← Toutes les pages
          </Link>
        </p>
        <h1 className="font-display text-3xl font-semibold text-navy">
          {SLUG_LABELS[supportedSlug].title}
        </h1>
        <p className="text-xs text-silver font-mono break-all">slug : {supportedSlug}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <LocaleTab
            href={buildHref(supportedSlug, "fr")}
            active={activeLocale === "fr"}
            available={Boolean(frRow)}
          >
            FR {frRow ? "" : "(vide)"}
          </LocaleTab>
          <LocaleTab
            href={buildHref(supportedSlug, "en")}
            active={activeLocale === "en"}
            available={Boolean(enRow)}
          >
            EN {enRow ? "" : "(vide)"}
          </LocaleTab>
          {activeRow ? (
            <a
              href={SLUG_LABELS[supportedSlug].livePath}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-sm font-semibold text-ocean hover:text-navy"
            >
              Voir la version {activeLocale.toUpperCase()} ↗
            </a>
          ) : null}
        </div>
      </header>

      <PageBlockEditor
        slug={supportedSlug}
        locale={activeLocale}
        initial={initial}
      />
    </div>
  );
}

function LocaleTab({
  href,
  active,
  available,
  children,
}: {
  href: string;
  active: boolean;
  available: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-ocean text-sand"
          : available
            ? "border border-sand-deep bg-sand text-graphite hover:text-navy"
            : "border border-sand-deep bg-sand text-silver"
      }`}
    >
      {children}
    </Link>
  );
}

function buildHref(slug: SupportedSlug, locale: "fr" | "en") {
  return locale === "fr" ? `/admin/pages/${slug}` : `/admin/pages/${slug}?locale=en`;
}
