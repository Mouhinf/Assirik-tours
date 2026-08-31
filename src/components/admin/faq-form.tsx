"use client";

import { useState, useTransition } from "react";
import { saveFaqItemAction } from "@/lib/faq-actions";
import {
  FAQ_CATEGORIES,
  FAQ_CATEGORY_LABELS_FR,
  FAQ_CATEGORY_LABELS_EN,
  renderInlineMarkdown,
} from "@/lib/validators/faq";

type Locale = "fr" | "en";
type Category =
  | "general"
  | "payment"
  | "visa"
  | "flight"
  | "omra"
  | "services";

type Initial = {
  id?: string;
  locale: Locale;
  category: Category;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
};

export function FaqForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Initial;
}) {
  const [locale, setLocale] = useState<Locale>(initial?.locale ?? "fr");
  const [category, setCategory] = useState<Category>(initial?.category ?? "general");
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const categoryLabels = locale === "en" ? FAQ_CATEGORY_LABELS_EN : FAQ_CATEGORY_LABELS_FR;
  const preview = answer.length >= 1 ? renderInlineMarkdown(answer) : "";

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("locale", locale);
    formData.set("category", category);
    formData.set("question", question);
    formData.set("answer", answer);
    formData.set("isActive", isActive ? "on" : "");

    startTransition(async () => {
      const res = await saveFaqItemAction(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-6 max-w-5xl">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <section className="rounded-xl border border-sand-deep bg-sand p-5 space-y-5">
        <h3 className="font-display text-base font-semibold text-navy">
          Classification
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Langue
            </span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Catégorie
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
            >
              {FAQ_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Ordre (tri manuel dans la catégorie)
            </span>
            <input
              type="number"
              name="order"
              min={0}
              defaultValue={initial?.order ?? 0}
              className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-sand-deep bg-sand p-5">
        <h3 className="font-display text-base font-semibold text-navy">Question</h3>
        <div className="mt-3">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Libellé <span className="text-sunrise-coral">*</span>
            </span>
            <input
              name="question"
              required
              maxLength={200}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex : Combien de temps à l'avance réserver un vol ?"
              className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors"
            />
          </label>
          <p className="mt-1 text-xs text-silver">
            {question.length} / 200 caractères
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-sand-deep bg-sand p-5">
        <h3 className="font-display text-base font-semibold text-navy">Réponse</h3>
        <p className="mt-1 text-xs text-silver">
          Markdown léger autorisé : <code>**gras**</code>, <code>*italique*</code>,{" "}
          <code>- liste à puces</code>, <code>[label](url)</code>, lignes vides pour paragraphes.
        </p>
        <div className="mt-4 grid lg:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Markdown source
            </span>
            <textarea
              name="answer"
              required
              maxLength={3000}
              rows={12}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Rédigez la réponse ici…"
              className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy focus:border-ocean outline-none transition-colors font-mono"
            />
            <p className="mt-1 text-xs text-silver">{answer.length} / 3000 caractères</p>
          </label>

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Aperçu rendu
            </span>
            <div
              className="min-h-[20rem] rounded-lg border border-sand-deep bg-sand-deep/30 px-4 py-3 text-sm text-graphite leading-relaxed prose prose-sand"
              dangerouslySetInnerHTML={{ __html: preview || "<p class='italic text-silver'>Aucun contenu.</p>" }}
            />
          </div>
        </div>
      </section>

      <label className="inline-flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-sand-deep text-ocean focus:ring-ocean"
        />
        <span className="text-sm text-navy">Active (visible sur le site public)</span>
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
            ? "Créer la question"
            : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
