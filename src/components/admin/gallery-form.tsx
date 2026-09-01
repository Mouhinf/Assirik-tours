"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveGalleryItemAction } from "@/lib/gallery-actions";
import { uploadGalleryImageAction } from "@/lib/gallery-actions";
import { deliveryUrl } from "@/lib/cloudinary-url";
import {
  GALLERY_REGION_KEYS,
  REGION_LABELS_GALLERY,
  deriveAltFromPublicId,
} from "@/lib/validators/gallery";

type Region = (typeof GALLERY_REGION_KEYS)[number];

type Initial = {
  id?: string;
  cloudinaryId: string;
  captionFr: string;
  captionEn: string;
  altText: string;
  location: string;
  region: Region | null;
  takenAt: string | null;
  photographer: string;
  tags: string[];
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  width: number | null;
  height: number | null;
};

type UploadResult = {
  id: string;
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export function GalleryForm({
  mode,
  initial,
  canFeatured,
}: {
  mode: "create" | "edit";
  initial?: Initial;
  canFeatured: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [cloudinaryId, setCloudinaryId] = useState(initial?.cloudinaryId ?? "");
  const [altText, setAltText] = useState(initial?.altText ?? "");
  const [altTextTouched, setAltTextTouched] = useState(Boolean(initial?.altText));
  const [captionFr, setCaptionFr] = useState(initial?.captionFr ?? "");
  const [captionEn, setCaptionEn] = useState(initial?.captionEn ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [region, setRegion] = useState<Region | "">(initial?.region ?? "");
  const [takenAt, setTakenAt] = useState(initial?.takenAt?.slice(0, 10) ?? "");
  const [photographer, setPhotographer] = useState(initial?.photographer ?? "");
  const [tagsRaw, setTagsRaw] = useState(initial?.tags.join(", ") ?? "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [width, setWidth] = useState(initial?.width ?? null);
  const [height, setHeight] = useState(initial?.height ?? null);

  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadPending, startUpload] = useTransition();
  const [savePending, startSave] = useTransition();

  const previewUrl = cloudinaryId
    ? deliveryUrl(cloudinaryId, { width: 640, crop: "fit" })
    : "";

  const onCloudinaryIdChange = (next: string) => {
    setCloudinaryId(next);
    // Mirror the public_id into alt text until the operator customizes it.
    if (!initial && !altTextTouched) {
      setAltText(deriveAltFromPublicId(next));
    }
  };

  function onUpload(file: File) {
    setUploadError(null);
    const fd = new FormData();
    fd.append("file", file);

    startUpload(async () => {
      const res = await uploadGalleryImageAction(fd);
      if ("error" in res) {
        setUploadError(res.error ?? "Erreur inconnue");
        return;
      }
      const asset: UploadResult = res.asset;
      setCloudinaryId(asset.publicId);
      setAltText((prev) => prev || deriveAltFromPublicId(asset.publicId));
      setAltTextTouched(true);
      setWidth(asset.width);
      setHeight(asset.height);
      // Editing this row now means switching to /galerie/[id]
      router.push(`/admin/galerie/${asset.id}`);
    });
  }

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("cloudinaryId", cloudinaryId);
    formData.set("altText", altText);
    formData.set("captionFr", captionFr);
    formData.set("captionEn", captionEn);
    formData.set("location", location);
    formData.set("region", region || "");
    formData.set("takenAt", takenAt || "");
    formData.set("photographer", photographer);
    formData.set("tags", tagsRaw);
    formData.set("order", String(order));
    formData.set("width", width == null ? "" : String(width));
    formData.set("height", height == null ? "" : String(height));
    formData.set("isActive", isActive ? "on" : "");
    formData.set("isFeatured", isFeatured ? "on" : "");

    startSave(async () => {
      const res = await saveGalleryItemAction(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-6 max-w-6xl">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* ─── Left column — image + captions ─── */}
        <section className="space-y-5">
          <div className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
            <h3 className="font-display text-base font-semibold text-navy">
              Photo
            </h3>

            {mode === "create" && (
              <div className="rounded-lg border-2 border-dashed border-sand-deep bg-sand-deep/30 p-5 text-center">
                <p className="text-sm font-medium text-navy">
                  Uploadez une image, ou collez un identifiant Cloudinary existant.
                </p>
                <label className="mt-3 inline-block">
                  <span className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors">
                    {uploadPending ? "Upload…" : "Choisir un fichier"}
                  </span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onUpload(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <p className="mt-2 text-xs text-silver">JPEG, PNG, WebP, AVIF · max 12 MB</p>
                {uploadError && (
                  <p className="mt-3 inline-block rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-3 py-2 text-sm text-sunrise-coral">
                    {uploadError}
                  </p>
                )}
              </div>
            )}

            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Identifiant Cloudinary (public_id)
              </span>
              <input
                type="text"
                value={cloudinaryId}
                onChange={(e) => onCloudinaryIdChange(e.target.value)}
                placeholder="ex : assirik-tours/gallery/artisanat"
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 font-mono text-sm text-navy outline-none focus:border-ocean"
                required
              />
              <span className="mt-1 block text-xs text-silver">
                Coller ici l&apos;ID d&apos;un asset déjà présent dans la médiathèque.
              </span>
            </label>

            {previewUrl ? (
              <figure className="overflow-hidden rounded-lg border border-sand-deep">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={altText || "Aperçu"}
                  className="block w-full h-auto"
                />
              </figure>
            ) : (
              <p className="rounded-lg bg-sand-deep/40 p-6 text-center text-sm text-silver">
                Aperçu disponible dès que l&apos;identifiant Cloudinary est renseigné.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
            <h3 className="font-display text-base font-semibold text-navy">
              Légendes
            </h3>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Légende (FR) — 280 caractères max
              </span>
              <textarea
                value={captionFr}
                onChange={(e) => setCaptionFr(e.target.value.slice(0, 280))}
                rows={2}
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              />
              <span className="mt-1 block text-right text-xs text-silver">
                {captionFr.length} / 280
              </span>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Caption (EN) — 280 chars max
              </span>
              <textarea
                value={captionEn}
                onChange={(e) => setCaptionEn(e.target.value.slice(0, 280))}
                rows={2}
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              />
              <span className="mt-1 block text-right text-xs text-silver">
                {captionEn.length} / 280
              </span>
            </label>
          </div>
        </section>

        {/* ─── Right column — metadata ─── */}
        <aside className="space-y-5">
          <div className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
            <h3 className="font-display text-base font-semibold text-navy">
              Métadonnées
            </h3>

            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Texte alternatif (a11y) <span aria-hidden className="text-sunrise-coral">*</span>
              </span>
              <input
                type="text"
                value={altText}
                onChange={(e) => { setAltText(e.target.value.slice(0, 200)); setAltTextTouched(true); }}
                required
                minLength={5}
                maxLength={200}
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              />
              <span className="mt-1 block text-xs text-silver">
                5 – 200 caractères. Décrit l&apos;image pour les lecteurs d&apos;écran.
              </span>
            </label>

            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Lieu
              </span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ex : Saly-Portudal, Sénégal"
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Région
              </span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as Region | "")}
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              >
                <option value="">— Aucune —</option>
                {GALLERY_REGION_KEYS.map((r) => (
                  <option key={r} value={r}>
                    {REGION_LABELS_GALLERY[r]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Date de prise de vue
              </span>
              <input
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Photographe
              </span>
              <input
                type="text"
                value={photographer}
                onChange={(e) => setPhotographer(e.target.value)}
                placeholder="ex : Awa Diop"
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Tags (séparés par virgule, max 10)
              </span>
              <input
                type="text"
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder="ex : plage, coucher-soleil, famille"
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                  Largeur (px)
                </span>
                <input
                  type="number"
                  min={1}
                  value={width ?? ""}
                  onChange={(e) =>
                    setWidth(e.target.value ? Number(e.target.value) : null)
                  }
                  className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                  Hauteur (px)
                </span>
                <input
                  type="number"
                  min={1}
                  value={height ?? ""}
                  onChange={(e) =>
                    setHeight(e.target.value ? Number(e.target.value) : null)
                  }
                  className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
            <h3 className="font-display text-base font-semibold text-navy">
              Visibilité
            </h3>

            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Ordre d&apos;affichage
              </span>
              <input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(Math.max(0, Number(e.target.value) || 0))}
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              />
              <span className="mt-1 block text-xs text-silver">
                Les nombres plus petits apparaissent en premier.
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-sand-deep text-ocean focus:ring-ocean"
              />
              <span className="text-sm text-navy">Visible sur le site public</span>
            </label>

            <label
              className={`flex items-center gap-3 ${!canFeatured ? "opacity-50 cursor-not-allowed" : ""}`}
              title={canFeatured ? undefined : "Réservé au super-admin"}
            >
              <input
                type="checkbox"
                checked={isFeatured}
                disabled={!canFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-sand-deep text-ocean focus:ring-ocean disabled:opacity-60"
              />
              <span className="text-sm text-navy">
                Mettre à la une
                {!canFeatured ? (
                  <span className="ml-2 text-[0.65rem] uppercase tracking-wider text-silver">
                    super-admin
                  </span>
                ) : null}
              </span>
            </label>
          </div>

          <div className="rounded-xl border border-sand-deep bg-sand p-5">
            <h3 className="font-display text-base font-semibold text-navy mb-2">
              Aperçu carte publique
            </h3>
            <div className="overflow-hidden rounded-lg border border-sand-deep">
              <div className="relative aspect-[4/3] bg-sand-deep">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={altText || "Aperçu"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 to-transparent px-3 py-2 text-sand">
                  <p className="text-xs font-semibold truncate">
                    {captionFr || captionEn || altText || "Titre de la photo"}
                  </p>
                  {(location || region) && (
                    <p className="text-[0.65rem] text-mist/80 truncate">
                      {location}
                      {region ? ` · ${REGION_LABELS_GALLERY[region]}` : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {error && (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={savePending}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
        >
          {savePending
            ? "Enregistrement…"
            : mode === "create"
              ? "Créer la photo"
              : "Enregistrer les modifications"}
        </button>
        <Link
          href="/admin/galerie"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-sand-deep px-6 py-2.5 text-sm font-semibold text-graphite hover:text-navy transition-colors"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
