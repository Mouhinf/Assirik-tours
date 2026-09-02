import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { toggleRegionActiveAction, deleteRegionAction } from "@/lib/region-actions";

const GROUP_LABELS: Record<string, string> = {
  senegal: "Sénégal",
  international: "International",
};

export default async function AdminRegionsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "destinations:read")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const regions = await prisma.region.findMany({
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
    include: {
      _count: { select: { destinations: true } },
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p>
            <Link
              href="/admin/destinations"
              className="text-sm font-semibold text-ocean hover:text-navy"
            >
              ← Toutes les destinations
            </Link>
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-navy">
            Régions
          </h1>
          <p className="mt-1 text-graphite">
            Régions admin-gérées qui apparaissent dans le filtre du site public.
            Toute modification est visible immédiatement.
          </p>
        </div>
        <Link
          href="/admin/destinations/regions/new"
          className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors"
        >
          + Nouvelle région
        </Link>
      </header>

      <div className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
        {regions.length === 0 ? (
          <div className="p-12 text-center text-graphite">
            Aucune région pour l&apos;instant. Lancez{" "}
            <code className="font-mono bg-sand-deep/60 px-1 py-0.5 rounded">
              pnpm tsx scripts/seed-regions.ts
            </code>{" "}
            pour initialiser les défauts.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Région</th>
                <th className="text-left px-4 py-3 font-semibold">Slug</th>
                <th className="text-left px-4 py-3 font-semibold">Groupe</th>
                <th className="text-right px-4 py-3 font-semibold">Destinations liées</th>
                <th className="text-right px-4 py-3 font-semibold">Ordre</th>
                <th className="text-left px-4 py-3 font-semibold">Statut</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {regions.map((r) => (
                <tr key={r.id} className="hover:bg-sand-deep/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{r.labelFr}</p>
                    {r.labelEn && r.labelEn !== r.labelFr ? (
                      <p className="text-xs text-silver">{r.labelEn}</p>
                    ) : null}
                    {r.legacyEnumKeys.length > 0 ? (
                      <p className="mt-0.5 text-xs text-silver font-mono">
                        ↔ {r.legacyEnumKeys.join(", ")}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-graphite font-mono text-xs">{r.slug}</td>
                  <td className="px-4 py-3 text-graphite">
                    {GROUP_LABELS[r.group] ?? r.group}
                  </td>
                  <td className="px-4 py-3 text-right text-graphite">
                    {r._count.destinations}
                  </td>
                  <td className="px-4 py-3 text-right text-graphite">{r.order}</td>
                  <td className="px-4 py-3">
                    {r.isActive ? (
                      <span className="inline-flex rounded-full bg-ocean/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ocean">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-silver/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-graphite">
                        Masquée
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`/admin/destinations/regions/${r.id}`}
                        className="text-sm font-medium text-ocean hover:text-navy"
                      >
                        Éditer →
                      </Link>
                      <form action={toggleRegionActiveAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          className="text-xs font-semibold text-graphite hover:text-navy"
                        >
                          {r.isActive ? "Désactiver" : "Activer"}
                        </button>
                      </form>
                      {r._count.destinations === 0 ? (
                        <form action={deleteRegionAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <button
                            type="submit"
                            className="text-xs font-semibold text-sunrise-coral hover:underline"
                          >
                            Supprimer
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
