"use client";

import { useActionState } from "react";
import { submitContactAction, type ContactFormState } from "@/lib/contact-actions";

export function ContactForm({
  defaultMessage,
  defaultSubject,
  destinationSlug,
  offerSlug,
}: {
  defaultMessage?: string;
  defaultSubject?: string;
  /** If the contact form was reached from /contact?destination=<slug>,
   *  this is forwarded as a hidden input so the action can route the
   *  lead to the matching destination in the admin. */
  destinationSlug?: string;
  /** Same idea for /contact?offer=<slug>. */
  offerSlug?: string;
} = {}) {
  const [state, formAction, isPending] = useActionState<
    ContactFormState,
    FormData
  >(submitContactAction, null);

  if (state?.ok) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-ocean/30 bg-ocean/5 p-6 text-center"
      >
        <h3 className="font-display text-lg font-semibold text-ocean">
          Demande envoyée ✓
        </h3>
        <p className="mt-2 text-sm text-graphite">
          Référence : <span className="font-mono font-medium">{state.reference}</span>
        </p>
        <p className="mt-3 text-sm text-graphite">
          Un conseiller Assirik Tours vous recontacte sous 24h ouvrées.
        </p>
        <a
          href="/contact"
          className="mt-4 inline-block text-xs font-semibold text-ocean hover:text-navy"
        >
          ← Nouvelle demande
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Prénom" name="firstName" required />
        <Field label="Nom" name="lastName" required />
      </div>
      <Field label="Email" name="email" type="email" />
      <Field label="Téléphone" name="phone" type="tel" />
      {defaultSubject ? (
        <input type="hidden" name="subject" value={defaultSubject} />
      ) : null}
      {destinationSlug ? (
        <input type="hidden" name="destinationSlug" value={destinationSlug} />
      ) : null}
      {offerSlug ? (
        <input type="hidden" name="offerSlug" value={offerSlug} />
      ) : null}
      <Field
        label="Votre message"
        name="message"
        type="textarea"
        required
        placeholder="Destination souhaitée, dates, voyageurs, budget indicatif…"
        defaultValue={defaultMessage}
      />

      {state && !state.ok && (
        <p
          role="alert"
          className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-3 py-2 text-sm text-sunrise-coral"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-ocean px-5 py-3 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
      >
        {isPending ? "Envoi…" : "Envoyer ma demande"}
      </button>
      <p className="text-xs text-silver text-center">
        Votre demande sera enregistrée et visible dans notre back-office.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
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
          rows={4}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand-deep/40 px-3 py-2.5 text-sm text-navy placeholder:text-silver focus:border-ocean focus:bg-sand outline-none transition-colors resize-y"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          autoComplete={autocompleteFor(name)}
          className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand-deep/40 px-3 py-2.5 text-sm text-navy placeholder:text-silver focus:border-ocean focus:bg-sand outline-none transition-colors"
        />
      )}
    </label>
  );
}

function autocompleteFor(name: string): string | undefined {
  return {
    firstName: "given-name",
    lastName: "family-name",
    email: "email",
    phone: "tel",
  }[name];
}
