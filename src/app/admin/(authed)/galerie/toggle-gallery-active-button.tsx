"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleGalleryActiveAction } from "@/lib/gallery-actions";

export function AdminToggleGalleryActiveButton({
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
      const res = await toggleGalleryActiveAction(fd);
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
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider transition-colors disabled:opacity-60 ${
        isActive
          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
          : "bg-sand-deep text-graphite hover:bg-sand-deep/70"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
