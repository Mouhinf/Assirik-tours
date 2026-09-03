import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/utils";
import { deliveryUrl } from "@/lib/cloudinary-url";
import { requirePagePermission } from "@/lib/page-permissions";

const KIND_LABELS: Record<string, string> = {
  SEJOUR: "Séjour",
  CIRCUIT: "Circuit",
  SUR_MESURE: "Sur mesure",
  OMRA: "Omra",
  HAJJ: "Hajj",
  BILLETERIE: "Billetterie",
};

export default async function AdminOffersListPage() {
  await requirePagePermission("offers:read");
  const [offers, destinations] = await Promise.all([
    prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
      include: { destination: true },
    }),
    prisma.destination.findMany({
      where: { published: true },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  void destinations; // used in form below

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">
            Offres
          </h1>
          <p className="mt-1 text-graphite">
            Catalogue des offres et forfaits commercialisés.
          </p>
        </div>
        <Link
          href="/admin/offres/new"
          className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors"
        >
          + Nouvelle offre
        </Link>
      </header>

      <div className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
        {offers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-graphite">Aucune offre pour l'instant.</p>
            {destinations.length === 0 ? (
              <p className="mt-2 text-xs text-sunrise-coral">
                Créez d'abord une destination publiée pour pouvoir ajouter une
                offre.
              </p>
            ) : (
              <Link
                href="/admin/offres/new"
                className="mt-3 inline-block text-sm font-semibold text-ocean hover:text-navy"
              >
                Créer la première →
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Offre</th>
                <th className="text-left px-4 py-3 font-semibold">Destination</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-right px-4 py-3 font-semibold">Prix</th>
                <th className="text-left px-4 py-3 font-semibold">Statut</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {offers.map((o) => (
                <tr key={o.id} className="hover:bg-sand-deep/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-sand-deep shrink-0">
                        {o.coverImageId ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={deliveryUrl(o.coverImageId, { width: 80, height: 80, crop: "fill" })}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-silver text-xs">
                            —
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-navy truncate">
                          {o.title}
                        </p>
                        <p className="text-xs text-silver truncate">
                          /{o.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-graphite">
                    {o.destination.title}
                  </td>
                  <td className="px-4 py-3 text-graphite">
                    {KIND_LABELS[o.kind] ?? o.kind}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ocean">
                    {formatFCFA(o.priceFCFA)}
                  </td>
                  <td className="px-4 py-3">
                    {o.published ? (
                      <span className="inline-flex rounded-full bg-ocean/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ocean">
                        Publiée
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-silver/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-graphite">
                        Brouillon
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/offres/${o.id}`}
                      className="text-sm font-medium text-ocean hover:text-navy"
                    >
                      Éditer →
                    </Link>
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