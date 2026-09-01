import Link from "next/link";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { listPageContents } from "@/lib/page-content-actions";
import { AdminDeletePageButton } from "./page-actions";

const PATH_BY_SLUG: Record<string, string> = {
  about: "/a-propos",
  services: "/services",
};

export default async function AdminPagesListPage() {
  const session = await getSession();
  if (!session) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Session expirée.
      </p>
    );
  }
  if (!can(session.role, "page:read")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const canWrite = can(session.role, "page:write");
  const canDelete = can(session.role, "page:delete");

  const rows = await listPageContents();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">Pages éditoriales</h1>
        <p className="mt-1 text-graphite">
          {rows.length} version(s) en base · {rows.filter((r) => r.isActive).length} active(s).
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-sand-deep bg-sand p-10 text-center">
          <p className="text-graphite">Aucune page éditoriale n&apos;a encore été créée.</p>
          {canWrite ? (
            <p className="mt-2 text-sm">
              <Link href="/admin/pages/about" className="font-semibold text-ocean hover:text-navy">
                Créer la page « À propos »
              </Link>
              {" · "}
              <Link href="/admin/pages/services" className="font-semibold text-ocean hover:text-navy">
                Créer la page « Services »
              </Link>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-sand-deep bg-sand">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Locale</th>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Blocs</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Mis à jour</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {rows.map((row) => {
                const livePath = PATH_BY_SLUG[row.slug];
                return (
                  <tr key={row.id}>
                    <td className="px-4 py-3 align-top font-mono text-xs text-navy">{row.slug}</td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${
                          row.locale === "fr"
                            ? "bg-sky/15 text-ocean"
                            : "bg-sunrise-yellow/20 text-sunrise-amber"
                        }`}
                      >
                        {row.locale}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Link href={`/admin/pages/${row.slug}`} className="font-semibold text-navy hover:text-ocean">
                        {row.title}
                      </Link>
                      {row.subtitle ? (
                        <p className="mt-0.5 text-xs text-silver">{row.subtitle}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top tabular-nums">{row.blocksCount}</td>
                    <td className="px-4 py-3 align-top">
                      {row.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-emerald-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-sand-deep px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-graphite">
                          Désactivée
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-graphite">
                      {new Date(row.updatedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 align-top text-right space-x-1">
                      {canWrite ? (
                        <Link
                          href={`/admin/pages/${row.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-ocean px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-sand hover:bg-navy"
                        >
                          Éditer
                        </Link>
                      ) : null}
                      {livePath ? (
                        <a
                          href={livePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-sand-deep bg-sand px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-graphite hover:text-navy"
                        >
                          Voir ↗
                        </a>
                      ) : null}
                      {canDelete ? (
                        <AdminDeletePageButton id={row.id} title={`${row.slug}/${row.locale}`} />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

