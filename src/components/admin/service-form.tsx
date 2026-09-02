"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { saveServiceAction } from "@/lib/service-actions";
import { MediaUploader } from "./media-uploader";

type Initial = {
  id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  icon: string;
  imageId: string;
  priceFromFCFA: number | null;
  priceNote: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  ctaLabel: string;
  ctaHref: string;
};

const CATEGORIES: [string, string][] = [
  ["VISA", "Assistance visa"],
  ["HOTELS", "Hôtels"],
  ["CHAUFFEUR", "Véhicule avec chauffeur"],
  ["ASSURANCE", "Assurance voyage"],
  ["TRANSFERT", "Transferts aéroport"],
  ["ENTREPRISE", "Sur-mesure entreprise"],
  ["AUTRE", "Autre"],
];

const ICONS: [string, string][] = [
  ["stamp", "Tampon (visa)"],
  ["hotel", "Lit (hôtels)"],
  ["car", "Voiture (chauffeur)"],
  ["shield", "Bouclier (assurance)"],
  ["transfer", "Avion (transferts)"],
  ["briefcase", "Mallette (entreprise)"],
  ["compass", "Boussole (sur-mesure)"],
  ["users", "Utilisateurs"],
  ["card", "Carte bancaire"],
];

export function ServiceForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Initial;
}) {
  const [imageId, setImageId] = useState(initial?.imageId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("imageId", imageId);

    startTransition(async () => {
      const res = await saveServiceAction(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-6 max-w-3xl">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <Field
        label="Titre du service"
        name="title"
        required
        placeholder="Ex : Hôtel 4★ avec petit-déjeuner"
        defaultValue={initial?.title}
      />

      <Field
        label="Slug (URL)"
        name="slug"
        placeholder="laisser vide pour générer depuis le titre"
        defaultValue={initial?.slug}
        help="Utilisé dans /contact?service=<slug> et pour les liens profonds."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <SelectField
          label="Catégorie"
          name="category"
          options={CATEGORIES}
          defaultValue={initial?.category ?? "AUTRE"}
        />
        <SelectField
          label="Icône"
          name="icon"
          options={[["", "— aucune —"], ...ICONS]}
          defaultValue={initial?.icon ?? ""}
        />
      </div>

      <Field
        label="Description courte"
        name="shortDescription"
        required
        placeholder="Une phrase qui résume le service (affichée sur la carte)."
        defaultValue={initial?.shortDescription}
        help="Max 280 caractères — affichée sur la page publique."
      />

      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
          Description longue (optionnel)
        </span>
        <textarea
          name="longDescription"
          rows={4}
          defaultValue={initial?.longDescription ?? ""}
          placeholder="Détails, inclusions, conditions… Affiché uniquement sur le site si vous le souhaitez (pas utilisé pour le moment)."
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy placeholder:text-silver focus:border-ocean outline-none"
        />
      </label>

      <section className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
        <h3 className="font-display text-base font-semibold text-navy">
          Tarif indicatif
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Prix « à partir de » (FCFA)"
            name="priceFromFCFA"
            type="number"
            placeholder="Optionnel"
            defaultValue={initial?.priceFromFCFA ?? ""}
            help="Laissez vide pour afficher « Sur devis »."
          />
          <Field
            label="Unité du tarif"
            name="priceNote"
            placeholder="par nuit, par course, par voyageur…"
            defaultValue={initial?.priceNote ?? ""}
          />
        </div>
      </section>

      <section className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
        <h3 className="font-display text-base font-semibold text-navy">
          Visuel
        </h3>
        <p className="text-xs text-silver">
          Image par défaut affichée sur la fiche publique (à venir). Utilisez le même
          outil que pour les destinations.
        </p>
        <div className="mt-4">
          {imageId ? (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_240,h_160,c_fill/${imageId}`}
                alt=""
                className="h-24 w-40 object-cover rounded-lg border border-sand-deep"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-graphite truncate">
                  {imageId}
                </p>
                <button
                  type="button"
                  onClick={() => setImageId("")}
                  className="mt-1 text-xs text-sunrise-coral hover:underline"
                >
                  Retirer
                </button>
              </div>
            </div>
          ) : (
            <MediaUploader
              folder="assirik-tours/services"
              onUploaded={(asset) => setImageId(asset.publicId)}
            />
          )}
        </div>
      </section>

      <section className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
        <h3 className="font-display text-base font-semibold text-navy">
          Call-to-action
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Texte du bouton"
            name="ctaLabel"
            placeholder="Demander un devis"
            defaultValue={initial?.ctaLabel ?? ""}
          />
          <Field
            label="Lien du bouton"
            name="ctaHref"
            placeholder="/contact?service=<slug>"
            defaultValue={initial?.ctaHref ?? ""}
          />
        </div>
        <p className="text-xs text-silver">
          Si vide, le bouton envoie vers <code className="font-mono">/contact?service=&lt;slug&gt;</code> avec le libellé « Demander un devis ».
        </p>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Ordre d'affichage"
          name="order"
          type="number"
          defaultValue={initial?.order ?? 0}
          help="Plus la valeur est petite, plus le service apparaît tôt."
        />
        <div className="flex flex-col gap-2 pt-6">
          <Toggle
            name="isActive"
            label="Publié (visible sur le site)"
            defaultChecked={initial?.isActive ?? true}
          />
          <Toggle
            name="isFeatured"
            label="Mettre en avant (badge « Phare »)"
            defaultChecked={initial?.isFeatured ?? false}
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
        >
          {isPending
            ? "Enregistrement…"
            : mode === "create"
              ? "Créer le service"
              : "Enregistrer les modifications"}
        </button>
        <Link
          href="/admin/services"
          className="text-sm font-semibold text-graphite hover:text-navy"
        >
          Annuler
        </Link>
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
  help,
  rows,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  help?: string;
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
          defaultValue={defaultValue as string | undefined}
          placeholder={placeholder}
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy placeholder:text-silver focus:border-ocean outline-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy placeholder:text-silver focus:border-ocean outline-none"
        />
      )}
      {help ? (
        <span className="mt-1 block text-[0.7rem] text-silver">{help}</span>
      ) : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: [string, string][];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
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
