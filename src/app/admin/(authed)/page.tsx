import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [destCount, offerCount, reservationCount, clientCount, recentReservations] =
    await Promise.all([
      prisma.destination.count(),
      prisma.offer.count(),
      prisma.reservation.count(),
      prisma.client.count(),
      prisma.reservation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { client: true, offer: { include: { destination: true } } },
      }),
    ]);

  const published = await prisma.destination.count({ where: { published: true } });
  const pending = await prisma.reservation.count({ where: { status: "NOUVELLE" } });

  const stats = [
    { label: "Destinations", value: destCount, sub: `${published} publiées` },
    { label: "Offres", value: offerCount, sub: "Catalogue" },
    {
      label: "Réservations",
      value: reservationCount,
      sub: `${pending} en attente`,
    },
    { label: "Clients", value: clientCount, sub: "Base CRM" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Tableau de bord
        </h1>
        <p className="mt-1 text-graphite">
          Vue d'ensemble de l'activité Assirik Tours.
        </p>
      </header>

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
              Aucune réservation pour l'instant.
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
            <QuickLink href="/admin/media" label="Uploader des photos" />
            <QuickLink href="/" label="Voir le site public" external />
          </div>

          <div className="mt-6 pt-6 border-t border-sand-deep">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-silver">
              Phase 2 (à venir)
            </h3>
            <ul className="mt-3 space-y-1.5 text-xs text-graphite">
              <li>· 2FA super-admin</li>
              <li>· Notifications email automatiques</li>
              <li>· Génération PDF de facture / voucher</li>
              <li>· Suivi dossiers visa</li>
            </ul>
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

// deliveryUrl available from cloudinary-url if needed
void (async () => {})();