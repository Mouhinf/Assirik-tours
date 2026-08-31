"use client";

/**
 * Reorder FAQ items within a category+locale scope.
 * Up/down controls + single save (matches the Testimonials reorder pattern
 * from the previous phase, kept consistent to avoid dragging dnd-kit).
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reorderFaqItemsAction } from "@/lib/faq-actions";

type Item = { id: string; label: string };

export function AdminReorderFaqs({
  scope,
  items,
}: {
  scope: string;
  items: Item[];
}) {
  const [ordered, setOrdered] = useState(items);
  const [isPending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= ordered.length) return;
    setOrdered((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    setDirty(true);
    setMessage(null);
    setError(null);
  }

  function save() {
    const fd = new FormData();
    fd.append("orderedIds", ordered.map((o) => o.id).join(","));
    startTransition(async () => {
      setError(null);
      setMessage(null);
      try {
        const result = await reorderFaqItemsAction(fd);
        if ("error" in result) {
          setError(result.error ?? "Enregistrement impossible.");
          return;
        }
        setDirty(false);
        setMessage("Ordre enregistré.");
        router.refresh();
      } catch {
        setError("Enregistrement impossible. Rechargez la page et réessayez.");
      }
    });
  }

  return (
    <section className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-navy">
            Ordre — {scope}
          </h3>
          <p className="mt-1 text-xs text-silver">
            Les questions apparaissent dans cet ordre sur la page publique.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={isPending || !dirty}
          className="inline-flex min-h-11 items-center rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-sand transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-50"
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
                aria-label={`Monter « ${it.label} »`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-sand-deep bg-sand text-graphite hover:text-navy disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === ordered.length - 1}
                aria-label={`Descendre « ${it.label} »`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-sand-deep bg-sand text-graphite hover:text-navy disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 9l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ol>
      {error ? (
        <p role="alert" className="text-sm text-sunrise-coral">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-sm font-medium text-ocean">
          {message}
        </p>
      ) : null}
    </section>
  );
}
