import { prisma } from "@/lib/prisma";
import { TestimonialForm } from "@/components/admin/testimonial-form";
import { requirePagePermission } from "@/lib/page-permissions";

export default async function NewTestimonialPage() {
  await requirePagePermission("testimonials:write");
  const [destRows, offerRows] = await Promise.all([
    prisma.destination.findMany({
      where: { published: true },
      select: { slug: true, title: true },
      orderBy: { homeOrder: "asc" },
    }),
    prisma.offer.findMany({
      where: { published: true },
      select: { slug: true, title: true },
      orderBy: [{ createdAt: "desc" }],
    }),
  ]);
  const tripOptions = [
    ...destRows.map((d) => ({ slug: d.slug, title: d.title, kind: "destination" as const })),
    ...offerRows.map((o) => ({ slug: o.slug, title: o.title, kind: "offer" as const })),
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Nouveau témoignage
        </h1>
        <p className="mt-1 text-graphite">
          Renseignez les informations du voyageur. Vous pourrez prévisualiser la carte avant publication.
        </p>
      </header>

      <TestimonialForm mode="create" tripOptions={tripOptions} />
    </div>
  );
}
