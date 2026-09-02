"use client";

import { useState, useTransition } from "react";
import { saveFlightConfigAction } from "@/lib/flight-config-actions";

export function FlightConfigForm({
  initialNotes,
  initialContactEmail,
  initialContactPhone,
}: {
  initialNotes: string;
  initialContactEmail: string;
  initialContactPhone: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [contactEmail, setContactEmail] = useState(initialContactEmail);
  const [contactPhone, setContactPhone] = useState(initialContactPhone);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveFlightConfigAction(fd);
      if ((res as { ok?: boolean })?.ok) setSaved(true);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
          Notes internes équipe
        </span>
        <textarea
          name="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex : priorité aux vols directs, compagnies à éviter en basse saison, etc."
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy placeholder:text-silver focus:border-ocean outline-none transition-colors"
        />
        <span className="mt-1 block text-[0.7rem] text-silver">
          Visible uniquement depuis l&apos;admin. Pas affiché sur le site public.
        </span>
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
            Email de contact (override)
          </span>
          <input
            type="email"
            name="contactEmail"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="vols@assirik.local"
            className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy placeholder:text-silver focus:border-ocean outline-none transition-colors"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
            Téléphone (override)
          </span>
          <input
            type="tel"
            name="contactPhone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+221 …"
            className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy placeholder:text-silver focus:border-ocean outline-none transition-colors"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
        >
          {pending ? "Enregistrement…" : "Enregistrer la config"}
        </button>
        {saved ? (
          <span className="text-xs font-semibold text-emerald-700" role="status">
            ✓ Enregistré
          </span>
        ) : null}
      </div>
    </form>
  );
}
