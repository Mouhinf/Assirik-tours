import { listRecentMedia } from "@/lib/media-actions";
import { MediaUploader, MediaGallery } from "@/components/admin/media-uploader";
import { requirePagePermission } from "@/lib/page-permissions";

export default async function AdminMediaPage() {
  await requirePagePermission("media:read");
  const { assets, configured } = await listRecentMedia();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Médiathèque
        </h1>
        <p className="mt-1 text-graphite">
          Toutes les photos uploadées depuis l'admin. Les identifiants publics
          peuvent être copiés pour être réutilisés ailleurs.
        </p>
      </header>

      {!configured && (
        <div className="rounded-xl bg-sunrise-coral/10 border border-sunrise-coral/30 p-4 text-sm text-sunrise-coral">
          Cloudinary n'est pas configuré. Renseignez{" "}
          <code className="font-mono">CLOUDINARY_CLOUD_NAME</code>,{" "}
          <code className="font-mono">CLOUDINARY_API_KEY</code> et{" "}
          <code className="font-mono">CLOUDINARY_API_SECRET</code> dans{" "}
          <code className="font-mono">.env.local</code>.
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        <MediaUploader folder="assirik-tours/general" />
        <MediaGallery assets={assets as never} />
      </div>
    </div>
  );
}