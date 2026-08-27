"use client";

import { useActionState, useState } from "react";
import { createVisaDossierAction, VISA_DESTINATIONS, REQUIRED_DOCS_BY_DESTINATION, type VisaFormState } from "@/lib/visa-actions";

export function VisaCreateCard() {
  const [state, formAction, isPending] = useActionState<VisaFormState, FormData>(
    createVisaDossierAction,
    null,
  );
  const [destination, setDestination] = useState<string>("Schengen");
  const docs = REQUIRED_DOCS_BY_DESTINATION[destination] ?? [];

  return (
    <div className="rounded-xl bg-sand border border-sand-deep p-6 space-y-4 h-fit">
      <h2 className="font-display text-base font-semibold text-navy">Nouveau dossier</h2>

      {state?.ok ? (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm">
          <p className="font-semibold text-emerald-900">Dossier créé</p>
          <p className="text-emerald-800/85 mt-1">Référence : <span className="font-mono">{state.reference}</span></p>
          <button type="button" onClick={() => location.reload()} className="mt-2 text-xs font-semibold text-emerald-900 underline">
            Créer un autre dossier
          </button>
        </div>
      ) : null}

      {state && !state.ok ? (
        <p className="rounded-md bg-sunrise-coral/10 border border-sunrise-coral/30 px-3 py-2 text-sm text-sunrise-coral">
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Prénom client" name="firstName" required />
          <Field label="Nom client" name="lastName" required />
        </div>
        <Field label="Email client" name="clientEmail" type="email" required />
        <Field label="Téléphone" name="phone" type="tel" />

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">Destination</span>
          <select
            name="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
          >
            {VISA_DESTINATIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Type de visa" name="visaType" placeholder="court séjour" />
          <Field label="Frais (FCFA)" name="feeFCFA" type="number" defaultValue="0" />
        </div>
        <Field label="Échéance consulat" name="deadline" type="date" />

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">Notes</span>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
            placeholder="Contexte, RDV consulat, particularités…"
          />
        </label>

        {docs.length > 0 ? (
          <details className="rounded-md bg-sand-deep/30 p-3 text-xs">
            <summary className="cursor-pointer font-semibold text-navy">Pièces qui seront demandées ({docs.length})</summary>
            <ul className="mt-2 space-y-1 text-graphite">
              {docs.map((d) => <li key={d}>· {d}</li>)}
            </ul>
          </details>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-ocean px-4 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-50"
        >
          {isPending ? "Création…" : "Créer le dossier"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label, name, type = "text", required, placeholder, defaultValue,
}: {
  label: string; name: string; type?: string; required?: boolean;
  placeholder?: string; defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
        {label}{required ? " *" : ""}
      </span>
      <input
        name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue}
        className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy placeholder:text-silver"
      />
    </label>
  );
}
