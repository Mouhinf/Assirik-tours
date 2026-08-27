import { prisma } from "@/lib/prisma";

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Connexion",
  "auth.logout": "Déconnexion",
  "auth.failed": "Tentative échouée",
  "auth.2fa_enabled": "2FA activée",
  "destination.create": "Destination créée",
  "destination.update": "Destination modifiée",
  "destination.delete": "Destination supprimée",
  "offer.create": "Offre créée",
  "offer.update": "Offre modifiée",
  "reservation.create": "Réservation créée",
  "reservation.update": "Réservation modifiée",
  "visa.create": "Dossier visa créé",
  "visa.update": "Dossier visa mis à jour",
  "visa.document_upload": "Pièce visa uploadée",
  "client.create": "Client créé",
  "client.export": "Export clients",
  "media.upload": "Média uploadé",
  "settings.update": "Paramètres modifiés",
};

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">Audit log</h1>
        <p className="mt-1 text-graphite">
          Toutes les actions sensibles du back-office. Les 200 dernières entrées sont conservées — les plus anciennes sont purgées.
        </p>
      </header>

      <section className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
        {logs.length === 0 ? (
          <p className="p-8 text-center text-sm text-graphite">Aucune entrée d&apos;audit pour l&apos;instant.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Action</th>
                <th className="text-left px-4 py-3 font-semibold">Cible</th>
                <th className="text-left px-4 py-3 font-semibold">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 text-xs text-graphite whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded-md bg-ocean/10 text-ocean px-2 py-0.5 text-xs font-semibold">
                      {ACTION_LABELS[l.action] ?? l.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-graphite">{l.entity ?? "—"}</td>
                  <td className="px-4 py-2 text-xs text-graphite">{l.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
