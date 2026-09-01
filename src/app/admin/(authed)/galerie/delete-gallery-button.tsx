"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGalleryItemAction } from "@/lib/gallery-actions";

export function AdminDeleteGalleryButton({ id, name }: { id: string; name: string }) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    if (!confirm(`Supprimer "${name}" définitivement ? Cette opération est irréversible.`)) {
      return;
    }
    const fd = new FormData();
    fd.append("id", id);
    startTransition(async () => {
      const res = await deleteGalleryItemAction(fd);
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md bg-sunrise-coral/15 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-sunrise-coral hover:bg-sunrise-coral/25 transition-colors"
    >
      Supprimer
    </button>
  );
}
