"use client";

import { useState, useTransition } from "react";
import { saveRegionAction } from "@/lib/region-actions";
import { REGION_LABELS_FR } from "@/lib/regions";

type Initial = {
  id?: string;
  slug: string;
  labelFr: string;
  labelEn: string;
  group: "senegal" | "international";
  order: number;
  isActive: boolean;
  legacyEnumKeys: string[];
};

const LEGACY_KEYS = Object.keys(REGION_LABELS_FR);

export function RegionForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Initial;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [legacyKeys, setLegacyKeys] = useState<string[]>(initial?.legacyEnumKeys ?? []);

  function toggleKey(key: string) {
    setLegacyKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("legacyEnumKeys", legacyKeys.join(","));
    startTransition(async () => {
      try {
        await saveRegionAction(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inconnue.");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6 max-w-3xl">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <Field
        label="Libellé (FR)"
        name="labelFr"
        required
        defaultValue={initial?.labelFr}
      />
      <Field
        label="Libellé (EN)"
        name="labelEn"
        defaultValue={initial?.labelEn}
        placeholder="Optionnel — repris du libellé FR si vide"
      />

      <Field
        label="Slug (URL interne)"
        name="slug"
        defaultValue={initial?.slug}
        placeholder="laisser vide pour générer depuis le libellé"
        help="Utilisé comme identifiant stable. Modifiable, mais ne change pas les filtres actifs."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Groupe
            </span>
            <select
              name="group"
              defaultValue={initial?.group ?? "international"}
              className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
            >
              <option value="senegal">Sénégal</option>
              <option value="international">International</option>
            </select>
          </label>
        </div>
        <Field
          label="Ordre d'affichage"
          name="order"
          type="number"
          defaultValue={initial?.order ?? 0}
          help="Plus la valeur est petite, plus la région apparaît haut dans le filtre."
        />
      </div>

      <fieldset className="rounded-xl border border-sand-deep bg-sand p-5">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-graphite">
          Régions héritées couvertes
        </legend>
        <p className="mb-3 text-xs text-silver">
          Cochez les régions de l&apos;ancien enum que cette Région doit également
          matcher (filtre rétro-compatible). Laissez vide pour une région 100 %
          personnalisée.
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {LEGACY_KEYS.map((k) => (
            <label
              key={k}
              className="inline-flex items-center gap-2 rounded-lg bg-sand-deep/40 px-3 py-1.5 cursor-pointer hover:bg-sand-deep"
            >
              <input
                type="checkbox"
                checked={legacyKeys.includes(k)}
                onChange={() => toggleKey(k)}
                className="h-4 w-4 rounded border-sand-deep text-ocean focus:ring-ocean"
              />
              <span className="text-sm text-navy">
                {REGION_LABELS_FR[k]}{" "}
                <span className="text-xs text-silver font-mono">{k}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Toggle
        name="isActive"
        label="Active (visible dans le filtre du site public)"
        defaultChecked={initial?.isActive ?? true}
      />

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral"
        >
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
          ? "Créer la région"
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
  placeholder,
  help,
}: {
  label: string;
  name: string;
  type?: "text" | "number";
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
        {label}
        {required && <span className="text-sunrise-coral"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
      />
      {help && <span className="block mt-1 text-xs text-silver">{help}</span>}
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
