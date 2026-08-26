import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  NOUVELLE: "Nouvelle",
  EN_COURS: "En cours",
  CONFIRMEE: "Confirmée",
  PAYEE: "Payée",
  ANNULEE: "Annulée",
  TERMINEE: "Terminée",
};

const STATUS_COLORS: Record<string, string> = {
  NOUVELLE: "bg-sunrise-orange/15 text-sunrise-coral",
  EN_COURS: "bg-sky/20 text-ocean",
  CONFIRMEE: "bg-ocean/15 text-ocean",
  PAYEE: "bg-emerald-100 text-emerald-700",
  ANNULEE: "bg-silver/15 text-graphite",
  TERMINEE: "bg-graphite/10 text-graphite",
};

export default async function AdminReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      offer: { include: { destination: true } },
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Réservations
        </h1>
        <p className="mt-1 text-graphite">
          Demandes reçues via le formulaire de contact ou saisies manuellement.
        </p>
      </header>

      <div className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
        {reservations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-graphite">Aucune réservation pour l'instant.</p>
            <p className="mt-2 text-xs text-silver">
              Les demandes envoyées via le formulaire de contact public
              apparaîtront ici automatiquement.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Référence</th>
                <th className="text-left px-4 py-3 font-semibold">Client</th>
                <th className="text-left px-4 py-3 font-semibold">Offre</th>
                <th className="text-right px-4 py-3 font-semibold">Montant</th>
                <th className="text-left px-4 py-3 font-semibold">Statut</th>
                <th className="text-left px-4 py-3 font-semibold">Reçue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-sand-deep/30">
                  <td className="px-4 py-3 font-mono text-xs text-navy">
                    {r.reference}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">
                      {r.client.firstName} {r.client.lastName}
                    </p>
                    <p className="text-xs text-silver">{r.client.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-graphite">
                    {r.offer?.title ?? "Demande sur mesure"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ocean">
                    {formatFCFA(r.totalFCFA)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${
                        STATUS_COLORS[r.status] ?? ""
                      }`}
                    >
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-silver">
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(r.createdAt)}
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