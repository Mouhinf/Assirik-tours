import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export default async function AdminFlightSearchesPage() {
  const session = await getSession();
  if (!session) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Session expirée.
      </p>
    );
  }
  if (!can(session.role, "flight:read")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const searches = await prisma.flightSearch.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { offers: true } } },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Recherches de vols
        </h1>
        <p className="mt-1 text-graphite">
          {searches.length} recherche(s) enregistrée(s). Les devis reçus apparaissent ici.
        </p>
      </header>

      {searches.length === 0 ? (
        <div className="rounded-xl border border-sand-deep bg-sand p-10 text-center">
          <p className="text-graphite">Aucune recherche enregistrée pour l moment.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-sand-deep bg-sand">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Trajet</th>
                <th className="px-4 py-3 hidden md:table-cell">Dates</th>
                <th className="px-4 py-3 hidden lg:table-cell">Pax</th>
                <th className="px-4 py-3 hidden lg:table-cell">Provider</th>
                <th className="px-4 py-3">Offres</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 hidden md:table-cell">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {searches.map((s) => {
                const date = s.createdAt.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-3 align-top text-xs text-graphite">
                      <Link href={`/admin/billetterie/${s.id}`} className="font-mono">
                        {date}
                      </Link>
                    </td>
                    <td className="px-4 py-3 align-top font-mono font-semibold text-navy">
                      <Link href={`/admin/billetterie/${s.id}`}>
                        {s.origin} → {s.destination}
                      </Link>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-graphite hidden md:table-cell">
                      {s.departDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      {s.returnDate ? ` → ${s.returnDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}` : ""}
                    </td>
                    <td className="px-4 py-3 align-top hidden lg:table-cell tabular-nums">
                      {s.passengers} · {s.cabinClass}
                    </td>
                    <td className="px-4 py-3 align-top hidden lg:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${
                          s.provider === "mock"
                            ? "bg-sunrise-orange/20 text-sunrise-amber"
                            : "bg-sky/15 text-ocean"
                        }`}
                      >
                        {s.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top tabular-nums">{s._count.offers}</td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-graphite hidden md:table-cell">
                      {s.quoteName ? (
                        <>
                          <p className="font-semibold text-navy">{s.quoteName}</p>
                          <p>{s.quotePhone}</p>
                          <p>{s.userEmail}</p>
                        </>
                      ) : (
                        <span className="text-silver">—</span>
                      )}
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    NEW: { label: "Nouvelle", cls: "bg-sky/15 text-ocean" },
    QUOTE_REQUESTED: { label: "Devis demandé", cls: "bg-sunrise-orange/20 text-sunrise-amber" },
    RESERVATION_CREATED: { label: "Réservation créée", cls: "bg-emerald-100 text-emerald-800" },
    ARCHIVED: { label: "Archivée", cls: "bg-sand-deep text-graphite" },
  };
  const m = map[status] ?? { label: status, cls: "bg-sand-deep text-graphite" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${m.cls}`}>
      {m.label}
    </span>
  );
}
