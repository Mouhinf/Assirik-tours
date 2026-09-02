"use client";

import { useState, useTransition } from "react";
import { saveHomeHeroAction } from "@/lib/homepage-hero-actions";
import { MediaUploader } from "./media-uploader";
import type { HomeHeroProps } from "@/lib/homepage-hero";

type Locale = "fr" | "en";

const LABELS: Record<Locale, {
  pageIntro: string;
  eyebrowLabel: string;
  eyebrowHelp: string;
  titleLabel: string;
  titleAccentLabel: string;
  titleHelp: string;
  descriptionLabel: string;
  primaryCtaLabel: string;
  primaryCtaHrefLabel: string;
  whatsappMessageLabel: string;
  heroImageLabel: string;
  heroImageHelp: string;
  submitLabel: string;
  successLabel: string;
  errorLabel: string;
}> = {
  fr: {
    pageIntro:
      "Édition du bloc hero de la page d'accueil (FR). Les valeurs non remplies tombent sur les défauts pour ne jamais casser la page.",
    eyebrowLabel: "Eyebrow (badge au-dessus du titre)",
    eyebrowHelp: "Court, ex. « Dakar · Sénégal · depuis 2009 ».",
    titleLabel: "Titre — ligne 1",
    titleAccentLabel: "Titre — ligne 2 (en bleu océan)",
    titleHelp: "Le titre complet est composé des deux lignes. Laissez vide pour utiliser les défauts.",
    descriptionLabel: "Sous-titre / description",
    primaryCtaLabel: "Libellé du bouton principal",
    primaryCtaHrefLabel: "Lien du bouton principal",
    whatsappMessageLabel: "Message WhatsApp pré-rempli (CTA secondaire)",
    heroImageLabel: "Image de fond",
    heroImageHelp: "Paysage 1920×1080 recommandé. Optionnel — un dégradé par défaut s'affiche si vide.",
    submitLabel: "Enregistrer",
    successLabel: "Modifications enregistrées ✓",
    errorLabel: "Erreur",
  },
  en: {
    pageIntro:
      "Homepage hero block editor (EN). Missing values fall back to safe defaults so the page never breaks.",
    eyebrowLabel: "Eyebrow (badge above the title)",
    eyebrowHelp: "Short, e.g. \"Dakar · Senegal · since 2009\".",
    titleLabel: "Title — line 1",
    titleAccentLabel: "Title — line 2 (ocean blue)",
    titleHelp: "The full title is composed of both lines. Leave blank to use defaults.",
    descriptionLabel: "Subtitle / description",
    primaryCtaLabel: "Primary CTA label",
    primaryCtaHrefLabel: "Primary CTA link",
    whatsappMessageLabel: "Pre-filled WhatsApp message (secondary CTA)",
    heroImageLabel: "Background image",
    heroImageHelp: "Landscape 1920×1080 recommended. Optional — a default gradient shows when empty.",
    submitLabel: "Save",
    successLabel: "Saved ✓",
    errorLabel: "Error",
  },
};

export function HomepageHeroForm({
  locale,
  initial,
}: {
  locale: Locale;
  initial: HomeHeroProps;
}) {
  const t = LABELS[locale];
  const [heroImageId, setHeroImageId] = useState(initial.heroImageId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    formData.set("locale", locale);
    formData.set("heroImageId", heroImageId);

    startTransition(async () => {
      const res = await saveHomeHeroAction(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.ok) {
        setSuccess(true);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6 max-w-3xl">
      <p className="rounded-lg bg-sand-deep/50 border border-sand-deep px-4 py-3 text-sm text-graphite">
        {t.pageIntro}
      </p>

      <Field
        label={t.eyebrowLabel}
        name="eyebrow"
        defaultValue={initial.eyebrow}
        help={t.eyebrowHelp}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label={t.titleLabel}
          name="title"
          defaultValue={initial.title}
          required
        />
        <Field
          label={t.titleAccentLabel}
          name="titleAccent"
          defaultValue={initial.titleAccent}
        />
      </div>
      <p className="-mt-4 text-xs text-silver">{t.titleHelp}</p>

      <Field
        label={t.descriptionLabel}
        name="description"
        type="textarea"
        rows={4}
        defaultValue={initial.description}
        required
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label={t.primaryCtaLabel}
          name="primaryCtaLabel"
          defaultValue={initial.primaryCtaLabel}
          required
        />
        <Field
          label={t.primaryCtaHrefLabel}
          name="primaryCtaHref"
          defaultValue={initial.primaryCtaHref}
          placeholder="/destinations ou URL absolue"
        />
      </div>

      <Field
        label={t.whatsappMessageLabel}
        name="whatsappMessage"
        type="textarea"
        rows={2}
        defaultValue={initial.whatsappMessage}
      />

      <section className="rounded-xl border border-sand-deep bg-sand p-5">
        <h3 className="font-display text-base font-semibold text-navy">
          {t.heroImageLabel}
        </h3>
        <p className="mt-1 text-xs text-silver">{t.heroImageHelp}</p>
        <div className="mt-4">
          {heroImageId ? (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_240,h_160,c_fill/${heroImageId}`}
                alt=""
                className="h-24 w-40 object-cover rounded-lg border border-sand-deep"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-graphite truncate">
                  {heroImageId}
                </p>
                <button
                  type="button"
                  onClick={() => setHeroImageId("")}
                  className="mt-1 text-xs text-sunrise-coral hover:underline"
                >
                  Retirer
                </button>
              </div>
            </div>
          ) : (
            <MediaUploader
              folder="assirik-tours/home"
              onUploaded={(asset) => setHeroImageId(asset.publicId)}
            />
          )}
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral"
        >
          {t.errorLabel} : {error}
        </p>
      )}
      {success && !error && (
        <p
          role="status"
          className="rounded-lg bg-sky/15 border border-sky/30 px-4 py-3 text-sm text-navy"
        >
          {t.successLabel}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
        >
          {isPending ? "…" : t.submitLabel}
        </button>
      </div>
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
  rows,
  help,
}: {
  label: string;
  name: string;
  type?: "text" | "textarea";
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  help?: string;
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
          rows={rows ?? 3}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
        />
      ) : (
        <input
          type="text"
          name={name}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
        />
      )}
      {help && <span className="block mt-1 text-xs text-silver">{help}</span>}
    </label>
  );
}
