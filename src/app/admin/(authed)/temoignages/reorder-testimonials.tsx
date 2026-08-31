"use client";

/**
 * Reorder testimonials via up/down controls.
 *
 * The full sorted list comes from the parent; the user clicks ▲ / ▼ to swap
 * with the previous/next sibling. Submission batches all moves into a single
 * `reorderTestimonialsAction` server action.
 *
 * We opted for up/down arrows instead of HTML5 drag&drop to avoid pulling
 * dnd-kit (out of scope per the Phase brief).
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reorderTestimonialsAction } from "@/lib/testimonial-actions";

type Item = { id: string; label: string };

export function AdminReorderTestimonials({ items }: { items: Item[] }) {
  const [ordered, setOrdered] = useState(items);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= ordered.length) return;
    setOrdered((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function save() {
    const fd = new FormData();
    fd.append("orderedIds", ordered.map((o) => o.id).join(","));
    startTransition(async () => {
      await reorderTestimonialsAction(fd);
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-navy">Ordre d'affichage</h3>
          <p className="mt-1 text-xs text-silver">
            Utilisez les flèches pour réorganiser. Le témoignage le plus haut apparaît en premier sur la home.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-full bg-ocean px-4 py-1.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
        >
          {isPending ? "Enregistrement…" : "Enregistrer l'ordre"}
        </button>
      </header>

      <ol className="space-y-2">
        {ordered.map((it, idx) => (
          <li
            key={it.id}
            className="flex items-center gap-3 rounded-lg border border-sand-deep bg-sand-deep/30 px-3 py-2"
          >
            <span className="font-mono text-xs text-graphite w-6 shrink-0">#{idx + 1}</span>
            <span className="flex-1 text-sm text-navy truncate">{it.label}</span>
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                aria-label="Monter"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-sand-deep bg-sand text-graphite hover:text-navy disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === ordered.length - 1}
                aria-label="Descendre"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-sand-deep bg-sand text-graphite hover:text-navy disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 9l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
