"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitTestimonialAction, type SubmitTestimonialState } from "@/lib/testimonial-submit-actions";

type TripOption = {
  slug: string;
  title: string;
  kind: "destination" | "offer";
};

type Props = {
  locale: "fr" | "en";
  defaultTripSlug?: string;
  defaultTripTitle?: string;
  trips: TripOption[];
};

const COPY = {
  fr: {
    title: "Partager votre expérience",
    subtitle:
      "Votre témoignage aide d'autres voyageurs à se décider. Il sera relu par notre équipe avant publication.",
    successTitle: "Merci pour votre témoignage ✓",
    successBody:
      "Référence : {ref}. Notre équipe le relira sous 48h ouvrées. S'il est sélectionné, il apparaîtra sur cette page.",
    successAnother: "Soumettre un autre témoignage",
    nameLabel: "Votre prénom et nom",
    namePh: "Ex. Aïssatou Diop",
    cityLabel: "Ville (optionnel)",
    cityPh: "Dakar, Paris, Accra…",
    ratingLabel: "Note",
    contentLabel: "Votre témoignage",
    contentPh: "Racontez votre voyage en quelques phrases : ce qui a bien fonctionné, ce qui vous a marqué, ce que vous recommanderiez.",
    tripLabel: "Voyage concerné (optionnel)",
    tripNone: "— Aucun en particulier —",
    dateTripLabel: "Date du voyage (optionnel)",
    submit: "Envoyer mon témoignage",
    submitting: "Envoi en cours…",
    privacy:
      "En soumettant ce formulaire, vous acceptez que votre témoignage (prénom, nom, ville et texte) soit affiché sur le site après validation par notre équipe. Pas d'email collecté.",
    requiredHint: "Champs requis : prénom/nom et témoignage.",
    ratingValues: ["", "1 étoile", "2 étoiles", "3 étoiles", "4 étoiles", "5 étoiles"],
    ratingShort: ["—", "★", "★★", "★★★", "★★★★", "★★★★★"],
  },
  en: {
    title: "Share your experience",
    subtitle:
      "Your review helps other travellers decide. Our team reviews every submission before it goes live.",
    successTitle: "Thanks for your review ✓",
    successBody:
      "Reference: {ref}. Our team will review it within 48 working hours. If approved, it will appear on this page.",
    successAnother: "Submit another review",
    nameLabel: "First and last name",
    namePh: "e.g. Jane Doe",
    cityLabel: "City (optional)",
    cityPh: "Dakar, Paris, Accra…",
    ratingLabel: "Rating",
    contentLabel: "Your review",
    contentPh: "Tell us about your trip: what worked, what stood out, what you'd recommend.",
    tripLabel: "Trip (optional)",
    tripNone: "— None in particular —",
    dateTripLabel: "Trip date (optional)",
    submit: "Send my review",
    submitting: "Sending…",
    privacy:
      "By submitting this form you agree to your review (name, city, text) being shown on the site after moderation. No email is collected.",
    requiredHint: "Required fields: name and review.",
    ratingValues: ["", "1 star", "2 stars", "3 stars", "4 stars", "5 stars"],
    ratingShort: ["—", "★", "★★", "★★★", "★★★★", "★★★★★"],
  },
} as const;

export function TestimonialSubmitForm({ locale, defaultTripSlug, defaultTripTitle, trips }: Props) {
  const t = COPY[locale];
  const [state, formAction, isPending] = useActionState<SubmitTestimonialState, FormData>(
    submitTestimonialAction,
    null,
  );
  const [rating, setRating] = useState<number>(5);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-ocean/30 bg-ocean/5 p-8 text-center">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-ocean">
          Assirik Tours
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
          {t.successTitle}
        </h2>
        <p className="mt-3 text-sm text-graphite">
          {t.successBody.replace("{ref}", state.reference)}
        </p>
        <Link
          href="/temoignages"
          className="mt-5 inline-flex items-center rounded-full border border-sand-deep bg-sand px-5 py-2.5 text-sm font-semibold text-graphite transition-colors hover:text-navy"
        >
          ← {locale === "en" ? "Back to testimonials" : "Voir les témoignages"}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <header>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-navy text-balance">
          {t.title}
        </h2>
        <p className="mt-2 text-sm text-graphite">{t.subtitle}</p>
      </header>

      {state && state.ok === false ? (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
          {state.error}
        </p>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t.nameLabel} name="author" required placeholder={t.namePh} />
        <Field label={t.cityLabel} name="city" placeholder={t.cityPh} />
      </div>

      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
          {t.ratingLabel}
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={t.ratingValues[n]}
              aria-pressed={rating === n}
              className={
                "h-10 w-10 rounded-md transition-colors " +
                (n <= rating
                  ? "bg-sunrise-orange/15 text-sunrise-coral"
                  : "bg-sand-deep/40 text-silver hover:bg-sand-deep")
              }
            >
              <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
              </svg>
            </button>
          ))}
          <span className="ml-3 text-sm font-semibold text-ocean" aria-hidden>
            {t.ratingShort[rating]}
          </span>
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>

      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
          {t.contentLabel} <span className="text-sunrise-coral">*</span>
        </span>
        <textarea
          name="content"
          required
          rows={6}
          minLength={20}
          maxLength={2000}
          placeholder={t.contentPh}
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
        />
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
            {t.tripLabel}
          </span>
          <select
            name="tripSlug"
            defaultValue={defaultTripSlug ?? ""}
            className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
          >
            <option value="">{t.tripNone}</option>
            {trips.map((trip) => (
              <option key={`${trip.kind}-${trip.slug}`} value={trip.slug}>
                {trip.kind === "destination"
                  ? locale === "en"
                    ? `📍 ${trip.title}`
                    : `📍 ${trip.title}`
                  : `🧳 ${trip.title}`}
              </option>
            ))}
          </select>
          {defaultTripTitle ? (
            <p className="mt-1 text-xs text-silver">
              {locale === "en" ? "Pre-filled with" : "Pré-rempli avec"} :{" "}
              <span className="font-semibold text-graphite">{defaultTripTitle}</span>
            </p>
          ) : null}
        </label>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
            {t.dateTripLabel}
          </span>
          <input
            type="date"
            name="dateTrip"
            max={new Date().toISOString().slice(0, 10)}
            className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
          />
        </label>
      </div>

      <p className="text-xs text-silver">{t.privacy}</p>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-sand-deep">
        <p className="text-xs text-graphite">{t.requiredHint}</p>
        <button
          type="submit"
          disabled={isPending}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
        >
          {isPending ? t.submitting : t.submit}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "email" | "tel";
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
        {label}
        {required && <span className="text-sunrise-coral"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
      />
    </label>
  );
}
