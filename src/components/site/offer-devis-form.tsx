"use client";

import { useActionState } from "react";
import {
  submitOfferDevisAction,
  type OfferDevisState,
} from "@/lib/offer-devis-actions";

type Props = {
  offerSlug: string;
  offerTitle: string;
  defaultStartDate: string | null;
  defaultTravelers: number;
};

export function OfferDevisForm({
  offerSlug,
  offerTitle,
  defaultStartDate,
  defaultTravelers,
}: Props) {
  const [state, formAction, pending] = useActionState<OfferDevisState, FormData>(
    submitOfferDevisAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="offerSlug" value={offerSlug} />

      <p className="rounded-lg bg-sand-deep/40 border border-sand-deep px-4 py-3 text-sm text-graphite">
        Vous demandez un devis pour l&apos;offre{" "}
        <span className="font-semibold text-navy">{offerTitle}</span>. Un conseiller
        vous rappelle sous 24h ouvrées avec une première estimation.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Prénom" name="firstName" required />
        <Field label="Nom" name="lastName" required />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Email" name="email" type="email" />
        <Field label="Téléphone" name="phone" type="tel" placeholder="+221 …" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Date de départ souhaitée"
          name="startDate"
          type="date"
          defaultValue={defaultStartDate ?? ""}
        />
        <Field
          label="Nombre de voyageurs"
          name="travelers"
          type="number"
          min={1}
          defaultValue={defaultTravelers}
        />
      </div>

      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
          Votre projet
        </span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Précisez vos contraintes (dates exactes, aéroport de départ, hébergement, etc.)"
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
        />
      </label>

      {state && !state.ok ? (
        <p
          role="alert"
          className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-3 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
      >
        {pending ? "Envoi en cours…" : "Envoyer ma demande"}
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
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
        {label}
        {required ? <span className="text-sunrise-coral"> *</span> : null}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        min={min}
        className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
      />
    </label>
  );
}
