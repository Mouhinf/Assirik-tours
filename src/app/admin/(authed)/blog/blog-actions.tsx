"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  publishBlogPostAction,
  unpublishBlogPostAction,
  toggleBlogFeaturedAction,
  deleteBlogPostAction,
  duplicateBlogPostAction,
} from "@/lib/blog-actions";

type Locale = "fr" | "en";

export function AdminBlogPostRowActions({
  id,
  slug,
  locale,
  published,
  isFeatured,
  canPublish,
  canFeatured,
  canDelete,
  canDuplicate,
}: {
  id: string;
  slug: string;
  locale: Locale;
  published: boolean;
  isFeatured: boolean;
  canPublish: boolean;
  canFeatured: boolean;
  canDelete: boolean;
  canDuplicate: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await callAction(formData);
      if (res?.error) {
        setError(res.error ?? "Erreur inconnue");
        return;
      }
      router.refresh();
    });
  }

  async function callAction(formData: FormData) {
    const action = formData.get("__action") as string;
    if (action === "publish") return publishBlogPostAction(formData);
    if (action === "unpublish") return unpublishBlogPostAction(formData);
    if (action === "featured") return toggleBlogFeaturedAction(formData);
    if (action === "delete") return deleteBlogPostAction(formData);
    if (action === "duplicate") return duplicateBlogPostAction(formData);
    return { error: `Unknown action: ${action}` };
  }

  function onDuplicate() {
    const target: Locale = locale === "fr" ? "en" : "fr";
    const fd = new FormData();
    fd.append("__action", "duplicate");
    fd.append("id", id);
    fd.append("newLocale", target);
    startTransition(async () => {
      const res = await duplicateBlogPostAction(fd);
      if ("error" in res) {
        setError(res.error ?? "Erreur inconnue");
        return;
      }
      router.push(`/admin/blog/${res.id}/traduire`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link
        href={`/admin/blog/${id}`}
        className="inline-flex items-center gap-1.5 rounded-md bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider"
      >
        Éditer
      </Link>

      {canPublish ? (
        <button
          type="button"
          onClick={() => {
            const fd = new FormData();
            fd.append("__action", published ? "unpublish" : "publish");
            fd.append("id", id);
            run(fd);
          }}
          disabled={pending}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider transition-colors disabled:opacity-60 ${
            published
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              : "bg-sand-deep text-graphite hover:bg-sand-deep/70"
          }`}
        >
          {published ? "Publié" : "Brouillon"}
        </button>
      ) : null}

      {canFeatured ? (
        <button
          type="button"
          onClick={() => {
            const fd = new FormData();
            fd.append("__action", "featured");
            fd.append("id", id);
            run(fd);
          }}
          disabled={pending}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider transition-colors disabled:opacity-60 ${
            isFeatured
              ? "bg-sunrise-orange/20 text-sunrise-amber hover:bg-sunrise-orange/30"
              : "bg-sand-deep text-graphite hover:bg-sand-deep/70"
          }`}
        >
          {isFeatured ? "★ À la une" : "À la une"}
        </button>
      ) : null}

      {canDuplicate ? (
        <button
          type="button"
          onClick={onDuplicate}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md bg-sky/15 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ocean hover:bg-sky/30 transition-colors disabled:opacity-60"
          title={`Dupliquer vers ${locale === "fr" ? "EN" : "FR"}`}
        >
          Dupliquer
        </button>
      ) : null}

      {canDelete ? (
        <button
          type="button"
          onClick={() => {
            if (!confirm(`Supprimer définitivement "${slug}" ?`)) return;
            const fd = new FormData();
            fd.append("__action", "delete");
            fd.append("id", id);
            run(fd);
          }}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md bg-sunrise-coral/15 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-sunrise-coral hover:bg-sunrise-coral/25 transition-colors disabled:opacity-60"
        >
          Supprimer
        </button>
      ) : null}

      {error ? (
        <p className="basis-full text-xs text-sunrise-coral">{error}</p>
      ) : null}
    </div>
  );
}
