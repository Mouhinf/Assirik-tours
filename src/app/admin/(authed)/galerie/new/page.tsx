import { GalleryForm } from "@/components/admin/gallery-form";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export default async function NewGalleryItemPage() {
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
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Nouvelle photo
        </h1>
        <p className="mt-1 text-graphite">
          Uploadez une nouvelle image sur Cloudinary, puis ajoutez la légende, le
          texte alternatif et les tags.
        </p>
      </header>

      <GalleryForm mode="create" canFeatured={canFeatured} />
    </div>
  );
}
