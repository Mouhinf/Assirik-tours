"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveDestinationAction } from "@/lib/destination-actions";
import { MediaUploader } from "./media-uploader";
import { ImagePicker } from "./image-picker";
import { GalleryPicker } from "./gallery-picker";

type Initial = {
  id?: string;
  title: string;
  slug: string;
  region: string;
  summary: string;
  description: string;
  heroImageId: string;
  gallery: string[];
  published: boolean;
  featured: boolean;
  homeOrder: number | null;
  customRegionId: string | null;
};

const REGIONS_LEGACY: [string, string][] = [
  ["DAKAR", "Dakar"],
  ["NIAYES", "Niayes (Lac Rose, Lompoul)"],
  ["PETITE_COTE", "Petite-Côte (Saly, Mbour)"],
  ["CASAMANCE", "Casamance"],
  ["SENEGAL_ORIENTAL", "Sénégal Oriental"],
  ["SAINT_LOUIS", "Saint-Louis"],
  ["AFRIQUE_OUEST", "Afrique de l'Ouest"],
  ["EUROPE", "Europe"],
  ["MOYEN_ORIENT", "Moyen-Orient"],
  ["ASIE", "Asie"],
  ["AMERIQUE", "Amérique"],
];

type RegionOption = { id: string; labelFr: string; legacyEnumKeys: string[] };

export function DestinationForm({
  mode,
  initial,
  regions,
}: {
  mode: "create" | "edit";
  initial?: Initial;
  regions: RegionOption[];
}) {
  const [heroImageId, setHeroImageId] = useState(initial?.heroImageId ?? "");
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [customRegionId, setCustomRegionId] = useState(initial?.customRegionId ?? "");

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("heroImageId", heroImageId);
    formData.set("gallery", gallery.join("\n"));
    formData.set("customRegionId", customRegionId);

    startTransition(async () => {
      const res = await saveDestinationAction(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-6 max-w-3xl">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <Field label="Titre" name="title" required defaultValue={initial?.title} />
      <Field
        label="Slug (URL)"
        name="slug"
        placeholder="laisser vide pour générer depuis le titre"
        defaultValue={initial?.slug}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Région (enum legacy)
            </span>
            <select
              name="region"
              defaultValue={initial?.region ?? "DAKAR"}
              className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
            >
              {REGIONS_LEGACY.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <span className="block mt-1 text-xs text-silver">
              Conservé pour la rétro-compatibilité.
            </span>
          </label>
        </div>
        <div>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Région admin-gérée
            </span>
            <select
              value={customRegionId}
              onChange={(e) => setCustomRegionId(e.target.value)}
              className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
            >
              <option value="">— Aucune —</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.labelFr}
                  {r.legacyEnumKeys.length > 0
                    ? ` ( couvre ${r.legacyEnumKeys.length} enum )`
                    : ""}
                </option>
              ))}
            </select>
            <span className="block mt-1 text-xs text-silver">
              Géré dans <Link href="/admin/destinations/regions" className="underline">Régions</Link>.
              Laissez vide pour n&apos;utiliser que l&apos;enum.
            </span>
          </label>
        </div>
      </div>

      <Field
        label="Résumé (1-2 phrases)"
        name="summary"
        required
        defaultValue={initial?.summary}
      />

      <Field
        label="Description complète"
        name="description"
        type="textarea"
        rows={8}
        defaultValue={initial?.description}
      />

      {/* Image principale */}
      <section className="rounded-xl border border-sand-deep bg-sand p-5">
        <h3 className="font-display text-base font-semibold text-navy">
          Image principale
        </h3>
        <p className="mt-1 text-xs text-silver">
          Format paysage recommandé. Affichée sur la page daccueil et en haut
          de la fiche destination.
        </p>
        <div className="mt-4">
          <ImagePicker
            label="Image principale (Cloudinary)"
            value={heroImageId}
            onChange={setHeroImageId}
            folder="assirik-tours/destinations"
            previewWidth={240}
            previewHeight={160}
            hint="Paysage 16:9, 1600×900 ou plus. Stockée sur Cloudinary."
          />
        </div>
      </section>

      {/* Galerie */}
      <section className="rounded-xl border border-sand-deep bg-sand p-5">
        <h3 className="font-display text-base font-semibold text-navy">
          Galerie (optionnel)
        </h3>
        <GalleryPicker
          value={gallery}
          onChange={setGallery}
          folder="assirik-tours/destinations"
          label="Galerie d'images (Cloudinary)"
          hint="Uploadez depuis votre ordinateur, ou ajoutez par public_id depuis la médiathèque."
        />
      </section>

      <div className="flex flex-wrap gap-6">
        <Toggle
          name="published"
          label="Publiée (visible sur le site)"
          defaultChecked={initial?.published ?? false}
        />
        <Toggle
          name="featured"
          label="À la une (page d'accueil)"
          defaultChecked={initial?.featured ?? false}
        />
      </div>

      <div className="max-w-xs">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
            Position sur la page d&apos;accueil
          </span>
          <input
            type="number"
            name="homeOrder"
            min={0}
            step={1}
            defaultValue={initial?.homeOrder ?? ""}
            placeholder="Vide = masqué"
            className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
          />
          <span className="block mt-1 text-xs text-silver">
            1, 2, 3… Trié par ordre croissant. Laissez vide pour ne pas afficher.
          </span>
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
        >
          {isPending
            ? "Enregistrement…"
            : mode === "create"
            ? "Créer la destination"
            : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
  rows,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
        {label}
        {required && <span className="text-sunrise-coral"> *</span>}
      </span>
      {type === "textarea" ? (
        <textarea
          name={name}
          required={required}
          rows={rows ?? 3}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
        />
      )}
    </label>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-sand-deep text-ocean focus:ring-ocean"
      />
      <span className="text-sm text-navy">{label}</span>
    </label>
  );
}