"use client";

import { useState, useTransition } from "react";

export function ShareLinkButton({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  function onClick() {
    const fullUrl =
      typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        // Fallback: prompt with the URL so the user can copy manually.
        window.prompt("Copier l'URL :", fullUrl);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-full border border-sand-deep bg-sand px-4 py-2 text-sm font-semibold text-graphite hover:text-navy transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          width={14}
          height={14}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {copied ? "Lien copié ✓" : "Copier le lien"}
      </button>
      <span className="text-xs text-silver">
        Partager : <span className="font-mono">{path}</span>
        <span className="ml-1 text-graphite">— {title}</span>
      </span>
    </div>
  );
}
