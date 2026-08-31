"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTestimonialAction } from "@/lib/testimonial-actions";

export function AdminDeleteTestimonialButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    if (!confirm("Supprimer ce témoignage ? Cette action est irréversible.")) return;
    const fd = new FormData();
    fd.append("id", id);
    startTransition(async () => {
      await deleteTestimonialAction(fd);
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
