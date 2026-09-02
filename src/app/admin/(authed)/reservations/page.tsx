import Link from "next/link";
import { redirect } from "next/navigation";
import type { RequestStatus, ReservationSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { ReservationRowActions } from "./reservation-row-actions";
import { ReservationNotesDialog } from "./reservation-notes-dialog";

const STATUS_LABELS: Record<RequestStatus, string> = {
  NOUVEAU: "Nouveau",
  EN_COURS: "En cours",
  TRAITE: "Traité",
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  NOUVEAU: "bg-sunrise-orange/15 text-sunrise-coral",
  EN_COURS: "bg-sky/20 text-ocean",
  TRAITE: "bg-emerald-100 text-emerald-700",
};

const SOURCE_LABELS: Record<ReservationSource, string> = {
  CONTACT: "Contact",
  DESTINATION: "Destination",
  OFFER: "Offre",
  FLIGHT: "Billetterie",
};

const SOURCE_COLORS: Record<ReservationSource, string> = {
  CONTACT: "bg-sand-deep text-graphite",
  DESTINATION: "bg-sunrise-yellow/20 text-sunrise-amber",
  OFFER: "bg-ocean/15 text-ocean",
  FLIGHT: "bg-sky/20 text-ocean",
};

const STATUS_VALUES: RequestStatus[] = [
  "NOUVEAU",
  "EN_COURS",
  "TRAITE",
];

const PAGE_SIZE = 50;

type SearchParams = {
  source?: string;
  status?: string;
  assignee?: string;
  q?: string;
};

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  // Auth + RBAC
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "reservations:read")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const activeSource = (["CONTACT", "DESTINATION", "OFFER", "FLIGHT"] as ReservationSource[]).find(
    (s) => s === sp.source,
  );
  const activeStatus = STATUS_VALUES.find((s) => s === sp.status) ?? null;
  const activeAssignee = sp.assignee === "me" ? session.sub : sp.assignee ?? null;
  const q = sp.q?.trim() ?? "";

  const where = {
    ...(activeSource ? { source: activeSource } : {}),
    ...(activeStatus ? { processingStatus: activeStatus } : {}),
    ...(activeAssignee ? { assigneeId: activeAssignee } : {}),
    ...(q
      ? {
          OR: [
            { reference: { contains: q, mode: "insensitive" as const } },
            { subject: { contains: q, mode: "insensitive" as const } },
            { client: { firstName: { contains: q, mode: "insensitive" as const } } },
            { client: { lastName: { contains: q, mode: "insensitive" as const } } },
            { client: { email: { contains: q, mode: "insensitive" as const } } },
            { client: { phone: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [reservations, sourceCounts, statusCounts, agents] = await Promise.all([
    prisma.reservation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      include: {
        client: true,
        offer: { include: { destination: true } },
        destination: true,
        assignee: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.reservation.groupBy({
      by: ["source"],
      _count: { _all: true },
    }),
    prisma.reservation.groupBy({
      by: ["processingStatus"],
      _count: { _all: true },
    }),
    // Only load AGENT + SUPER_ADMIN (not COMPTABLE) as potential assignees.
    prisma.adminUser.findMany({
      where: { role: { in: ["AGENT", "SUPER_ADMIN"] } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const sourceTotals: Record<string, number> = {};
  for (const r of sourceCounts) {
    sourceTotals[r.source] = r._count._all;
  }
  const statusTotals: Record<string, number> = {};
  for (const r of statusCounts) {
    statusTotals[r.processingStatus] = r._count._all;
  }

  const canWrite = can(session.role, "reservations:write");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Réservations
        </h1>
        <p className="mt-1 text-graphite">
          Demandes unifiées du formulaire de contact, des devis destinations
          et offres, et des devis vol billetterie. Chaque ligne a une
          <span className="font-semibold"> source</span>, un
          <span className="font-semibold"> statut</span> et peut être
          <span className="font-semibold"> assignée</span> à un agent.
        </p>
      </header>

      {/* Source chips */}
      <nav aria-label="Filtrer par source" className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-silver">
          Source
        </span>
        <FilterChip
          href={buildUrl({ ...sp, source: undefined, page: undefined })}
          active={!activeSource}
        >
          Toutes
        </FilterChip>
        {(["CONTACT", "DESTINATION", "OFFER", "FLIGHT"] as ReservationSource[]).map((s) => (
          <FilterChip
            key={s}
            href={buildUrl({ ...sp, source: s, page: undefined })}
            active={activeSource === s}
          >
            <span className={`inline-flex items-center gap-1.5`}>
              <span
                className={`inline-block h-2 w-2 rounded-full ${dotForSource(s)}`}
                aria-hidden
              />
              {SOURCE_LABELS[s]}
              <span className="text-[0.6rem] opacity-70">({sourceTotals[s] ?? 0})</span>
            </span>
          </FilterChip>
        ))}
      </nav>

      {/* Status chips */}
      <nav aria-label="Filtrer par statut" className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-silver">
          Traitement
        </span>
        <FilterChip
          href={buildUrl({ ...sp, status: undefined, page: undefined })}
          active={!activeStatus}
        >
          Tous
        </FilterChip>
        {STATUS_VALUES.map((s) => (
          <FilterChip
            key={s}
            href={buildUrl({ ...sp, status: s, page: undefined })}
            active={activeStatus === s}
          >
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${STATUS_COLORS[s]}`}
            >
              {STATUS_LABELS[s]}
              <span className="text-[0.55rem] opacity-70">({statusTotals[s] ?? 0})</span>
            </span>
          </FilterChip>
        ))}
      </nav>

      {/* Search + assignee filter */}
      <form className="flex flex-wrap items-end gap-3">
        <label className="block flex-1 min-w-[200px]">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-graphite">
            Recherche
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Référence, client, email, objet…"
            className="min-h-11 w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-graphite">
            Assigné à
          </span>
          <select
            name="assignee"
            defaultValue={activeAssignee ?? ""}
            className="min-h-11 rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
          >
            <option value="">Tous</option>
            <option value="me">Mes demandes</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} {a.role === "SUPER_ADMIN" ? "· super-admin" : ""}
              </option>
            ))}
          </select>
        </label>
        {/* Preserve current filters */}
        {activeSource ? <input type="hidden" name="source" value={activeSource} /> : null}
        {activeStatus ? <input type="hidden" name="status" value={activeStatus} /> : null}
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy"
        >
          Filtrer
        </button>
        {(q || activeAssignee) ? (
          <Link
            href={buildUrl({
              ...sp,
              q: undefined,
              assignee: undefined,
              page: undefined,
            })}
            className="inline-flex min-h-11 items-center rounded-md border border-sand-deep px-4 py-2 text-sm font-semibold text-graphite hover:text-navy"
          >
            Réinitialiser
          </Link>
        ) : null}
      </form>

      <div className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
        {reservations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-graphite">Aucune réservation pour ces filtres.</p>
            <p className="mt-2 text-xs text-silver">
              Les devis envoyés via les formulaires publics apparaîtront ici
              automatiquement, avec leur source correctement identifiée.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Référence</th>
                  <th className="text-left px-4 py-3 font-semibold">Source</th>
                  <th className="text-left px-4 py-3 font-semibold">Client</th>
                  <th className="text-left px-4 py-3 font-semibold">Objet / Cible</th>
                  <th className="text-right px-4 py-3 font-semibold">Montant</th>
                  <th className="text-left px-4 py-3 font-semibold">Suivi</th>
                  <th className="text-left px-4 py-3 font-semibold">Reçue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-deep">
                {reservations.map((r) => {
                  const target = r.offer
                    ? `Offre : ${r.offer.title}`
                    : r.destination
                      ? `Destination : ${r.destination.title}`
                      : r.subject ?? "Demande libre";
                  return (
                    <tr key={r.id} className="hover:bg-sand-deep/30 align-top">
                      <td className="px-4 py-3 font-mono text-xs text-navy">
                        {r.reference}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${SOURCE_COLORS[r.source]}`}
                        >
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotForSource(r.source)}`} aria-hidden />
                          {SOURCE_LABELS[r.source]}
                        </span>
                        {r.tags.length > 0 ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {r.tags
                              .filter((t) => !t.startsWith("flight:"))
                              .map((t) => (
                                <span
                                  key={t}
                                  className="inline-flex items-center rounded-full bg-mist px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-ocean"
                                  title={t.startsWith("flight:") ? "Issue d'une recherche billetterie" : `Tag : ${t}`}
                                >
                                  {t}
                                </span>
                              ))}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy">
                          {r.client.firstName} {r.client.lastName}
                        </p>
                        <p className="text-xs text-silver">
                          {r.client.email || r.client.phone || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-graphite">
                        <p className="text-sm">{target}</p>
                        {r.subject && r.subject !== target ? (
                          <p className="mt-1 text-xs text-silver italic">Objet : {r.subject}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-ocean">
                        {formatFCFA(r.totalFCFA)}
                      </td>
                      <td className="px-4 py-3">
                        {canWrite ? (
                          <ReservationRowActions
                            key={`${r.id}:${r.processingStatus}:${r.assigneeId ?? "unassigned"}`}
                            id={r.id}
                            currentProcessingStatus={r.processingStatus}
                            currentAssigneeId={r.assigneeId}
                            agents={agents}
                          />
                        ) : (
                          <div className="space-y-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${STATUS_COLORS[r.processingStatus]}`}
                            >
                              {STATUS_LABELS[r.processingStatus]}
                            </span>
                            <p className="text-xs text-graphite">
                              Agent : {r.assignee?.name ?? "Non assigné"}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-silver">
                        <p>
                          {new Intl.DateTimeFormat("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(r.createdAt)}
                        </p>
                        {r.notes ? (
                          <ReservationNotesDialog
                            id={r.id}
                            notes={r.notes}
                            reference={r.reference}
                          />
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

      {reservations.length === PAGE_SIZE ? (
        <p className="text-xs text-silver text-center">
          Affichage limité aux {PAGE_SIZE} dernières réservations — affinez
          avec un filtre pour voir plus loin.
        </p>
      ) : null}
    </div>
  );
}

function buildUrl(opts: Record<string, string | undefined>, overrides: Record<string, string | undefined> = {}): string {
  const params = new URLSearchParams();
  const merged = { ...opts, ...overrides };
  for (const [k, v] of Object.entries(merged)) {
    if (k === "page") continue;
    if (typeof v === "string" && v.length > 0) params.set(k, v);
  }
  const q = params.toString();
  return q ? `/admin/reservations?${q}` : "/admin/reservations";
}

function dotForSource(s: ReservationSource): string {
  switch (s) {
    case "CONTACT":
      return "bg-graphite";
    case "DESTINATION":
      return "bg-sunrise-amber";
    case "OFFER":
      return "bg-ocean";
    case "FLIGHT":
      return "bg-sky";
  }
}

function FilterChip({
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
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
        active
          ? "bg-navy text-sand"
          : "bg-sand-deep text-navy hover:bg-ocean hover:text-sand"
      }`}
    >
      {children}
    </Link>
  );
}
