import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deliveryUrl } from "@/lib/cloudinary-url";
import { REGION_LABELS_FR } from "@/lib/regions";
import { requirePagePermission } from "@/lib/page-permissions";

export default async function AdminDestinationsListPage() {
  await requirePagePermission("destinations:read");
  const destinations = await prisma.destination.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: {
      customRegion: { select: { id: true, labelFr: true } },
      _count: {
        select: {
          offers: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">
            Destinations
          </h1>
          <p className="mt-1 text-graphite">
            Catalogue des destinations affichées sur le site public.
          </p>
        </div>
        <Link
          href="/admin/destinations/new"
          className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors"
        >
          + Nouvelle destination
        </Link>
      </header>

      <div className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
        {destinations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-graphite">Aucune destination pour l&apos;instant.</p>
            <Link
              href="/admin/destinations/new"
              className="mt-3 inline-block text-sm font-semibold text-ocean hover:text-navy"
            >
              Créer la première →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Destination</th>
                <th className="text-left px-4 py-3 font-semibold">Région</th>
                <th className="text-right px-4 py-3 font-semibold">Offres</th>
                <th className="text-left px-4 py-3 font-semibold">Statut</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {destinations.map((d) => (
                <tr key={d.id} className="hover:bg-sand-deep/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-sand-deep shrink-0">
                        {d.heroImageId ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={deliveryUrl(d.heroImageId, { width: 80, height: 80, crop: "fill" })}
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
                        <p className="font-medium text-navy truncate">{d.title}</p>
                        <p className="text-xs text-silver truncate">/{d.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-graphite">
                    {d.customRegion
                      ? d.customRegion.labelFr
                      : REGION_LABELS_FR[d.region] ?? d.region}
                  </td>
                  <td className="px-4 py-3 text-right text-graphite">
                    {d._count.offers}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {d.published ? (
                        <span className="inline-flex rounded-full bg-ocean/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ocean">
                          Publiée
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-silver/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-graphite">
                          Brouillon
                        </span>
                      )}
                      {d.featured && (
                        <span className="inline-flex rounded-full bg-sunrise-orange/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-sunrise-coral">
                          À la une
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/destinations/${d.id}`}
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