"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateReservationNotesAction } from "@/lib/reservation-actions";

export function ReservationNotesDialog({
  id,
  notes,
  reference,
}: {
  id: string;
  notes: string;
  reference: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(notes);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function save() {
    setError(null);
    const fd = new FormData();
    fd.append("id", id);
    fd.append("notes", value);
    startTransition(async () => {
      const res = await updateReservationNotesAction(null, fd);
      if (res && !res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  const truncated = notes.length > 80 ? notes.slice(0, 80) + "…" : notes;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 inline-flex items-center gap-1 text-xs text-ocean hover:text-navy"
      >
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        Note interne
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-notes-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl bg-sand p-6 shadow-2xl">
            <header className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-ocean">
                  Note interne
                </p>
                <h3 id="reservation-notes-title" className="mt-1 font-display text-xl font-semibold text-navy">
                  {reference}
                </h3>
                <p className="mt-1 text-xs text-graphite">
                  Visible par l&apos;équipe interne uniquement. Pas envoyée au client.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="text-graphite hover:text-navy"
              >
                ✕
              </button>
            </header>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value.slice(0, 4000))}
              rows={10}
              placeholder="Appel du 12/03 : client OK pour partir le 15/04. A envoyé son acte de naissance par mail. Rappeler jeudi matin pour confirmation acompte."
              className="mt-4 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
            />
            {error ? (
              <p className="mt-2 text-xs text-sunrise-coral">{error}</p>
            ) : null}
            <footer className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 items-center rounded-md border border-sand-deep bg-sand px-4 py-2 text-sm font-semibold text-graphite hover:text-navy"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className="inline-flex min-h-11 items-center rounded-md bg-ocean px-5 py-2 text-sm font-semibold text-sand hover:bg-navy disabled:opacity-60"
              >
                {pending ? "Enregistrement…" : "Enregistrer la note"}
              </button>
            </footer>
            <p className="mt-3 text-[0.65rem] text-silver">
              Aperçu actuel : {truncated}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
