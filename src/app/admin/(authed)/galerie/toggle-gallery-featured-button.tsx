"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleGalleryFeaturedAction } from "@/lib/gallery-actions";

export function AdminToggleGalleryFeaturedButton({
  id,
  isFeatured,
  disabled,
}: {
  id: string;
  isFeatured: boolean;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    if (disabled) return;
    const fd = new FormData();
    fd.append("id", id);
    startTransition(async () => {
      const res = await toggleGalleryFeaturedAction(fd);
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (disabled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-sand-deep/50 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-silver">
        À la une
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider transition-colors disabled:opacity-60 ${
        isFeatured
          ? "bg-sunrise-orange/20 text-sunrise-amber hover:bg-sunrise-orange/30"
          : "bg-sand-deep text-graphite hover:bg-sand-deep/70"
      }`}
    >
      {isFeatured ? "★ À la une" : "À la une"}
    </button>
  );
}
