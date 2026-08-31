"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleApprovedAction } from "@/lib/testimonial-actions";

export function AdminToggleApprovedButton({
  id,
  approved,
}: {
  id: string;
  approved: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    const fd = new FormData();
    fd.append("id", id);
    startTransition(async () => {
      await toggleApprovedAction(fd);
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
        (approved
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-silver/15 text-graphite hover:bg-sand-deep")
      }
      aria-pressed={approved}
    >
      <span
        aria-hidden
        className={
          "h-2 w-2 rounded-full " + (approved ? "bg-emerald-500" : "bg-silver")
        }
      />
      {isPending ? "…" : approved ? "Approuvé" : "Approuver"}
    </button>
  );
}
