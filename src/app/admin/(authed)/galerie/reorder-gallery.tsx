"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reorderGalleryItemsAction } from "@/lib/gallery-actions";

type Item = { id: string; label: string };

export function AdminReorderGallery({ items }: { items: Item[] }) {
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
      const res = await reorderGalleryItemsAction(fd);
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-sand-deep bg-sand p-5 space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-navy">
            Ordre d&apos;affichage
          </h3>
          <p className="mt-1 text-xs text-silver">
            Utilisez les flèches pour réorganiser. La photo en haut apparaît en premier dans la grille publique.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
        >
          {isPending ? "Enregistrement…" : "Enregistrer l'ordre"}
        </button>
      </header>
      <ol className="space-y-2">
        {ordered.map((item, idx) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-sand-deep bg-sand-deep/30 px-3 py-2"
          >
            <span className="font-mono text-xs text-silver tabular-nums">
              #{idx + 1}
            </span>
            <span className="flex-1 truncate text-sm text-navy">{item.label}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0 || isPending}
                className="rounded-md border border-sand-deep bg-sand px-2 py-1 text-xs hover:bg-sand-deep/40 disabled:opacity-40"
                aria-label="Monter"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === ordered.length - 1 || isPending}
                className="rounded-md border border-sand-deep bg-sand px-2 py-1 text-xs hover:bg-sand-deep/40 disabled:opacity-40"
                aria-label="Descendre"
              >
                ▼
              </button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
