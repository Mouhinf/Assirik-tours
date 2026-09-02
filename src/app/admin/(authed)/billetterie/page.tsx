import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getProviderStatus } from "@/lib/flight-providers";
import { getFlightConfig } from "@/lib/flight-config";
import { FlightConfigForm } from "@/components/admin/flight-config-form";

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

  const [searches, status, config] = await Promise.all([
    prisma.flightSearch.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { _count: { select: { offers: true } } },
    }),
    Promise.resolve(getProviderStatus()),
    getFlightConfig(),
  ]);

  // Recent Billetterie-tagged reservations — quick pivot to the unified
  // reservations queue without leaving the page.
  const recentReservations = await prisma.reservation.findMany({
    where: { tags: { has: "Billetterie" } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { client: true },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Billetterie aérienne
        </h1>
        <p className="mt-1 text-graphite">
          Config du provider, devis reçus et file de recherches publiques.
        </p>
      </header>

      {/* Provider config (read-only) + notes internes */}
      <section className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
          <div>
            <h2 className="font-display text-base font-semibold text-navy">
              Provider actif
            </h2>
            <p className="text-xs text-silver">
              Piloté par la variable d&apos;environnement <code className="font-mono">FLIGHT_PROVIDER</code>.
              Lecture seule — pour basculer, modifier <code className="font-mono">.env.local</code> et redémarrer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                status.active.key === "mock"
                  ? "bg-sunrise-orange/15 text-sunrise-amber"
                  : "bg-ocean/15 text-ocean"
              }`}
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${
                  status.active.key === "mock" ? "bg-sunrise-orange" : "bg-ocean"
                }`}
              />
              {status.active.name}
            </span>
            <span className="text-xs text-graphite">
              <code className="font-mono text-xs">{status.envVar.name}</code> ={" "}
              <code className="font-mono text-xs">{status.envVar.value}</code>
            </span>
          </div>

          <ul className="space-y-2 text-sm">
            {status.candidates.map((c) => (
              <li
                key={c.key}
                className="flex items-start gap-3 rounded-lg border border-sand-deep/60 bg-sand-deep/20 p-3"
              >
                <span
                  aria-hidden
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    c.key === status.active.key
                      ? "bg-ocean"
                      : c.configured
                        ? "bg-emerald-500"
                        : "bg-silver"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy">
                    {c.name}{" "}
                    {c.key === status.active.key ? (
                      <span className="ml-1 text-[0.7rem] uppercase tracking-wider text-ocean">
                        actif
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-graphite leading-relaxed">{c.description}</p>
                  {c.envVars.length > 0 ? (
                    <p className="mt-1 text-[0.7rem] text-silver">
                      Vars :{" "}
                      {c.envVars.map((v, i) => (
                        <span key={v}>
                          <code className="font-mono">{v}</code>
                          {i < c.envVars.length - 1 ? ", " : ""}
                        </span>
                      ))}{" "}
                      <span
                        className={
                          c.configured
                            ? "font-semibold text-emerald-700"
                            : "font-semibold text-sunrise-amber"
                        }
                      >
                        ({c.configured ? "configuré" : "non configuré"})
                      </span>
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <p className="text-xs text-silver">
            Pour brancher un nouveau provider (Duffel, Amadeus…), voir{" "}
            <code className="font-mono">/docs/flight-provider.md</code>.
          </p>
        </div>

        <div className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
          <div>
            <h2 className="font-display text-base font-semibold text-navy">
              Notes internes &amp; contact
            </h2>
            <p className="text-xs text-silver">
              Visible uniquement par l&apos;équipe. Les overrides ci-dessous
              remplacent les valeurs par défaut du site pour la page Billetterie.
            </p>
          </div>
          <FlightConfigForm
            initialNotes={config.notes}
            initialContactEmail={config.contactEmail}
            initialContactPhone={config.contactPhone}
          />
        </div>
      </section>

      {/* Recent Billetterie reservations — quick pivot */}
      {recentReservations.length > 0 ? (
        <section className="rounded-xl border border-sand-deep bg-sand p-4">
          <header className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-navy">
              Derniers devis Billetterie
            </h2>
            <Link
              href="/admin/reservations?source=FLIGHT"
              className="text-xs font-semibold text-ocean hover:text-navy"
            >
              Voir toutes les réservations Billetterie →
            </Link>
          </header>
          <ul className="divide-y divide-sand-deep text-sm">
            {recentReservations.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <span className="font-mono text-xs text-navy">{r.reference}</span>
                <span className="text-graphite">
                  {r.client.firstName} {r.client.lastName}
                </span>
                <span className="text-xs text-silver">
                  {new Intl.DateTimeFormat("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(r.createdAt)}
                </span>
                <Link
                  href="/admin/reservations"
                  className="text-xs font-semibold text-ocean hover:text-navy"
                >
                  Ouvrir →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy">
              Recherches récentes
            </h2>
            <p className="text-xs text-silver">
              {searches.length} recherche(s) enregistrée(s) — chaque ligne
              contient le détail + le devis reçu si applicable.
            </p>
          </div>
        </header>
      </section>

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
