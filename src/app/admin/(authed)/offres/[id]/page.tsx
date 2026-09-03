import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OfferForm } from "@/components/admin/offer-form";
import { requirePagePermission } from "@/lib/page-permissions";

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePagePermission("offers:write");
  const { id } = await params;
  const [offer, destinations] = await Promise.all([
    prisma.offer.findUnique({ where: { id } }),
    prisma.destination.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);
  if (!offer) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Éditer l&apos;offre
        </h1>
        <p className="mt-1 text-graphite">{offer.title}</p>
      </header>
      <OfferForm
        mode="edit"
        destinations={destinations}
        initial={{
          id: offer.id,
          title: offer.title,
          slug: offer.slug,
          kind: offer.kind,
          summary: offer.summary,
          description: offer.description ?? "",
          priceFCFA: offer.priceFCFA,
          durationDays: offer.durationDays,
          maxGuests: offer.maxGuests,
          destinationId: offer.destinationId,
          coverImageId: offer.coverImageId ?? "",
          inclusions: offer.inclusions,
          exclusions: offer.exclusions,
          promoPriceFCFA: offer.promoPriceFCFA,
          promoEndsAt: offer.promoEndsAt ? offer.promoEndsAt.toISOString().slice(0, 10) : null,
          availabilityType: offer.availabilityType,
          stock: offer.stock,
          published: offer.published,
          featuredOnHome: offer.featuredOnHome,
          homeOrder: offer.homeOrder,
        }}
      />
    </div>
  );
}