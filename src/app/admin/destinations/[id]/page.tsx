import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DestinationForm } from "@/components/admin/destination-form";

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dest = await prisma.destination.findUnique({ where: { id } });
  if (!dest) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Éditer la destination
        </h1>
        <p className="mt-1 text-graphite">{dest.title}</p>
      </header>

      <DestinationForm
        mode="edit"
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
        }}
      />
    </div>
  );
}