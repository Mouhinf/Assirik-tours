import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/utils";

export default async function AdminReportsPage() {
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startYear = new Date(now.getFullYear(), 0, 1);

  const reservations = await prisma.reservation.findMany({
    include: { offer: { include: { destination: true } } },
  });

  // CA par statut
  const byStatus: Record<string, { count: number; total: number }> = {};
  for (const r of reservations) {
    byStatus[r.status] ??= { count: 0, total: 0 };
    byStatus[r.status].count += 1;
    byStatus[r.status].total += r.totalFCFA;
  }

  // CA par destination
  const byDestination = new Map<string, { count: number; total: number }>();
  for (const r of reservations) {
    const k = r.offer?.destination?.title ?? "Sur mesure";
    const cur = byDestination.get(k) ?? { count: 0, total: 0 };
    cur.count += 1;
    cur.total += r.totalFCFA;
    byDestination.set(k, cur);
  }
  const destinations = Array.from(byDestination.entries()).sort((a, b) => b[1].total - a[1].total);

  const totalRevenue = reservations
    .filter((r) => r.status === "PAYEE")
    .reduce((s, r) => s + r.totalFCFA, 0);
  const monthRevenue = reservations
    .filter((r) => r.createdAt >= startMonth && r.status === "PAYEE")
    .reduce((s, r) => s + r.totalFCFA, 0);
  const yearRevenue = reservations
    .filter((r) => r.createdAt >= startYear && r.status === "PAYEE")
    .reduce((s, r) => s + r.totalFCFA, 0);

  const newReservations = reservations.filter((r) => r.status === "NOUVELLE").length;
  const conversionRate = reservations.length > 0
    ? Math.round((reservations.filter((r) => r.status === "PAYEE" || r.status === "CONFIRMEE" || r.status === "TERMINEE").length / reservations.length) * 100)
    : 0;

  const maxDestination = Math.max(1, ...destinations.map(([, v]) => v.total));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">Rapports</h1>
        <p className="mt-1 text-graphite">Vue consolidée de l&apos;activité commerciale.</p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="CA encaissé (total)" value={formatFCFA(totalRevenue)} />
        <Kpi label="CA encaissé (mois)" value={formatFCFA(monthRevenue)} accent="sunrise" />
        <Kpi label="CA encaissé (année)" value={formatFCFA(yearRevenue)} />
        <Kpi label="Taux de conversion" value={`${conversionRate}%`} accent="ocean" />
        <Kpi label="Demandes à traiter" value={`${newReservations}`} accent="sunrise" />
        <Kpi label="Réservations totales" value={`${reservations.length}`} />
      </div>

      <section className="rounded-xl bg-sand border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">CA par destination</h2>
        {destinations.length === 0 ? (
          <p className="mt-4 text-sm text-graphite">Aucune donnée.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {destinations.map(([title, v]) => (
              <li key={title}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-navy">{title}</span>
                  <span className="text-graphite">{v.count} résa · {formatFCFA(v.total)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-sand-deep overflow-hidden">
                  <div className="h-full bg-ocean rounded-full" style={{ width: `${(v.total / maxDestination) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl bg-sand border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">Pipeline par statut</h2>
        <div className="mt-4 grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(byStatus).map(([status, v]) => (
            <div key={status} className="rounded-lg bg-sand-deep/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-graphite">{status}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-navy">{v.count}</p>
              <p className="text-xs text-graphite">{formatFCFA(v.total)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: "ocean" | "sunrise" }) {
  const color = accent === "sunrise" ? "text-sunrise-coral" : accent === "ocean" ? "text-ocean" : "text-navy";
  return (
    <div className="rounded-xl bg-sand border border-sand-deep p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-graphite">{label}</p>
      <p className={`mt-3 font-display text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
