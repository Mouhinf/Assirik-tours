import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VisaStatusForm } from "@/components/admin/visa-status-form";
import { VisaCreateCard } from "@/components/admin/visa-create-card";
import { VisaStatsBar } from "@/components/admin/visa-stats-bar";
import { VisaFiltersBar } from "@/components/admin/visa-filters-bar";

const STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  DOCUMENTS_MANQUANTS: "Documents manquants",
  EN_TRAITEMENT: "En traitement",
  ACCEPTE: "Accepté",
  REFUSE: "Refusé",
};
const STATUS_COLORS: Record<string, string> = {
  BROUILLON: "bg-silver/15 text-graphite",
  DOCUMENTS_MANQUANTS: "bg-sunrise-orange/15 text-sunrise-coral",
  EN_TRAITEMENT: "bg-sky/20 text-ocean",
  ACCEPTE: "bg-emerald-100 text-emerald-700",
  REFUSE: "bg-rose-100 text-rose-700",
};

/** Compute a colour class for the deadline urgency badge. */
function deadlineBadge(deadline: Date | null): { cls: string; label: string } | null {
  if (!deadline) return null;
  const ms = deadline.getTime() - Date.now();
  const days = Math.floor(ms / 86_400_000);
  if (ms < 0) return { cls: "bg-rose-100 text-rose-700", label: "En retard" };
  if (days <= 7) return { cls: "bg-rose-100 text-rose-700", label: `J−${days} - ${days <= 1 ? "urgent" : "critique"}` };
  if (days <= 14) return { cls: "bg-sunrise-orange/15 text-sunrise-coral", label: `J−${days}` };
  return { cls: "bg-sky/15 text-ocean", label: `J−${days}` };
}

