"use client";

import { useTransition } from "react";
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
  const router = useRouter();

  function onClick() {
    const fd = new FormData();
    fd.append("id", id);
    startTransition(async () => {
      await toggleFaqActiveAction(fd);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold transition-colors " +
        (isActive
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-silver/15 text-graphite hover:bg-sand-deep")
      }
      aria-pressed={isActive}
    >
      <span
        aria-hidden
        className={
          "h-2 w-2 rounded-full " + (isActive ? "bg-emerald-500" : "bg-silver")
        }
      />
      {isPending ? "…" : isActive ? "Active" : "Désactivée"}
    </button>
  );
}
