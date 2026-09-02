import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await prisma.testimonial.findUnique({ where: { id } });
  if (!t) notFound();
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
          Éditer le témoignage
        </h1>
        <p className="mt-1 text-graphite">
          {t.author}
          {t.city ? ` · ${t.city}` : ""} · {t.locale.toUpperCase()}
        </p>
      </header>

      <TestimonialForm
        mode="edit"
        tripOptions={tripOptions}
        initial={{
          id: t.id,
          author: t.author,
          city: t.city,
          content: t.content,
          rating: t.rating,
          tripSlug: t.tripSlug,
          locale: t.locale as "fr" | "en",
          avatarId: t.avatarId,
          dateTrip: t.dateTrip ? t.dateTrip.toISOString().slice(0, 10) : null,
          order: t.order,
          approved: t.approved,
        }}
      />
    </div>
  );
}
