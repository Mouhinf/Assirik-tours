import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/utils";
import { can } from "@/lib/rbac";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  NOUVEAU: "Nouveau",
  EN_COURS: "En cours",
  TRAITE: "Traité",
};

const SOURCE_LABELS: Record<string, string> = {
  CONTACT: "Contact",
  DESTINATION: "Destination",
  OFFER: "Offre",
  FLIGHT: "Billetterie",
};

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "dashboard:view")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const [
    destCount,
    offerCount,
    totalReservations,
    clientCount,
    recentReservations,
    statusCounts,
    sourceCounts,
    todayCount,
    weekCount,
    topDestinations,
    topOffers,
  ] = await Promise.all([
    prisma.destination.count(),
    prisma.offer.count(),
    prisma.reservation.count(),
    prisma.client.count(),
    prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { client: true, offer: { include: { destination: true } } },
    }),
    prisma.reservation.groupBy({
      by: ["processingStatus"],
      _count: { _all: true },
    }),
    prisma.reservation.groupBy({
      by: ["source"],
      _count: { _all: true },
    }),
    prisma.reservation.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.reservation.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.$queryRaw<{ title: string; count: bigint }[]>`
      SELECT d.title, COUNT(r.id)::bigint as count
      FROM "Reservation" r
      JOIN "Destination" d ON d.id = r."destinationId"
      GROUP BY d.id, d.title
      ORDER BY count DESC
      LIMIT 5
    `,
    prisma.$queryRaw<{ title: string; count: bigint }[]>`
      SELECT o.title, COUNT(r.id)::bigint as count
      FROM "Reservation" r
      JOIN "Offer" o ON o.id = r."offerId"
      WHERE r."offerId" IS NOT NULL
      GROUP BY o.id, o.title
      ORDER BY count DESC
      LIMIT 5
    `,
  ]);

  const published = await prisma.destination.count({ where: { published: true } });
  const total = totalReservations || 1;

  const statusTotals: Record<string, number> = {};
  let totalStatus = 0;
  for (const r of statusCounts) {
    statusTotals[r.processingStatus] = r._count._all;
    totalStatus += r._count._all;
  }

  const sourceTotals: Record<string, number> = {};
  for (const r of sourceCounts) {
    sourceTotals[r.source] = r._count._all;
  }

  const stats = [
    { label: "Destinations", value: destCount, sub: `${published} publiées` },
    { label: "Offres", value: offerCount, sub: "Catalogue" },
    {
      label: "Réservations",
      value: totalReservations,
      sub: `${statusTotals["NOUVEAU"] ?? 0} en attente`,
    },
    { label: "Clients", value: clientCount, sub: "Base CRM" },
  ];

  const statusColors: Record<string, string> = {
    NOUVEAU: "bg-sunrise-orange",
    EN_COURS: "bg-ocean",
    TRAITE: "bg-emerald-500",
  };

  const sourceColors: Record<string, string> = {
    CONTACT: "bg-graphite",
    DESTINATION: "bg-sunrise-yellow",
    OFFER: "bg-ocean",
    FLIGHT: "bg-sky",
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Tableau de bord
        </h1>
        <p className="mt-1 text-graphite">
          Vue d&apos;ensemble de l&apos;activité Assirik Tours.
        </p>
      </header>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-sand border border-sand-deep p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-silver">
              {s.label}
            </p>
            <p className="mt-3 font-display text-3xl font-semibold text-navy">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-graphite">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Activity summary row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-sand border border-sand-deep p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-silver">Aujourd&apos;hui</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ocean">{todayCount}</p>
          <p className="text-xs text-graphite">nouvelles demandes</p>
        </div>
        <div className="rounded-xl bg-sand border border-sand-deep p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-silver">Cette semaine</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ocean">{weekCount}</p>
          <p className="text-xs text-graphite">nouvelles demandes</p>
        </div>
        <div className="rounded-xl bg-sand border border-sand-deep p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-silver">En attente (Nouveau)</p>
          <p className="mt-2 font-display text-2xl font-semibold text-sunrise-coral">{statusTotals["NOUVEAU"] ?? 0}</p>
          <p className="text-xs text-graphite">{totalStatus > 0 ? Math.round(((statusTotals["NOUVEAU"] ?? 0) / totalStatus) * 100) : 0}% du total</p>
        </div>
      </div>

      {/* Statuts + Sources + Top destinations row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Statuts de traitement */}
        <section className="rounded-xl bg-sand border border-sand-deep p-5">
          <h2 className="font-display text-sm font-semibold text-navy uppercase tracking-wider">
            Par statut de traitement
          </h2>
          <div className="mt-4 space-y-3">
            {(["NOUVEAU", "EN_COURS", "TRAITE"] as const).map((s) => {
              const count = statusTotals[s] ?? 0;
              const pct = totalStatus > 0 ? (count / totalStatus) * 100 : 0;
              return (
                <div key={s}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-navy">{STATUS_LABELS[s]}</span>
                    <span className="text-graphite">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-sand-deep overflow-hidden">
                    <div
                      className={`h-full rounded-full ${statusColors[s]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sources */}
        <section className="rounded-xl bg-sand border border-sand-deep p-5">
          <h2 className="font-display text-sm font-semibold text-navy uppercase tracking-wider">
            Par source
          </h2>
          <div className="mt-4 space-y-3">
            {(["CONTACT", "DESTINATION", "OFFER", "FLIGHT"] as const).map((s) => {
              const count = sourceTotals[s] ?? 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={s}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-navy">{SOURCE_LABELS[s]}</span>
                    <span className="text-graphite">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-sand-deep overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sourceColors[s]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top destinations */}
        <section className="rounded-xl bg-sand border border-sand-deep p-5">
          <h2 className="font-display text-sm font-semibold text-navy uppercase tracking-wider">
            Destinations les plus demandées
          </h2>
          {topDestinations.length === 0 ? (
            <p className="mt-4 text-xs text-graphite">Aucune donnée.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {topDestinations.map((d, i) => (
                <li key={d.title} className="flex items-center gap-3 text-sm">
                  <span className={`shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full text-[0.6rem] font-bold ${i === 0 ? "bg-sunrise-orange text-sand" : i === 1 ? "bg-ocean text-sand" : "bg-sand-deep text-graphite"}`}>
                    {i + 1}
                  </span>
                  <span className="text-navy font-medium truncate">{d.title}</span>
                  <span className="ml-auto text-xs text-graphite shrink-0">{Number(d.count)} rés.</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Top offres */}
      {topOffers.length > 0 && (
        <section className="rounded-xl bg-sand border border-sand-deep p-5">
          <h2 className="font-display text-sm font-semibold text-navy uppercase tracking-wider">
            Offres les plus demandées
          </h2>
          <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topOffers.map((o, i) => (
              <li key={o.title} className="flex items-center gap-2 rounded-lg bg-sand-deep/40 p-3">
                <span className={`shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full text-[0.6rem] font-bold ${i === 0 ? "bg-sunrise-orange text-sand" : "bg-ocean/20 text-ocean"}`}>
                  {i + 1}
                </span>
                <span className="text-xs text-navy font-medium truncate">{o.title}</span>
                <span className="ml-auto text-xs text-graphite shrink-0">{Number(o.count)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recent reservations */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <section className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
          <header className="px-5 py-4 border-b border-sand-deep flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-navy">
              Dernières réservations
            </h2>
            <Link
              href="/admin/reservations"
              className="text-xs font-semibold text-ocean hover:text-navy"
            >
              Voir tout →
            </Link>
          </header>

          {recentReservations.length === 0 ? (
            <p className="p-8 text-center text-sm text-silver">
              Aucune réservation pour l&apos;instant.
            </p>
          ) : (
            <ul className="divide-y divide-sand-deep">
              {recentReservations.map((r) => (
                <li
                  key={r.id}
                  className="px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">
                      {r.client.firstName} {r.client.lastName}
                    </p>
                    <p className="text-xs text-graphite truncate">
                      {r.offer?.title ?? "Demande sur mesure"} · {r.travelers} voyageur(s)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-ocean">
                      {formatFCFA(r.totalFCFA)}
                    </p>
                    <StatusBadge status={r.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl bg-sand border border-sand-deep p-5">
          <h2 className="font-display text-base font-semibold text-navy">
            Actions rapides
          </h2>
          <div className="mt-4 space-y-2">
            <QuickLink href="/admin/destinations/new" label="Ajouter une destination" />
            <QuickLink href="/admin/offres/new" label="Créer une offre" />
            <QuickLink href="/admin/reservations" label="Voir les réservations" />
            <QuickLink href="/admin/clients" label="Gérer les clients" />
            <QuickLink href="/admin/media" label="Uploader des photos" />
            <QuickLink href="/" label="Voir le site public" external />
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className="flex items-center justify-between rounded-lg bg-sand-deep/40 px-4 py-2.5 text-sm font-medium text-navy hover:bg-ocean/10 hover:text-ocean transition-colors"
    >
      {label}
      <span aria-hidden>→</span>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    NOUVELLE: "bg-sunrise-orange/15 text-sunrise-coral",
    EN_COURS: "bg-sky/20 text-ocean",
    CONFIRMEE: "bg-ocean/15 text-ocean",
    PAYEE: "bg-emerald-100 text-emerald-700",
    ANNULEE: "bg-silver/15 text-graphite",
    TERMINEE: "bg-graphite/10 text-graphite",
  };
  const labels: Record<string, string> = {
    NOUVELLE: "Nouvelle",
    EN_COURS: "En cours",
    CONFIRMEE: "Confirmée",
    PAYEE: "Payée",
    ANNULEE: "Annulée",
    TERMINEE: "Terminée",
  };
  return (
    <span
      className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${colors[status] ?? ""}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
