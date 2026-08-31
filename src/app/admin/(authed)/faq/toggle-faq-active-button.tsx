"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFaqActiveAction } from "@/lib/faq-actions";

export function AdminToggleFaqActiveButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onClick() {
    const fd = new FormData();
    fd.append("id", id);
    startTransition(async () => {
      setError(null);
      try {
        const result = await toggleFaqActiveAction(fd);
        if ("error" in result) {
          setError(result.error ?? "Impossible de modifier le statut.");
          return;
        }
        router.refresh();
      } catch {
        setError("Impossible de modifier le statut. Réessayez.");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        aria-label={`${isActive ? "Désactiver" : "Activer"} cette question`}
        aria-pressed={isActive}
        className={
          "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 " +
          (isActive
            ? "bg-mist text-navy hover:bg-sky/30"
            : "bg-silver/15 text-graphite hover:bg-sand-deep")
        }
      >
        <span
          aria-hidden
          className={
            "h-2 w-2 rounded-full " + (isActive ? "bg-ocean" : "bg-silver")
          }
        />
        {isPending ? "Mise à jour…" : isActive ? "Active" : "Désactivée"}
      </button>
      {error ? (
        <p role="alert" className="mt-1 max-w-40 text-xs text-sunrise-coral">
          {error}
        </p>
      ) : null}
    </div>
  );
}
