"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFaqItemAction } from "@/lib/faq-actions";

export function AdminDeleteFaqButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onClick() {
    if (!confirm("Supprimer cette question ? Cette action est irréversible.")) return;
    const fd = new FormData();
    fd.append("id", id);
    startTransition(async () => {
      setError(null);
      try {
        const result = await deleteFaqItemAction(fd);
        if (result?.error) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch {
        setError("Suppression impossible. Réessayez.");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="inline-flex min-h-11 items-center text-sm font-medium text-sunrise-coral hover:underline disabled:cursor-wait disabled:opacity-50"
      >
        {isPending ? "Suppression…" : "Supprimer"}
      </button>
      {error ? (
        <p role="alert" className="mt-1 max-w-40 text-xs text-sunrise-coral">
          {error}
        </p>
      ) : null}
    </div>
  );
}
