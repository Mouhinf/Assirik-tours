import { prisma } from "@/lib/prisma";
import { OfferForm } from "@/components/admin/offer-form";

export default async function NewOfferPage() {
  const destinations = await prisma.destination.findMany({
    where: { published: true },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  if (destinations.length === 0) {
    return (
      <div className="rounded-xl bg-sunrise-coral/10 border border-sunrise-coral/30 p-6">
        <h2 className="font-display text-lg font-semibold text-sunrise-coral">
          Aucune destination publiée
        </h2>
        <p className="mt-2 text-sm text-graphite">
          Vous devez d'abord créer et publier au moins une destination avant
          de pouvoir ajouter une offre.
        </p>
        <a
          href="/admin/destinations/new"
          className="mt-4 inline-block rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-sand hover:bg-navy"
        >
          Créer une destination →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Nouvelle offre
        </h1>
        <p className="mt-1 text-graphite">
          Créez un séjour, un circuit ou une formule Omra.
        </p>
      </header>
      <OfferForm
        mode="create"
        destinations={destinations}
      />
    </div>
  );
}