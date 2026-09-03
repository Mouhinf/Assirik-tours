import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/utils";
import { requirePagePermission } from "@/lib/page-permissions";

export default async function AdminPaymentsPage() {
  await requirePagePermission("payments:read");
  const reservations = await prisma.reservation.findMany({
    where: { totalFCFA: { gt: 0 } },
    include: { client: true, offer: { include: { destination: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const stats = {
    encaisse: reservations.filter((r) => r.status === "PAYEE").reduce((s, r) => s + r.totalFCFA, 0),
    enAttente: reservations.filter((r) => ["NOUVELLE", "EN_COURS", "CONFIRMEE"].includes(r.status)).reduce((s, r) => s + r.totalFCFA, 0),
    rembourse: reservations.filter((r) => r.status === "ANNULEE").reduce((s, r) => s + r.totalFCFA, 0),
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">Paiements</h1>
        <p className="mt-1 text-graphite">Suivi des transactions et rapprochement. Intégration Wave / Orange Money / carte à venir.</p>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <Kpi label="Encaissé" value={formatFCFA(stats.encaisse)} accent="emerald" />
        <Kpi label="En attente" value={formatFCFA(stats.enAttente)} accent="sunrise" />
        <Kpi label="Remboursé / annulé" value={formatFCFA(stats.rembourse)} accent="rose" />
      </div>

      <section className="rounded-xl bg-sand border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">Dernières transactions</h2>
        {reservations.length === 0 ? (
          <p className="mt-4 text-sm text-graphite">Aucune transaction pour l&apos;instant.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="text-left pb-2 font-semibold">Référence</th>
                <th className="text-left pb-2 font-semibold">Client</th>
                <th className="text-left pb-2 font-semibold">Offre</th>
                <th className="text-right pb-2 font-semibold">Montant</th>
                <th className="text-left pb-2 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 font-mono text-xs text-navy">{r.reference}</td>
                  <td className="py-2 text-graphite">{r.client.firstName} {r.client.lastName}</td>
                  <td className="py-2 text-graphite">{r.offer?.title ?? "—"}</td>
                  <td className="py-2 text-right font-semibold text-ocean">{formatFCFA(r.totalFCFA)}</td>
                  <td className="py-2"><span className="text-xs font-semibold">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-xl bg-sand-deep/30 border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">Moyens de paiement acceptés</h2>
        <ul className="mt-3 space-y-2 text-sm text-graphite">
          <li>· <span className="font-semibold text-navy">Wave</span> — intégration Phase 2 (API Wave Sénégal)</li>
          <li>· <span className="font-semibold text-navy">Orange Money</span> — intégration Phase 2 (API Orange Money Sénégal)</li>
          <li>· <span className="font-semibold text-navy">Free Money</span> — intégration Phase 2</li>
          <li>· <span className="font-semibold text-navy">Carte bancaire</span> — Stripe (mode test) <a href="/paiement/demo" className="ml-2 text-ocean underline">démonstration →</a></li>
          <li>· <span className="font-semibold text-navy">Espèces / virement</span> — à l&apos;agence</li>
        </ul>
      </section>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: "ocean" | "sunrise" | "emerald" | "rose" }) {
  const colors = {
    ocean: "text-ocean",
    sunrise: "text-sunrise-coral",
    emerald: "text-emerald-700",
    rose: "text-rose-700",
  };
  return (
    <div className="rounded-xl bg-sand border border-sand-deep p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-graphite">{label}</p>
      <p className={`mt-3 font-display text-2xl font-semibold ${colors[accent ?? "ocean"]}`}>{value}</p>
    </div>
  );
}
