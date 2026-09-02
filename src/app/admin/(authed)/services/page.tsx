import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { formatFCFA } from "@/lib/utils";
import { ServiceRowActions } from "@/components/admin/service-row-actions";

const CATEGORY_LABELS: Record<string, string> = {
  VISA: "Assistance visa",
  HOTELS: "Hôtels",
  CHAUFFEUR: "Véhicule avec chauffeur",
  ASSURANCE: "Assurance voyage",
  TRANSFERT: "Transferts aéroport",
  ENTREPRISE: "Sur-mesure entreprise",
  AUTRE: "Autre",
};

const CATEGORY_BADGES: Record<string, string> = {
  VISA: "bg-sky/20 text-ocean",
  HOTELS: "bg-emerald-100 text-emerald-800",
  CHAUFFEUR: "bg-sunrise-orange/20 text-sunrise-amber",
  ASSURANCE: "bg-silver/15 text-graphite",
  TRANSFERT: "bg-ocean/15 text-ocean",
  ENTREPRISE: "bg-graphite/10 text-graphite",
  AUTRE: "bg-sand-deep text-graphite",
};

export default async function AdminServicesListPage() {
  const session = await getSession();
  if (!session) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Session expirée.
      </p>
    );
  }
  if (!can(session.role, "services:read")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const services = await prisma.service.findMany({
    orderBy: [{ order: "asc" }, { title: "asc" }],
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">
            Services
          </h1>
          <p className="mt-1 text-graphite">
            Carte des prestations complémentaires (visa, hôtels, transferts…).
            {services.length > 0 ? (
              <>
                {" "}
                <strong className="text-navy">
                  {services.filter((s) => s.isActive).length}
                </strong>{" "}
                publié(s) sur {services.length}.
              </>
            ) : null}
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors"
        >
          + Nouveau service
        </Link>
      </header>

      {services.length === 0 ? (
        <div className="rounded-xl border border-sand-deep bg-sand p-10 text-center">
          <p className="text-graphite">Aucun service pour le moment.</p>
          <p className="mt-2 text-xs text-silver">
            Créez votre premier service pour qu&apos;il apparaisse sur{" "}
            <Link href="/services" className="font-semibold text-ocean hover:text-navy">
              /services
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-sand-deep bg-sand">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="px-4 py-3">Ordre</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3 hidden md:table-cell">Catégorie</th>
                <th className="px-4 py-3 hidden lg:table-cell">Tarif</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {services.map((s) => (
                <tr
                  key={s.id}
                  className={s.isActive ? "" : "opacity-60 bg-sand-deep/10"}
                >
                  <td className="px-4 py-3 align-top font-mono text-xs text-graphite tabular-nums">
                    {s.order}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/services/${s.id}`}
                      className="font-semibold text-navy hover:text-ocean"
                    >
                      {s.title}
                    </Link>
                    <p className="text-xs text-graphite line-clamp-2 max-w-md">
                      {s.shortDescription}
                    </p>
                    {s.isFeatured ? (
                      <span className="mt-1 inline-flex rounded-full bg-sunrise-orange/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-sunrise-amber">
                        Phare
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top hidden md:table-cell">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${
                        CATEGORY_BADGES[s.category] ?? "bg-sand-deep text-graphite"
                      }`}
                    >
                      {CATEGORY_LABELS[s.category] ?? s.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top hidden lg:table-cell tabular-nums">
                    {s.priceFromFCFA != null ? (
                      <div>
                        <p className="font-semibold text-navy">
                          {formatFCFA(s.priceFromFCFA)}
                        </p>
                        {s.priceNote ? (
                          <p className="text-xs text-silver">{s.priceNote}</p>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-silver italic">Sur devis</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${
                        s.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-silver/15 text-graphite"
                      }`}
                    >
                      {s.isActive ? "Publié" : "Masqué"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <ServiceRowActions
                      id={s.id}
                      isActive={s.isActive}
                      canWrite={can(session.role, "services:write")}
                      canDelete={can(session.role, "services:delete")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-silver">
        Astuce : la catégorie &laquo; Assistance visa &raquo; alimente aussi le sous-module{" "}
        <Link href="/admin/visa" className="font-semibold text-ocean hover:text-navy">
          Dossiers visa
        </Link>{" "}
        qui suit chaque client individuellement.
      </p>
    </div>
  );
}
