import Link from "next/link";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { GalleryBulkUploader } from "@/components/admin/gallery-bulk-uploader";

export default async function BulkUploadGalleryPage() {
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

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-navy">
          Upload en masse
        </h1>
        <p className="text-graphite">
          Déposez plusieurs fichiers à la fois. Chaque image sera uploadée sur
          Cloudinary et créée en base avec le statut <em>inactive</em>. Vous
          pourrez ensuite éditer chaque photo (légende, alt text, tags, ordre)
          depuis la liste principale.
        </p>
        <p className="text-sm">
          <Link href="/admin/galerie" className="font-semibold text-ocean hover:text-navy">
            ← Retour à la galerie
          </Link>
        </p>
      </header>

      <GalleryBulkUploader />
    </div>
  );
}
