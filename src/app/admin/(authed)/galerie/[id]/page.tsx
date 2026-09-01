import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { GalleryForm } from "@/components/admin/gallery-form";

export default async function EditGalleryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await prisma.galleryItem.findUnique({ where: { id } });
  if (!row) notFound();

  const session = await getSession();
  if (!session) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Session expirée.
      </p>
    );
  }
  if (!can(session.role, "gallery:write")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const canFeatured = can(session.role, "gallery:featured");

  return (
    <div className="space-y-6 max-w-6xl">
      <header className="space-y-2">
        <p>
          <Link href="/admin/galerie" className="text-sm font-semibold text-ocean hover:text-navy">
            ← Retour à la galerie
          </Link>
        </p>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Éditer la photo
        </h1>
        <p className="text-sm text-graphite font-mono break-all">
          {row.cloudinaryId}
        </p>
      </header>

      <GalleryForm
        mode="edit"
        canFeatured={canFeatured}
        initial={{
          id: row.id,
          cloudinaryId: row.cloudinaryId,
          altText: row.altText,
          captionFr: row.captionFr ?? "",
          captionEn: row.captionEn ?? "",
          location: row.location ?? "",
          region: row.region,
          takenAt: row.takenAt ? row.takenAt.toISOString() : null,
          photographer: row.photographer ?? "",
          tags: row.tags,
          order: row.order,
          isActive: row.isActive,
          isFeatured: row.isFeatured,
          width: row.width,
          height: row.height,
        }}
      />
    </div>
  );
}
