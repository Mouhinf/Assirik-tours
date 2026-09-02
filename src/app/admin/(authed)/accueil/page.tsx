import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getHomeHero } from "@/lib/homepage-hero";
import { HomepageHeroForm } from "@/components/admin/homepage-hero-form";

type SearchParams = { locale?: string };

export default async function AccueilPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "page:write")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const sp = await searchParams;
  const locale: "fr" | "en" = sp.locale === "en" ? "en" : "fr";
  const hero = await getHomeHero(locale);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p>
          <Link
            href="/admin"
            className="text-sm font-semibold text-ocean hover:text-navy"
          >
            ← Tableau de bord
          </Link>
        </p>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Page d&apos;accueil — Hero
        </h1>
        <p className="text-xs text-silver font-mono break-all">
          slug : home-hero
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <LocaleTab href="/admin/accueil?locale=fr" active={locale === "fr"}>
            FR
          </LocaleTab>
          <LocaleTab href="/admin/accueil?locale=en" active={locale === "en"}>
            EN
          </LocaleTab>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-sm font-semibold text-ocean hover:text-navy"
          >
            Voir la page d&apos;accueil ↗
          </a>
        </div>
      </header>

      <HomepageHeroForm locale={locale} initial={hero} />
    </div>
  );
}

function LocaleTab({
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
      className={
        active
          ? "rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-sand"
          : "rounded-full bg-sand-deep/60 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-sand-deep"
      }
    >
      {children}
    </Link>
  );
}
