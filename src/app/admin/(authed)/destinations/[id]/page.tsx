import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveRegions } from "@/lib/regions";
import { DestinationForm } from "@/components/admin/destination-form";
import { requirePagePermission } from "@/lib/page-permissions";

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePagePermission("destinations:write");
  const { id } = await params;
  const [dest, regions] = await Promise.all([
    prisma.destination.findUnique({
      where: { id },
      include: {
        offers: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            slug: true,
            title: true,
            kind: true,
            published: true,
            priceFCFA: true,
          },
        },
        _count: { select: { offers: true } },
      },
    }),
    getActiveRegions(),
  ]);
  if (!dest) notFound();

  // Count reservations whose offer is linked to this destination.
  const devisCount = await prisma.reservation.count({
    where: { offer: { destinationId: id } },
  });

  return (
    <div className="space-y-6">
      <header>
        <p>
          <Link
            href="/admin/destinations"
            className="text-sm font-semibold text-ocean hover:text-navy"
          >
            ← Toutes les destinations
          </Link>
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-navy">
          Éditer la destination
        </h1>
        <p className="mt-1 text-graphite">{dest.title}</p>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Devis liés"
          value={devisCount}
          accent={devisCount > 0 ? "ocean" : "graphite"}
          hint="Réservations dont l'offre est rattachée à cette destination"
        />
        <StatCard
          label="Offres publiées"
          value={dest.offers.filter((o) => o.published).length}
          accent="ocean"
          hint={`${dest.offers.length} offre(s) au total`}
        />
        <StatCard
          label="À la une (accueil)"
          value={dest.featured ? "Oui" : "Non"}
          accent={dest.featured ? "sunrise" : "graphite"}
          hint={dest.homeOrder != null ? `Position : ${dest.homeOrder}` : "Non affichée sur l'accueil"}
        />
      </div>

      {dest.offers.length > 0 ? (
        <section className="rounded-xl border border-sand-deep bg-sand p-5">
          <header className="flex items-center justify-between gap-4 mb-3">
            <h2 className="font-display text-base font-semibold text-navy">
              Offres liées ({dest.offers.length})
            </h2>
            <Link
              href={`/admin/offres/new?destinationId=${dest.id}`}
              className="text-sm font-semibold text-ocean hover:text-navy"
            >
              + Nouvelle offre pour cette destination
            </Link>
          </header>
          <ul className="divide-y divide-sand-deep">
            {dest.offers.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy truncate">{o.title}</p>
                  <p className="text-xs text-silver font-mono">/{o.slug}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {o.published ? (
                    <span className="inline-flex rounded-full bg-ocean/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ocean">
                      Publiée
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-silver/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-graphite">
                      Brouillon
                    </span>
                  )}
                  <Link
                    href={`/admin/offres/${o.id}`}
                    className="text-xs font-semibold text-ocean hover:text-navy"
                  >
                    Éditer →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="rounded-xl bg-sand-deep/40 border border-sand-deep p-5 text-sm text-graphite flex items-center justify-between gap-4">
          <span>Aucune offre n&apos;est encore rattachée à cette destination.</span>
          <Link
            href={`/admin/offres/new?destinationId=${dest.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy"
          >
            + Créer une offre
          </Link>
        </div>
      )}

      <DestinationForm
        mode="edit"
        regions={regions.map((r) => ({
          id: r.id,
          labelFr: r.labelFr,
          legacyEnumKeys: r.legacyEnumKeys,
        }))}
        initial={{
          id: dest.id,
          title: dest.title,
          slug: dest.slug,
          region: dest.region,
          summary: dest.summary,
          description: dest.description ?? "",
          heroImageId: dest.heroImageId ?? "",
          gallery: dest.gallery,
          published: dest.published,
          featured: dest.featured,
          homeOrder: dest.homeOrder,
          customRegionId: dest.customRegionId ?? null,
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number | string;
  hint: string;
  accent: "ocean" | "sunrise" | "graphite";
}) {
  const accentClass =
    accent === "ocean"
      ? "text-ocean"
      : accent === "sunrise"
      ? "text-sunrise-coral"
      : "text-graphite";
  return (
    <div className="rounded-xl border border-sand-deep bg-sand p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-graphite">{label}</p>
      <p className={`mt-1 font-display text-3xl font-semibold ${accentClass}`}>{value}</p>
      <p className="mt-1 text-xs text-silver">{hint}</p>
    </div>
  );
}