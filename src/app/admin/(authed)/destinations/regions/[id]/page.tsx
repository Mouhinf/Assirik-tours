import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RegionForm } from "@/components/admin/region-form";
import { requirePagePermission } from "@/lib/page-permissions";

export default async function EditRegionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePagePermission("destinations:write");
  const { id } = await params;
  const region = await prisma.region.findUnique({ where: { id } });
  if (!region) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p>
          <Link
            href="/admin/destinations/regions"
            className="text-sm font-semibold text-ocean hover:text-navy"
          >
            ← Toutes les régions
          </Link>
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-navy">
          Éditer la région
        </h1>
        <p className="mt-1 text-graphite">{region.labelFr}</p>
      </header>

      <RegionForm
        mode="edit"
        initial={{
          id: region.id,
          slug: region.slug,
          labelFr: region.labelFr,
          labelEn: region.labelEn,
          group: region.group as "senegal" | "international",
          order: region.order,
          isActive: region.isActive,
          legacyEnumKeys: region.legacyEnumKeys,
        }}
      />
    </div>
  );
}
