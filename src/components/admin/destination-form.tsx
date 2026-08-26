"use client";

import { useState, useTransition } from "react";
import { saveDestinationAction } from "@/lib/destination-actions";
import { MediaUploader } from "./media-uploader";

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
};

const REGIONS = [
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

export function DestinationForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Initial;
}) {
  const [heroImageId, setHeroImageId] = useState(initial?.heroImageId ?? "");
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("heroImageId", heroImageId);
    formData.set("gallery", gallery.join("\n"));

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

      <div>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
            Région
          </span>
          <select
            name="region"
            defaultValue={initial?.region ?? "DAKAR"}
            className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
          >
            {REGIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
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
          Format paysage recommandé. Affichée sur la page d'accueil et en haut
          de la fiche destination.
        </p>

        <div className="mt-4">
          {heroImageId ? (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_240,h_160,c_fill/${heroImageId}`}
                alt=""
                className="h-24 w-40 object-cover rounded-lg border border-sand-deep"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-graphite truncate">
                  {heroImageId}
                </p>
                <button
                  type="button"
                  onClick={() => setHeroImageId("")}
                  className="mt-1 text-xs text-sunrise-coral hover:underline"
                >
                  Retirer
                </button>
              </div>
            </div>
          ) : (
            <MediaUploader
              folder="assirik-tours/destinations"
              onUploaded={(asset) => setHeroImageId(asset.publicId)}
            />
          )}
        </div>
      </section>

      {/* Galerie */}
      <section className="rounded-xl border border-sand-deep bg-sand p-5">
        <h3 className="font-display text-base font-semibold text-navy">
          Galerie (optionnel)
        </h3>
        <p className="mt-1 text-xs text-silver">
          Une image par ligne — copiez les public_id depuis la médiathèque.
        </p>
        <textarea
          rows={5}
          value={gallery.join("\n")}
          onChange={(e) =>
            setGallery(
              e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          className="mt-3 w-full rounded-lg border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm font-mono text-navy focus:border-ocean focus:bg-sand outline-none"
          placeholder="assirik-tours/destinations/lac-rose-1"
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