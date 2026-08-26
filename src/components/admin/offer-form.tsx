"use client";

import { useState, useTransition } from "react";
import { saveOfferAction } from "@/lib/offer-actions";
import { MediaUploader } from "./media-uploader";

type Destination = { id: string; title: string };

type Initial = {
  id?: string;
  title: string;
  slug: string;
  kind: string;
  summary: string;
  description: string;
  priceFCFA: number;
  durationDays: number | null;
  maxGuests: number | null;
  destinationId: string;
  coverImageId: string;
  published: boolean;
};

const KINDS: [string, string][] = [
  ["SEJOUR", "Séjour"],
  ["CIRCUIT", "Circuit"],
  ["SUR_MESURE", "Sur mesure"],
  ["OMRA", "Omra"],
  ["HAJJ", "Hajj"],
  ["BILLETERIE", "Billetterie"],
];

export function OfferForm({
  mode,
  initial,
  destinations,
}: {
  mode: "create" | "edit";
  initial?: Initial;
  destinations: Destination[];
}) {
  const [coverImageId, setCoverImageId] = useState(initial?.coverImageId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("coverImageId", coverImageId);

    startTransition(async () => {
      const res = await saveOfferAction(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-6 max-w-3xl">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <Field label="Titre" name="title" required defaultValue={initial?.title} />

      <div className="grid sm:grid-cols-2 gap-4">
        <SelectField
          label="Type d'offre"
          name="kind"
          options={KINDS}
          defaultValue={initial?.kind ?? "SEJOUR"}
        />
        <div>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Destination
            </span>
            <select
              name="destinationId"
              defaultValue={initial?.destinationId ?? ""}
              required
              className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
            >
              <option value="">— Choisir —</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
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
        rows={6}
        defaultValue={initial?.description}
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <Field
          label="Prix (FCFA)"
          name="priceFCFA"
          type="number"
          required
          defaultValue={initial?.priceFCFA ?? 0}
        />
        <Field
          label="Durée (jours)"
          name="durationDays"
          type="number"
          defaultValue={initial?.durationDays ?? undefined}
        />
        <Field
          label="Max voyageurs"
          name="maxGuests"
          type="number"
          defaultValue={initial?.maxGuests ?? undefined}
        />
      </div>

      <section className="rounded-xl border border-sand-deep bg-sand p-5">
        <h3 className="font-display text-base font-semibold text-navy">
          Image de couverture
        </h3>
        <p className="mt-1 text-xs text-silver">Format paysage recommandé.</p>
        <div className="mt-4">
          {coverImageId ? (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_240,h_160,c_fill/${coverImageId}`}
                alt=""
                className="h-24 w-40 object-cover rounded-lg border border-sand-deep"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-graphite truncate">
                  {coverImageId}
                </p>
                <button
                  type="button"
                  onClick={() => setCoverImageId("")}
                  className="mt-1 text-xs text-sunrise-coral hover:underline"
                >
                  Retirer
                </button>
              </div>
            </div>
          ) : (
            <MediaUploader
              folder="assirik-tours/offers"
              onUploaded={(asset) => setCoverImageId(asset.publicId)}
            />
          )}
        </div>
      </section>

      <Toggle label="Publiée (visible sur le site)" defaultChecked={initial?.published ?? false} />

      {error && (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
      >
        {isPending
          ? "Enregistrement…"
          : mode === "create"
          ? "Créer l'offre"
          : "Enregistrer"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  rows,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
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
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          defaultValue={defaultValue}
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
        />
      )}
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
  options: Array<[string, string]>;
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
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        name="published"
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-sand-deep text-ocean focus:ring-ocean"
      />
      <span className="text-sm text-navy">{label}</span>
    </label>
  );
}