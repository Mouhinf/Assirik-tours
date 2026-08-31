"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFaqItemAction } from "@/lib/faq-actions";

export function AdminDeleteFaqButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    if (!confirm("Supprimer cette question ? Cette action est irréversible.")) return;
    const fd = new FormData();
    fd.append("id", id);
    startTransition(async () => {
      await deleteFaqItemAction(fd);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="text-sm font-medium text-sunrise-coral hover:underline disabled:opacity-50"
    >
      {isPending ? "Suppression…" : "Supprimer"}
    </button>
  );
}
