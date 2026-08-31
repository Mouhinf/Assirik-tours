"use client";

import { useState, useTransition } from "react";
import { saveTestimonialAction } from "@/lib/testimonial-actions";
import { MediaUploader } from "./media-uploader";

type Initial = {
  id?: string;
  author: string;
  city: string | null;
  content: string;
  rating: number;
  tripSlug: string | null;
  locale: "fr" | "en";
  avatarId: string | null;
  dateTrip: string | null; // yyyy-MM-dd for <input type=date>
  order: number;
  approved: boolean;
};

const SLUG_SUGGESTIONS = [
  "saly-portudal",
  "goree",
  "casamance",
  "lac-rose",
  "lompoul",
  "saint-louis",
  "omra",
  "maroc",
  "turquie",
  "dubai",
];

export function TestimonialForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Initial;
}) {
  const [avatarId, setAvatarId] = useState(initial?.avatarId ?? "");
  const [rating, setRating] = useState<number>(initial?.rating ?? 5);
  const [approved, setApproved] = useState<boolean>(initial?.approved ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("avatarId", avatarId);
    formData.set("rating", String(rating));
    formData.set("approved", approved ? "on" : "");
    startTransition(async () => {
      const res = await saveTestimonialAction(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-6 max-w-3xl">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      {/* Identité */}
      <section className="rounded-xl border border-sand-deep bg-sand p-5 space-y-5">
        <h3 className="font-display text-base font-semibold text-navy">Identité</h3>

        <Field label="Auteur" name="author" required defaultValue={initial?.author ?? ""} />
        <Field
          label="Ville (optionnel)"
          name="city"
          defaultValue={initial?.city ?? ""}
          placeholder="Dakar, Paris, Accra…"
        />
      </section>

      {/* Témoignage */}
      <section className="rounded-xl border border-sand-deep bg-sand p-5 space-y-5">
        <h3 className="font-display text-base font-semibold text-navy">Témoignage</h3>

        <div>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Contenu <span className="text-sunrise-coral">*</span>
            </span>
            <textarea
              name="content"
              required
              rows={6}
              maxLength={2000}
              defaultValue={initial?.content ?? ""}
              placeholder="Racontez le voyage, ce qui a marqué le client…"
              className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
            />
          </label>
          <p className="mt-1 text-xs text-silver">20 à 2000 caractères — affiché tel quel sur le site.</p>
        </div>

        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
            Note
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                aria-label={`Note ${n} sur 5`}
                className={
                  "h-9 w-9 rounded-md transition-colors " +
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
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Langue
              </span>
              <select
                name="locale"
                defaultValue={initial?.locale ?? "fr"}
                className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>

          <div>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Voyage lié (optionnel)
              </span>
              <input
                list="trip-slugs"
                name="tripSlug"
                defaultValue={initial?.tripSlug ?? ""}
                placeholder="ex: casamance-7j"
                className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
              />
              <datalist id="trip-slugs">
                {SLUG_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>
            <p className="mt-1 text-xs text-silver">Slug destination ou offre. Affiche un lien « Voir ce voyage ».</p>
          </div>

          <div>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Date du voyage (optionnel)
              </span>
              <input
                type="date"
                name="dateTrip"
                defaultValue={initial?.dateTrip ?? ""}
                className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
              />
            </label>
          </div>

          <div>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Ordre (tri manuel)
              </span>
              <input
                type="number"
                name="order"
                min={0}
                defaultValue={initial?.order ?? 0}
                className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
              />
            </label>
            <p className="mt-1 text-xs text-silver">Plus petit = affiché en premier sur la home.</p>
          </div>
        </div>
      </section>

      {/* Avatar */}
      <section className="rounded-xl border border-sand-deep bg-sand p-5">
        <h3 className="font-display text-base font-semibold text-navy">Avatar (optionnel)</h3>
        <p className="mt-1 text-xs text-silver">
          Une photo portrait du voyageur — sinon on affiche ses initiales sur fond pastel.
        </p>
        <div className="mt-4">
          {avatarId ? (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_120,h_120,c_fill,r_max/${avatarId}`}
                alt=""
                className="h-12 w-12 rounded-full object-cover border border-sand-deep"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-graphite truncate">{avatarId}</p>
                <button
                  type="button"
                  onClick={() => setAvatarId("")}
                  className="mt-1 text-xs text-sunrise-coral hover:underline"
                >
                  Retirer
                </button>
              </div>
            </div>
          ) : (
            <MediaUploader
              folder="assirik-tours/testimonials"
              onUploaded={(asset) => setAvatarId(asset.publicId)}
            />
          )}
        </div>
      </section>

      {/* Statut */}
      <label className="inline-flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={approved}
          onChange={(e) => setApproved(e.target.checked)}
          className="h-4 w-4 rounded border-sand-deep text-ocean focus:ring-ocean"
        />
        <span className="text-sm text-navy">
          Publié (visible sur le site public)
        </span>
      </label>

      {error && (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
        >
          {isPending
            ? "Enregistrement…"
            : mode === "create"
            ? "Créer le témoignage"
            : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
        {label}
        {required && <span className="text-sunrise-coral"> *</span>}
      </span>
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
      />
    </label>
  );
}
