"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveBlogPostAction } from "@/lib/blog-actions";
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_LABELS_FR,
  BLOG_CATEGORY_LABELS_EN,
  BLOG_LOCALES,
  renderBlogBody,
  calculateReadingTime,
  type BlogCategory,
  type BlogLocale,
} from "@/lib/validators/blog";
import { deliveryUrl } from "@/lib/cloudinary-url";

type SeoMeta = {
  title: string;
  description: string;
  ogImage: string;
  keywords: string[];
};

type Initial = {
  id?: string;
  slug: string;
  locale: BlogLocale;
  title: string;
  excerpt: string;
  body: string;
  coverImageId: string;
  category: BlogCategory | null;
  tags: string[];
  readingTime: number | null;
  publishedAt: string | null;
  isFeatured: boolean;
  seoMeta: SeoMeta;
};

type Props = {
  mode: "create" | "edit";
  initial?: Initial;
  canPublish: boolean;
  canFeatured: boolean;
  canDelete: boolean;
};

export function BlogPostForm({ mode, initial, canPublish, canFeatured, canDelete }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [locale, setLocale] = useState<BlogLocale>(initial?.locale ?? "fr");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [coverImageId, setCoverImageId] = useState(initial?.coverImageId ?? "");
  const [category, setCategory] = useState<BlogCategory | "">(initial?.category ?? "");
  const [tagsRaw, setTagsRaw] = useState(initial?.tags.join(", ") ?? "");
  const [readingTime, setReadingTime] = useState<number | null>(initial?.readingTime ?? null);
  const [seoOpen, setSeoOpen] = useState(false);
  const [seoTitle, setSeoTitle] = useState(initial?.seoMeta.title ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoMeta.description ?? "");
  const [seoOgImage, setSeoOgImage] = useState(initial?.seoMeta.ogImage ?? "");
  const [seoKeywordsRaw, setSeoKeywordsRaw] = useState(initial?.seoMeta.keywords.join(", ") ?? "");

  const [error, setError] = useState<string | null>(null);
  const [savePending, startSave] = useTransition();

  const computedReading = useMemo(() => calculateReadingTime(body), [body]);

  function onSubmit(intent: "draft" | "publish") {
    setError(null);
    const fd = new FormData();
    if (initial?.id) fd.append("id", initial.id);
    fd.append("title", title);
    fd.append("slug", slug || title);
    fd.append("locale", locale);
    fd.append("excerpt", excerpt);
    fd.append("body", body);
    fd.append("coverImageId", coverImageId);
    fd.append("category", category || "");
    fd.append("tags", tagsRaw);
    fd.append("readingTime", String(readingTime ?? computedReading));
    fd.append("seoTitle", seoTitle);
    fd.append("seoDescription", seoDescription);
    fd.append("seoOgImage", seoOgImage || coverImageId);
    fd.append("seoKeywords", seoKeywordsRaw);
    fd.append("intent", intent);

    startSave(async () => {
      const res = await saveBlogPostAction(fd);
      if (res?.error) setError(res.error);
      else if (intent === "publish" && initial?.id && canPublish) {
        // After save, navigate to publish action — but saveBlogPostAction
        // already redirects to /admin/blog. The "publish" intent here is
        // purely a UX hint (we save with the flag set); the admin can
        // then click "Publier" on the list page to set publishedAt.
        router.refresh();
      }
    });
  }

  const coverPreview = coverImageId
    ? coverImageId.startsWith("local:")
      ? coverImageId.slice("local:".length)
      : deliveryUrl(coverImageId, { width: 1280, height: 720, crop: "fill" })
    : "";

  const previewBody = useMemo(() => renderBlogBody(body), [body]);
  const previewTitle = title || "Titre de l'article";
  const previewDate = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const categoryLabel = category
    ? locale === "en"
      ? BLOG_CATEGORY_LABELS_EN[category]
      : BLOG_CATEGORY_LABELS_FR[category]
    : null;

  return (
    <form className="space-y-6">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        {/* ─── Left column — edit ─── */}
        <section className="space-y-5">
          <div className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
            <h3 className="font-display text-base font-semibold text-navy">Contenu principal</h3>

            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Titre <span aria-hidden className="text-sunrise-coral">*</span>
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={5}
                maxLength={200}
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              />
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                  Slug
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="généré depuis le titre"
                  className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 font-mono text-sm text-navy outline-none focus:border-ocean"
                />
                <span className="mt-1 block text-xs text-silver">
                  Slug final : <code>{slug || "(vide — généré à l'envoi)"}</code>
                </span>
              </label>

              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                  Langue
                </span>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as BlogLocale)}
                  className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
                >
                  {BLOG_LOCALES.map((l) => (
                    <option key={l} value={l}>
                      {l === "fr" ? "Français" : "English"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Extrait <span aria-hidden className="text-sunrise-coral">*</span>
              </span>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value.slice(0, 280))}
                rows={3}
                maxLength={280}
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              />
              <span className="mt-1 block text-right text-xs text-silver">
                {excerpt.length} / 280
              </span>
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                  Catégorie
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BlogCategory | "")}
                  className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
                >
                  <option value="">— Aucune —</option>
                  {BLOG_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {locale === "en" ? BLOG_CATEGORY_LABELS_EN[c] : BLOG_CATEGORY_LABELS_FR[c]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                  Tags (séparés par virgule, max 10)
                </span>
                <input
                  type="text"
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                  placeholder="visa, schengen, formalites"
                  className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
                />
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Image de couverture (Cloudinary public_id ou chemin local)
              </span>
              <input
                type="text"
                value={coverImageId}
                onChange={(e) => setCoverImageId(e.target.value)}
                placeholder="ex: assirik-tours/blog/visa-schengen"
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 font-mono text-sm text-navy outline-none focus:border-ocean"
                required
              />
              <span className="mt-1 block text-xs text-silver">
                Recommandé : 1200×630 (ratio 16:9) pour OG / WhatsApp.
              </span>
            </label>

            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Contenu (Markdown léger : titres ##, listes -, **gras**, *italique*, [lien](url))
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, 50_000))}
                rows={18}
                className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 font-mono text-sm text-navy outline-none focus:border-ocean"
              />
              <span className="mt-1 block text-right text-xs text-silver">
                {body.length} / 50 000 · ~{computedReading} min de lecture
              </span>
            </label>
          </div>

          {/* SEO collapsible */}
          <div className="rounded-xl border border-sand-deep bg-sand">
            <button
              type="button"
              onClick={() => setSeoOpen((v) => !v)}
              aria-expanded={seoOpen}
              className="flex min-h-14 w-full items-center gap-3 px-5 py-3 text-left text-sm font-semibold text-navy"
            >
              <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                style={{
                  transition: "transform 200ms",
                  transform: seoOpen ? "rotate(0deg)" : "rotate(-90deg)",
                }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
              SEO & Open Graph
            </button>
            {seoOpen ? (
              <div className="space-y-4 border-t border-sand-deep p-5">
                <label className="block">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                    Titre SEO (60 car. max)
                  </span>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value.slice(0, 60))}
                    placeholder="Défaut : titre de l'article"
                    className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                    Description SEO (160 car. max)
                  </span>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value.slice(0, 160))}
                    rows={2}
                    placeholder="Défaut : excerpt"
                    className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                    Image OG (1200×630 recommandé)
                  </span>
                  <input
                    type="text"
                    value={seoOgImage}
                    onChange={(e) => setSeoOgImage(e.target.value)}
                    placeholder="Défaut : cover"
                    className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 font-mono text-sm text-navy outline-none focus:border-ocean"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                    Mots-clés (séparés par virgule)
                  </span>
                  <input
                    type="text"
                    value={seoKeywordsRaw}
                    onChange={(e) => setSeoKeywordsRaw(e.target.value)}
                    className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
                  />
                </label>
              </div>
            ) : null}
          </div>
        </section>

        {/* ─── Right column — live preview ─── */}
        <aside className="space-y-5 lg:sticky lg:top-4">
          <div className="rounded-xl border border-sand-deep bg-sand p-5">
            <h3 className="font-display text-base font-semibold text-navy mb-3">Aperçu public</h3>

            <div className="overflow-hidden rounded-lg border border-sand-deep">
              <div className="relative aspect-[16/9] bg-sand-deep">
                {coverPreview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={coverPreview}
                    alt={previewTitle}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
                {categoryLabel ? (
                  <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-sand/90 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-navy backdrop-blur">
                    {categoryLabel}
                  </span>
                ) : null}
              </div>
              <div className="p-4">
                <p className="text-xs text-graphite">{previewDate}{readingTime || computedReading ? ` · ${readingTime ?? computedReading} min de lecture` : ""}</p>
                <h4 className="mt-2 font-display text-base font-semibold text-navy">{previewTitle}</h4>
                <p className="mt-1 text-sm text-graphite line-clamp-3">{excerpt || "L'extrait de l'article apparaîtra ici."}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-sand-deep bg-sand p-5">
            <h3 className="font-display text-base font-semibold text-navy mb-2">Aperçu du corps</h3>
            <div
              className="prose-sm max-h-96 overflow-y-auto text-graphite leading-relaxed"
              dangerouslySetInnerHTML={{ __html: previewBody || "<p class='text-silver'>Le rendu Markdown apparaîtra ici pendant la frappe.</p>" }}
            />
          </div>

          {initial?.publishedAt ? (
            <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
              Publié le{" "}
              {new Date(initial.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          ) : (
            <p className="rounded-lg bg-sand-deep border border-sand-deep px-3 py-2 text-xs text-graphite">
              Brouillon — non listé publiquement.
            </p>
          )}

          {initial?.isFeatured && !canFeatured ? (
            <p className="rounded-lg bg-sunrise-orange/15 border border-sunrise-orange/30 px-3 py-2 text-xs text-sunrise-amber">
              Cet article est marqué à la une par un super-admin.
            </p>
          ) : null}
        </aside>
      </div>

      {error && (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 sticky bottom-0 bg-sand/95 backdrop-blur py-3 border-t border-sand-deep">
        <button
          type="button"
          onClick={() => onSubmit("draft")}
          disabled={savePending}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-sand-deep bg-sand px-5 py-2.5 text-sm font-semibold text-graphite hover:text-navy transition-colors disabled:opacity-60"
        >
          {savePending ? "Enregistrement…" : "Enregistrer brouillon"}
        </button>
        {canPublish ? (
          <button
            type="button"
            onClick={() => onSubmit("publish")}
            disabled={savePending}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
          >
            Enregistrer & demander la publication
          </button>
        ) : null}
        {canDelete && initial?.id ? (
          <Link
            href={`/admin/blog/${initial.id}/delete`}
            className="ml-auto inline-flex min-h-11 items-center justify-center rounded-full bg-sunrise-coral/15 px-5 py-2.5 text-sm font-semibold text-sunrise-coral hover:bg-sunrise-coral/25 transition-colors"
          >
            Supprimer
          </Link>
        ) : null}
      </div>
    </form>
  );
}