export default async function AdminVisaPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}) {
  const sp = await searchParams;
  const filterStatus = typeof sp.status === "string" && STATUS_LABELS[sp.status] ? sp.status : null;
  const search = typeof sp.search === "string" ? sp.search.trim().toLowerCase() : "";

  const allDossiers = await prisma.visaDossier.findMany({
    orderBy: { updatedAt: "desc" },
  });
  const clientIds = Array.from(new Set(allDossiers.map((d) => d.clientId)));
  const clients = await prisma.client.findMany({ where: { id: { in: clientIds } } });
  const clientsById = new Map(clients.map((c) => [c.id, c]));

  // Counts for stats & filter chips
  const counts: Record<string, number> = {};
  for (const d of allDossiers) counts[d.status] = (counts[d.status] ?? 0) + 1;

  // Apply filters
  let dossiers = filterStatus ? allDossiers.filter((d) => d.status === filterStatus) : allDossiers;
  if (search) {
    dossiers = dossiers.filter((d) => {
      const c = clientsById.get(d.clientId);
      const haystack = [
        c?.firstName,
        c?.lastName,
        c?.email,
        c?.phone,
        d.reference,
        d.destination,
        d.visaType ?? "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  // Group dossiers by client for the per-client view.
  // Sort groups by most-recent activity (max updatedAt) so the dossier owner
  // with the latest exchange always shows up first.
  const byClient = new Map<string, typeof dossiers>();
  for (const d of dossiers) {
    const list = byClient.get(d.clientId) ?? [];
    list.push(d);
    byClient.set(d.clientId, list);
  }
  const grouped = Array.from(byClient.entries())
    .map(([clientId, items]) => ({
      client: clientsById.get(clientId),
      items: items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
    }))
    .sort((a, b) => {
      const aMax = a.items[0]?.updatedAt.getTime() ?? 0;
      const bMax = b.items[0]?.updatedAt.getTime() ?? 0;
      return bMax - aMax;
    });

  // Filter chips status list (preserve declared order)
  const STATUS_ORDER = [
    "BROUILLON",
    "DOCUMENTS_MANQUANTS",
    "EN_TRAITEMENT",
    "ACCEPTE",
    "REFUSE",
  ] as const;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Dossiers visa
        </h1>
        <p className="mt-1 text-graphite">
          Suivi des formalités visa — pièces requises, RDV consulat, statut par client.
        </p>
      </header>

      <VisaStatsBar
        total={allDossiers.length}
        counts={counts}
      />

      <VisaFiltersBar
        activeStatus={filterStatus}
        search={search}
        statusOrder={STATUS_ORDER as unknown as string[]}
        statusLabels={STATUS_LABELS}
        statusColors={STATUS_COLORS}
        counts={counts}
      />

      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        <VisaCreateCard />

        <section className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
          {grouped.length === 0 ? (
            <p className="p-8 text-center text-sm text-graphite">
              {allDossiers.length === 0
                ? "Aucun dossier visa pour l'instant."
                : "Aucun dossier ne correspond à ces filtres."}
            </p>
          ) : (
            <ul className="divide-y divide-sand-deep">
              {grouped.map(({ client, items }) => (
                <li key={client?.id ?? items[0]?.id} className="p-5 space-y-4">
                  {client ? (
                    <header className="flex flex-wrap items-end justify-between gap-2 border-b border-sand-deep/60 pb-3">
                      <div>
                        <p className="font-semibold text-navy">
                          {client.firstName} {client.lastName}
                        </p>
                        <p className="text-xs text-silver">
                          {client.email}
                          {client.phone ? ` · ${client.phone}` : ""}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-graphite">
                        {items.length} dossier{items.length > 1 ? "s" : ""}
                      </span>
                    </header>
                  ) : null}
                  <div className="space-y-3">
                    {items.map((d) => {
                      const docs = Array.isArray(d.documents)
                        ? (d.documents as Array<Record<string, string>>)
                        : [];
                      const uploaded = docs.filter((doc) => doc.status === "uploaded").length;
                      const badge = deadlineBadge(d.deadline);
                      return (
                        <article
                          key={d.id}
                          className="rounded-lg border border-sand-deep bg-sand-deep/15 p-4 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-navy">
                                {d.reference} · {d.destination}
                                {d.visaType ? (
                                  <span className="ml-2 text-xs text-graphite">
                                    {d.visaType}
                                  </span>
                                ) : null}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${
                                    STATUS_COLORS[d.status] ?? ""
                                  }`}
                                >
                                  {STATUS_LABELS[d.status] ?? d.status}
                                </span>
                                {badge ? (
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${badge.cls}`}
                                    title={`Échéance consulat : ${d.deadline!.toLocaleDateString("fr-FR")}`}
                                  >
                                    ⏱ {badge.label}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            {badge ? (
                              <span className="text-xs text-silver">
                                Échéance :{" "}
                                <span className="font-mono text-navy">
                                  {d.deadline!.toLocaleDateString("fr-FR")}
                                </span>
                              </span>
                            ) : null}
                          </div>

                          {docs.length > 0 ? (
                            <div className="text-xs">
                              <p className="text-graphite">
                                Pièces :{" "}
                                <span className="font-semibold text-navy">
                                  {uploaded}/{docs.length}
                                </span>{" "}
                                transmises
                              </p>
                              <ul className="mt-2 grid sm:grid-cols-2 gap-x-4 gap-y-1">
                                {docs.map((doc, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center gap-2"
                                  >
                                    <span
                                      aria-hidden
                                      className={
                                        doc.status === "uploaded"
                                          ? "text-emerald-600"
                                          : "text-sunrise-coral"
                                      }
                                    >
                                      {doc.status === "uploaded" ? "✓" : "○"}
                                    </span>
                                    <span className="text-graphite">{doc.name}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <VisaStatusForm id={d.id} current={d.status} />
                            <Link
                              href={`/admin/clients?q=${encodeURIComponent(
                                client?.email ?? client?.firstName ?? "",
                              )}`}
                              className="text-xs font-semibold text-ocean hover:text-navy"
                            >
                              Voir fiche client →
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
