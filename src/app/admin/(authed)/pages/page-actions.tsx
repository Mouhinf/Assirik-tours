"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePageContentAction } from "@/lib/page-content-actions";

export function AdminDeletePageButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(`Désactiver ${title} ?`)) return;
    const fd = new FormData();
    fd.append("id", id);
    startTransition(async () => {
      await deletePageContentAction(fd);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-md bg-sunrise-coral/15 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-sunrise-coral hover:bg-sunrise-coral/25 disabled:opacity-60"
    >
      {pending ? "…" : "Désactiver"}
    </button>
  );
}
