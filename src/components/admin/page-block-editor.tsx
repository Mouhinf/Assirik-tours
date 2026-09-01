"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BLOCK_TYPES,
  BLOCK_LABELS_FR,
  emptyBlock,
  type Block,
  type BlockType,
} from "@/lib/page-blocks";
import { savePageContentAction } from "@/lib/page-content-actions";
import { PageBlockRenderer } from "@/components/site/page-block-renderer";

type SeoMeta = {
  title: string;
  description: string;
  ogImage: string;
  keywords: string[];
};

export function PageBlockEditor({
  slug,
  locale,
  initial,
}: {
  slug: string;
  locale: "fr" | "en";
  initial?: {
    id?: string;
    title: string;
    subtitle: string;
    blocks: Block[];
    seoMeta: SeoMeta;
    isActive: boolean;
  };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [blocks, setBlocks] = useState<Block[]>(initial?.blocks ?? []);
  const [seoTitle, setSeoTitle] = useState(initial?.seoMeta.title ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoMeta.description ?? "");
  const [seoOgImage, setSeoOgImage] = useState(initial?.seoMeta.ogImage ?? "");
  const [seoKeywords, setSeoKeywords] = useState(initial?.seoMeta.keywords.join(", ") ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  function addBlock(type: BlockType) {
    setBlocks((prev) => [...prev, emptyBlock(type)]);
    setShowAdd(false);
    setEditing(blocks.length);
  }

  function updateBlock(index: number, props: unknown) {
    setBlocks((prev) => {
      const next = [...prev];
      const current = next[index];
      if (!current) return prev;
      next[index] = { type: current.type, props } as Block;
      return next;
    });
  }

  function duplicateBlock(index: number) {
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, JSON.parse(JSON.stringify(next[index])));
      return next;
    });
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
    setEditing(null);
  }

  function move(index: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function onSubmit() {
    setError(null);
    const fd = new FormData();
    if (initial?.id) fd.append("id", initial.id);
    fd.append("slug", slug);
    fd.append("locale", locale);
    fd.append("title", title);
    fd.append("subtitle", subtitle);
    fd.append("blocks", JSON.stringify(blocks));
    fd.append("seoTitle", seoTitle);
    fd.append("seoDescription", seoDescription);
    fd.append("seoOgImage", seoOgImage);
    fd.append("seoKeywords", seoKeywords);
    fd.append("isActive", isActive ? "on" : "");

    startTransition(async () => {
      const res = await savePageContentAction(fd);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* ─── Édition ─── */}
        <section className="space-y-5">
          <div className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Titre
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Sous-titre (optionnel)
              </span>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              />
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-sand-deep text-ocean focus:ring-ocean"
              />
              <span className="text-sm text-navy">Page active (visible publiquement)</span>
            </label>
          </div>

          <div className="rounded-xl border border-sand-deep bg-sand p-5 space-y-3">
            <header className="flex items-center justify-between gap-3">
              <h3 className="font-display text-base font-semibold text-navy">
                Blocs ({blocks.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowAdd((v) => !v)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy"
              >
                + Ajouter un bloc
              </button>
            </header>

            {showAdd ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BLOCK_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addBlock(t)}
                    className="rounded-lg border border-sand-deep bg-sand-deep/30 px-3 py-2 text-left text-sm font-semibold text-navy hover:bg-sand-deep"
                  >
                    {BLOCK_LABELS_FR[t]}
                  </button>
                ))}
              </div>
            ) : null}

            <ol className="space-y-2">
              {blocks.map((block, idx) => (
                <li
                  key={idx}
                  className="rounded-lg border border-sand-deep bg-sand-deep/20 p-3"
                >
                  <header className="flex items-center gap-2">
                    <span className="font-mono text-xs text-silver tabular-nums">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-navy text-sm">
                      {BLOCK_LABELS_FR[block.type as BlockType] ?? block.type}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => move(idx, -1)}
                        disabled={idx === 0}
                        className="rounded-md border border-sand-deep bg-sand px-2 py-1 text-xs hover:bg-sand-deep/40 disabled:opacity-40"
                        aria-label="Monter"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => move(idx, 1)}
                        disabled={idx === blocks.length - 1}
                        className="rounded-md border border-sand-deep bg-sand px-2 py-1 text-xs hover:bg-sand-deep/40 disabled:opacity-40"
                        aria-label="Descendre"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(editing === idx ? null : idx)}
                        className="rounded-md bg-ocean px-2 py-1 text-xs font-semibold text-sand hover:bg-navy"
                      >
                        {editing === idx ? "Fermer" : "Éditer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateBlock(idx)}
                        className="rounded-md bg-sky/20 px-2 py-1 text-xs font-semibold text-ocean hover:bg-sky/30"
                      >
                        Dup.
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(idx)}
                        className="rounded-md bg-sunrise-coral/15 px-2 py-1 text-xs font-semibold text-sunrise-coral hover:bg-sunrise-coral/25"
                      >
                        ✕
                      </button>
                    </div>
                  </header>

                  {editing === idx ? (
                    <div className="mt-3">
                      <BlockEditor
                        block={block}
                        onChange={(props) => updateBlock(idx, props)}
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
            {blocks.length === 0 ? (
              <p className="text-sm text-graphite text-center py-3">
                Aucun bloc — ajoutez-en un pour commencer.
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-sand-deep bg-sand p-5 space-y-3">
            <h3 className="font-display text-base font-semibold text-navy">SEO & Open Graph</h3>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Titre SEO (60 car. max)
              </span>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value.slice(0, 60))}
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy outline-none focus:border-ocean"
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
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy outline-none focus:border-ocean"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Image OG (public_id Cloudinary ou local:/…)
              </span>
              <input
                type="text"
                value={seoOgImage}
                onChange={(e) => setSeoOgImage(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 font-mono text-xs text-navy outline-none focus:border-ocean"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Mots-clés (séparés par virgule)
              </span>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy outline-none focus:border-ocean"
              />
            </label>
          </div>

          {error ? (
            <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
              {error}
            </p>
          ) : null}

          <div className="sticky bottom-0 bg-sand/95 backdrop-blur py-3 border-t border-sand-deep flex items-center gap-3">
            <button
              type="button"
              onClick={onSubmit}
              disabled={pending}
              className="inline-flex min-h-11 items-center rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-sand hover:bg-navy disabled:opacity-60"
            >
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
            {initial?.id && slug === "about" ? (
              <a
                href="/a-propos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-ocean hover:text-navy"
              >
                Voir en ligne ↗
              </a>
            ) : null}
            {initial?.id && slug === "services" ? (
              <a
                href="/services"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-ocean hover:text-navy"
              >
                Voir en ligne ↗
              </a>
            ) : null}
          </div>
        </section>

        {/* ─── Preview live ─── */}
        <aside className="space-y-3 lg:sticky lg:top-4">
          <h3 className="font-display text-base font-semibold text-navy">Aperçu live</h3>
          <div className="rounded-xl border border-sand-deep bg-sand overflow-hidden">
            <div className="bg-sand-deep/40 px-3 py-1.5 text-[0.65rem] uppercase tracking-wider text-graphite border-b border-sand-deep">
              Locale : {locale === "fr" ? "Français" : "English"} · {blocks.length} bloc(s)
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
              {blocks.length === 0 ? (
                <p className="p-6 text-sm text-graphite">
                  Ajoutez un bloc pour voir l&apos;aperçu.
                </p>
              ) : (
                blocks.map((block, i) => (
                  <PageBlockRenderer key={i} block={block} />
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ── Block-level editor — fields vary per type ─────────── */

function BlockEditor({ block, onChange }: { block: Block; onChange: (props: unknown) => void }) {
  // Each editor writes the FULL props object back via onChange. Keeps the
  // parent state simple (single source of truth in `blocks[]`).
  switch (block.type) {
    case "hero": {
      const p = block.props;
      return (
        <div className="space-y-3">
          <Field label="Titre">
            <input
              type="text"
              value={p.title}
              onChange={(e) => onChange({ ...p, title: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Sous-titre">
            <textarea
              rows={2}
              value={p.subtitle ?? ""}
              onChange={(e) => onChange({ ...p, subtitle: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Image (Cloudinary public_id ou local:…)">
            <input
              type="text"
              value={p.imageId ?? ""}
              onChange={(e) => onChange({ ...p, imageId: e.target.value })}
              className={inputCls + " font-mono text-xs"}
            />
          </Field>
          <Field label="CTA — label">
            <input
              type="text"
              value={p.cta?.label ?? ""}
              onChange={(e) =>
                onChange({
                  ...p,
                  cta: { label: e.target.value, href: p.cta?.href ?? "/contact" },
                })
              }
              className={inputCls}
            />
          </Field>
          <Field label="CTA — href">
            <input
              type="text"
              value={p.cta?.href ?? ""}
              onChange={(e) =>
                onChange({
                  ...p,
                  cta: { label: p.cta?.label ?? "En savoir plus", href: e.target.value },
                })
              }
              className={inputCls}
            />
          </Field>
        </div>
      );
    }
    case "text": {
      const p = block.props;
      return (
        <div className="space-y-3">
          <Field label="Corps (Markdown léger)">
            <textarea
              rows={6}
              value={p.body}
              onChange={(e) => onChange({ ...p, body: e.target.value })}
              className={inputCls + " font-mono text-xs"}
            />
          </Field>
          <Field label="Alignement">
            <select
              value={p.align ?? "left"}
              onChange={(e) => onChange({ ...p, align: e.target.value })}
              className={inputCls}
            >
              <option value="left">Gauche</option>
              <option value="center">Centré</option>
            </select>
          </Field>
        </div>
      );
    }
    case "two-column": {
      const p = block.props;
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Colonne gauche (Markdown)">
            <textarea
              rows={6}
              value={p.left}
              onChange={(e) => onChange({ ...p, left: e.target.value })}
              className={inputCls + " font-mono text-xs"}
            />
          </Field>
          <Field label="Colonne droite (Markdown)">
            <textarea
              rows={6}
              value={p.right}
              onChange={(e) => onChange({ ...p, right: e.target.value })}
              className={inputCls + " font-mono text-xs"}
            />
          </Field>
        </div>
      );
    }
    case "stats": {
      const p = block.props;
      return (
        <div className="space-y-3">
          {p.items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
              <input
                type="text"
                value={it.value}
                onChange={(e) => {
                  const next = [...p.items];
                  next[i] = { ...next[i], value: e.target.value };
                  onChange({ ...p, items: next });
                }}
                placeholder="Valeur"
                className={inputCls}
              />
              <input
                type="text"
                value={it.label}
                onChange={(e) => {
                  const next = [...p.items];
                  next[i] = { ...next[i], label: e.target.value };
                  onChange({ ...p, items: next });
                }}
                placeholder="Libellé"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() =>
                  onChange({ ...p, items: p.items.filter((_, j) => j !== i) })
                }
                className="rounded-md bg-sunrise-coral/15 px-2 py-1 text-xs text-sunrise-coral"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange({ ...p, items: [...p.items, { value: "", label: "" }] })
            }
            className="text-xs font-semibold text-ocean hover:text-navy"
          >
            + Ajouter un indicateur
          </button>
        </div>
      );
    }
    case "team-grid": {
      const p = block.props;
      return (
        <div className="space-y-3">
          {p.members.map((m, i) => (
            <div key={i} className="rounded-lg border border-sand-deep/60 bg-sand p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={m.name}
                  onChange={(e) => {
                    const next = [...p.members];
                    next[i] = { ...next[i], name: e.target.value };
                    onChange({ ...p, members: next });
                  }}
                  placeholder="Nom"
                  className={inputCls}
                />
                <input
                  type="text"
                  value={m.role}
                  onChange={(e) => {
                    const next = [...p.members];
                    next[i] = { ...next[i], role: e.target.value };
                    onChange({ ...p, members: next });
                  }}
                  placeholder="Rôle"
                  className={inputCls}
                />
              </div>
              <input
                type="text"
                value={m.photoId ?? ""}
                onChange={(e) => {
                  const next = [...p.members];
                  next[i] = { ...next[i], photoId: e.target.value };
                  onChange({ ...p, members: next });
                }}
                placeholder="photo public_id (optionnel)"
                className={inputCls + " font-mono text-xs"}
              />
              <textarea
                rows={2}
                value={m.bio ?? ""}
                onChange={(e) => {
                  const next = [...p.members];
                  next[i] = { ...next[i], bio: e.target.value };
                  onChange({ ...p, members: next });
                }}
                placeholder="Bio courte (optionnel)"
                className={inputCls + " text-sm"}
              />
              <button
                type="button"
                onClick={() =>
                  onChange({ ...p, members: p.members.filter((_, j) => j !== i) })
                }
                className="rounded-md bg-sunrise-coral/15 px-2 py-1 text-xs text-sunrise-coral"
              >
                Retirer ce membre
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...p,
                members: [...p.members, { name: "Nouveau membre", role: "Rôle" }],
              })
            }
            className="text-xs font-semibold text-ocean hover:text-navy"
          >
            + Ajouter un membre
          </button>
        </div>
      );
    }
    case "service-list": {
      const p = block.props;
      return (
        <div className="space-y-3">
          {p.services.map((s, i) => (
            <div key={i} className="rounded-lg border border-sand-deep/60 bg-sand p-3 space-y-2">
              <div className="grid grid-cols-[2fr_1fr] gap-2">
                <input
                  type="text"
                  value={s.title}
                  onChange={(e) => {
                    const next = [...p.services];
                    next[i] = { ...next[i], title: e.target.value };
                    onChange({ ...p, services: next });
                  }}
                  placeholder="Titre"
                  className={inputCls}
                />
                <select
                  value={s.icon ?? "ticket"}
                  onChange={(e) => {
                    const next = [...p.services];
                    next[i] = { ...next[i], icon: e.target.value };
                    onChange({ ...p, services: next });
                  }}
                  className={inputCls}
                >
                  <option value="ticket">Ticket</option>
                  <option value="stamp">Visa</option>
                  <option value="car">Voiture</option>
                  <option value="shield">Assurance</option>
                  <option value="pin">Lieu</option>
                  <option value="building">Bâtiment</option>
                </select>
              </div>
              <textarea
                rows={2}
                value={s.description}
                onChange={(e) => {
                  const next = [...p.services];
                  next[i] = { ...next[i], description: e.target.value };
                  onChange({ ...p, services: next });
                }}
                placeholder="Description"
                className={inputCls + " text-sm"}
              />
              <input
                type="number"
                value={s.priceFrom ?? ""}
                onChange={(e) => {
                  const next = [...p.services];
                  const v = e.target.value ? Number(e.target.value) : undefined;
                  next[i] = { ...next[i], priceFrom: v };
                  onChange({ ...p, services: next });
                }}
                placeholder="Prix à partir de (FCFA, optionnel)"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() =>
                  onChange({ ...p, services: p.services.filter((_, j) => j !== i) })
                }
                className="rounded-md bg-sunrise-coral/15 px-2 py-1 text-xs text-sunrise-coral"
              >
                Retirer ce service
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...p,
                services: [
                  ...p.services,
                  { title: "Nouveau service", description: "Description", icon: "ticket" },
                ],
              })
            }
            className="text-xs font-semibold text-ocean hover:text-navy"
          >
            + Ajouter un service
          </button>
        </div>
      );
    }
    case "image": {
      const p = block.props;
      return (
        <div className="space-y-3">
          <Field label="Image (public_id)">
            <input
              type="text"
              value={p.imageId}
              onChange={(e) => onChange({ ...p, imageId: e.target.value })}
              className={inputCls + " font-mono text-xs"}
            />
          </Field>
          <Field label="Texte alternatif (alt)">
            <input
              type="text"
              value={p.alt}
              onChange={(e) => onChange({ ...p, alt: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Légende (optionnel)">
            <input
              type="text"
              value={p.caption ?? ""}
              onChange={(e) => onChange({ ...p, caption: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
      );
    }
    case "cta-banner": {
      const p = block.props;
      return (
        <div className="space-y-3">
          <Field label="Titre">
            <input
              type="text"
              value={p.title}
              onChange={(e) => onChange({ ...p, title: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Description (optionnel)">
            <textarea
              rows={2}
              value={p.description ?? ""}
              onChange={(e) => onChange({ ...p, description: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="CTA — label">
            <input
              type="text"
              value={p.cta.label}
              onChange={(e) =>
                onChange({ ...p, cta: { ...p.cta, label: e.target.value } })
              }
              className={inputCls}
            />
          </Field>
          <Field label="CTA — href">
            <input
              type="text"
              value={p.cta.href}
              onChange={(e) =>
                onChange({ ...p, cta: { ...p.cta, href: e.target.value } })
              }
              className={inputCls}
            />
          </Field>
        </div>
      );
    }
    case "rich-text": {
      const p = block.props;
      return (
        <Field label="HTML (sera sanitisé)">
          <textarea
            rows={6}
            value={p.html}
            onChange={(e) => onChange({ ...p, html: e.target.value })}
            className={inputCls + " font-mono text-xs"}
          />
        </Field>
      );
    }
  }
}

const inputCls =
  "min-h-11 w-full rounded-md border border-sand-deep bg-sand px-3 py-2 text-sm text-navy outline-none focus:border-ocean";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[0.65rem] font-semibold uppercase tracking-wider text-graphite mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
