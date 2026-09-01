"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestFlightQuoteAction } from "@/lib/flight-actions";

export function QuoteForm({
  searchId,
  offerId,
  defaultEmail,
}: {
  searchId: string;
  offerId: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.append("searchId", searchId);
    fd.append("offerId", offerId);
    fd.append("name", name);
    fd.append("email", email);
    fd.append("phone", phone);
    fd.append("message", message);
    startTransition(async () => {
      const res = await requestFlightQuoteAction(fd);
      if ("error" in res) {
        setError(res.error ?? "Erreur inconnue");
        return;
      }
      setSent(true);
      router.refresh();
    });
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-300/40 bg-emerald-50 p-6">
        <h3 className="font-display text-base font-semibold text-emerald-800">
          ✓ Demande envoyée
        </h3>
        <p className="mt-2 text-sm text-emerald-900/80">
          Un conseiller vous contacte sous 24h ouvrées pour finaliser votre réservation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-sand-deep bg-sand p-5 space-y-4">
      <h3 className="font-display text-base font-semibold text-navy">
        Demander un devis pour ce vol
      </h3>

      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
          Nom complet *
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy outline-none focus:border-ocean"
        />
      </label>

      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
          Email *
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy outline-none focus:border-ocean"
        />
      </label>

      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
          Téléphone *
        </span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          minLength={5}
          placeholder="+221 …"
          className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy outline-none focus:border-ocean"
        />
      </label>

      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
          Message (optionnel)
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Bagages, préférences horaires, etc."
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy outline-none focus:border-ocean"
        />
      </label>

      {error ? (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Envoyer la demande"}
      </button>

      <p className="text-xs text-silver">
        En envoyant, vous acceptez qu&apos;un conseiller d&apos;Assirik Tours vous contacte par email ou téléphone.
      </p>
    </form>
  );
}
