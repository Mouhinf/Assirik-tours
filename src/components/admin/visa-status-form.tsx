"use client";

import { useTransition } from "react";
import { updateVisaStatusAction } from "@/lib/visa-actions";

const STATUS_OPTIONS = [
  { value: "BROUILLON", label: "Brouillon" },
  { value: "DOCUMENTS_MANQUANTS", label: "Documents manquants" },
  { value: "EN_TRAITEMENT", label: "En traitement" },
  { value: "ACCEPTE", label: "Accepté" },
  { value: "REFUSE", label: "Refusé" },
] as const;

export function VisaStatusForm({ id, current }: { id: string; current: string }) {
  const [pending, start] = useTransition();
  return (
    <form
      action={(fd) => start(() => updateVisaStatusAction(fd))}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={current}
        disabled={pending}
        className="rounded-md border border-sand-deep bg-sand px-2 py-1 text-xs text-navy"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-ocean px-3 py-1 text-xs font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-50"
      >
        {pending ? "…" : "Mettre à jour"}
      </button>
    </form>
  );
}
