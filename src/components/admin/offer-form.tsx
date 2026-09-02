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
  inclusions: string[];
  exclusions: string[];
  promoPriceFCFA: number | null;
  promoEndsAt: string | null;
  availabilityType: string;
  stock: number | null;
  published: boolean;
  featuredOnHome: boolean;
  homeOrder: number | null;
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
  const [inclusions, setInclusions] = useState<string[]>(initial?.inclusions ?? []);
  const [exclusions, setExclusions] = useState<string[]>(initial?.exclusions ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addItem(setter: (v: (prev: string[]) => string[]) => void) {
    setter((prev) => [...prev, ""]);
  }
  function updateItem(setter: (v: (prev: string[]) => string[]) => void, idx: number, value: string) {
    setter((prev) => prev.map((v, i) => (i === idx ? value : v)));
  }
  function removeItem(setter: (v: (prev: string[]) => string[]) => void, idx: number) {
    setter((prev) => prev.filter((_, i) => i !== idx));
  }

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("coverImageId", coverImageId);
    formData.set("inclusions", inclusions.map((s) => s.trim()).filter(Boolean).join("\n"));
    formData.set("exclusions", exclusions.map((s) => s.trim()).filter(Boolean).join("\n"));

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

      <section className="rounded-xl border border-sand-deep bg-sand p-5 space-y-3">
        <h3 className="font-display text-base font-semibold text-navy">
          Inclusions & exclusions
        </h3>
        <p className="text-xs text-silver">
          Listez ce que l’offre comprend (et ce qu’elle ne comprend pas). Un élément par ligne.
        </p>
        <ListEditor
          label="Inclusions"
          items={inclusions}
          onAdd={() => addItem(setInclusions)}
          onChange={(i, v) => updateItem(setInclusions, i, v)}
          onRemove={(i) => removeItem(setInclusions, i)}
          accent="ocean"
        />
        <ListEditor
          label="Exclusions"
          items={exclusions}
          onAdd={() => addItem(setExclusions)}
          onChange={(i, v) => updateItem(setExclusions, i, v)}
          onRemove={(i) => removeItem(setExclusions, i)}
          accent="sunrise-coral"
        />
      </section>

      <section className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
        <h3 className="font-display text-base font-semibold text-navy">
          Promotion
        </h3>
        <p className="text-xs text-silver">
          Renseignez un prix barré + un prix promo + une date de fin. Si vide, l’offre est
          affichée à son prix normal.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Prix promotionnel (FCFA)"
            name="promoPriceFCFA"
            type="number"
            defaultValue={initial?.promoPriceFCFA ?? ""}
            placeholder="Optionnel"
          />
          <Field
            label="Fin de la promotion"
            name="promoEndsAt"
            type="text"
            defaultValue={initial?.promoEndsAt ?? ""}
            placeholder="AAAA-MM-JJ"
            help="Laissez vide pour une promo sans limite de durée."
          />
        </div>
      </section>

      <section className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
        <h3 className="font-display text-base font-semibold text-navy">
          Disponibilités
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <SelectField
            label="Type de disponibilité"
            name="availabilityType"
            options={[
              ["ON_DEMAND", "Sur demande"],
              ["FIXED_STOCK", "Places limitées"],
            ]}
            defaultValue={initial?.availabilityType ?? "ON_DEMAND"}
          />
          <Field
            label="Places restantes"
            name="stock"
            type="number"
            defaultValue={initial?.stock ?? ""}
            placeholder="Requis si Places limitées"
          />
        </div>
      </section>

      <Toggle name="published" label="Publiée (visible sur le site)" defaultChecked={initial?.published ?? false} />

      <div className="flex flex-wrap gap-6">
        <Toggle
          name="featuredOnHome"
          label="Mettre en avant sur la page d&apos;accueil"
          defaultChecked={initial?.featuredOnHome ?? false}
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
            1, 2, 3… Trié par ordre croissant. N&apos;a d&apos;effet que si &quot;Mettre en avant&quot; est coché.
          </span>
        </label>
      </div>

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
  placeholder,
  help,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  rows?: number;
  placeholder?: string;
  help?: string;
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

function ListEditor({
  label,
  items,
  onAdd,
  onChange,
  onRemove,
  accent,
}: {
  label: string;
  items: string[];
  onAdd: () => void;
  onChange: (idx: number, value: string) => void;
  onRemove: (idx: number) => void;
  accent: "ocean" | "sunrise-coral";
}) {
  const dotColor = accent === "ocean" ? "bg-ocean" : "bg-sunrise-coral";
  return (
    <div>
      <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
        {label}
      </span>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-silver italic">Aucun élément. Cliquez sur « Ajouter ».</p>
        ) : (
          items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={"h-2 w-2 rounded-full " + dotColor} aria-hidden />
              <input
                type="text"
                value={it}
                onChange={(e) => onChange(i, e.target.value)}
                className="flex-1 rounded-lg border border-sand-deep bg-sand px-3 py-1.5 text-sm text-navy focus:border-ocean outline-none"
                placeholder={label + " #" + (i + 1)}
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-xs text-sunrise-coral hover:underline"
              >
                Retirer
              </button>
            </div>
          ))
        )}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 text-xs font-semibold text-ocean hover:text-navy"
      >
        + Ajouter
      </button>
    </div>
  );
}
