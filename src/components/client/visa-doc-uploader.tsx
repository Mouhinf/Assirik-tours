"use client";

import { useState, useTransition } from "react";
import { uploadClientVisaDocAction } from "@/lib/client-visa-actions";

export function VisaDocUploader({ id, docName }: { id: string; docName: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <form
      className="mt-3"
      action={(fd) =>
        start(async () => {
          setError(null);
          setSuccess(false);
          const r = await uploadClientVisaDocAction(fd);
          if (r?.error) setError(r.error);
          else setSuccess(true);
        })
      }
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="docName" value={docName} />
      <input
        type="file"
        name="file"
        accept=".pdf,.jpg,.jpeg,.png"
        required
        disabled={pending}
        className="text-xs file:mr-3 file:rounded-full file:border-0 file:bg-ocean file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-sand hover:file:bg-navy"
      />
      <button
        type="submit"
        disabled={pending}
        className="ml-2 rounded-full bg-ocean px-3 py-1.5 text-xs font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-50"
      >
        {pending ? "Envoi…" : "Uploader"}
      </button>
      {error ? <p className="mt-1 text-xs text-sunrise-coral">{error}</p> : null}
      {success ? <p className="mt-1 text-xs text-emerald-700">Téléversé ✓</p> : null}
    </form>
  );
}
