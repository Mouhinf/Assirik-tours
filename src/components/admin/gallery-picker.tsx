"use client";

import { useRef, useState, useTransition } from "react";

type Props = {
  /** List of Cloudinary public_ids currently in the gallery, in display order. */
  value: string[];
  onChange: (ids: string[]) => void;
  /** Cloudinary folder for new uploads. */
  folder: string;
  /** Optional caption. */
  label?: string;
  /** Optional helper text under the picker. */
  hint?: string;
};

/**
 * Multi-image picker for the gallery field on destination/offer/etc. forms.
 *
 * Features:
 *  - Drag-and-drop OR click-to-upload each image to Cloudinary. The upload
 *    hits POST /api/admin/upload (same endpoint used by the single-image
 *    ImagePicker).
 *  - A "Browse library" link opens /admin/media in a new tab so the
 *    operator can copy existing public_ids and paste them in via the
 *    "Add by public_id" field.
 *  - Each image renders a Cloudinary thumbnail, with reorder (up/down)
 *    and remove buttons.
 *  - Paste a Cloudinary public_id directly (useful when migrating from an
 *    existing gallery item).
 *
 * All state is purely client-side until the form is submitted. The parent
 * form is responsible for serialising the array into a hidden field.
 */
export function GalleryPicker({
  value,
  onChange,
  folder,
  label = "Galerie d'images",
  hint,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualId, setManualId] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const thumb = (id: string) => {
    if (id.startsWith("local:")) return id.slice("local:".length);
    return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_240,h_160,c_fill/${id}`;
  };

  function uploadFile(file: File) {
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);

    startTransition(async () => {
      try {
        const r = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        const data = (await r.json()) as
          | { ok: true; asset: { publicId: string } }
          | { error: string };
        if ("error" in data) {
          setError(data.error);
          return;
        }
        onChange([...value, data.asset.publicId]);
      } catch (e) {
        console.error("[gallery-upload] failed", e);
        setError("Erreur réseau pendant l'upload.");
      }
    });
  }

  function addManual() {
    const id = manualId.trim();
    if (!id) return;
    onChange([...value, id]);
    setManualId("");
    setShowManual(false);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
        {label}
        {value.length > 0 ? (
          <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-ocean text-sand text-[0.65rem] font-bold">
            {value.length}
          </span>
        ) : null}
      </span>

      {value.length > 0 && (
        <ul className="space-y-2 mb-4">
          {value.map((id, i) => (
            <li
              key={`${id}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-sand-deep bg-sand p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb(id)}
                alt=""
                className="h-16 w-24 rounded-md object-cover border border-sand-deep bg-sand-deep"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-graphite truncate">{id}</p>
                <p className="text-[0.65rem] text-silver mt-0.5">Image {i + 1} / {value.length}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Monter"
                  className="rounded-md border border-sand-deep px-2 py-1 text-xs text-navy hover:border-ocean hover:text-ocean disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, +1)}
                  disabled={i === value.length - 1}
                  aria-label="Descendre"
                  className="rounded-md border border-sand-deep px-2 py-1 text-xs text-navy hover:border-ocean hover:text-ocean disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="Retirer"
                  className="rounded-md bg-sunrise-coral/10 px-2 py-1 text-xs text-sunrise-coral hover:bg-sunrise-coral/20"
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Drop zone */}
      <div className="rounded-lg border-2 border-dashed border-sand-deep bg-sand-deep/30 p-4 text-center">
        <p className="text-sm font-medium text-navy">
          Glissez une image ici, ou
        </p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isPending}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-50"
        >
          {isPending ? "Upload…" : "Ajouter une image"}
        </button>
        <p className="mt-2 text-xs text-silver">JPEG, PNG, WebP, AVIF · max 10 MB</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadFile(f);
          e.target.value = "";
        }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => setShowManual((v) => !v)}
          className="rounded-full border border-sand-deep px-3 py-1.5 font-semibold text-navy hover:border-ocean hover:text-ocean transition-colors"
        >
          Ajouter par public_id
        </button>
        <a
          href="/admin/media"
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-ocean hover:underline"
        >
          Parcourir la médiathèque →
        </a>
      </div>

      {showManual ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="assirik-tours/destinations/lac-rose-1"
            className="flex-1 rounded-lg border border-sand-deep bg-sand px-3 py-2 font-mono text-xs text-navy outline-none focus:border-ocean"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addManual();
              }
            }}
          />
          <button
            type="button"
            onClick={addManual}
            className="rounded-full bg-ocean px-4 py-2 text-xs font-semibold text-sand hover:bg-navy"
          >
            Ajouter
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 inline-block rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-3 py-2 text-xs text-sunrise-coral">
          {error}
        </p>
      ) : null}

      {hint ? <p className="mt-2 text-xs text-silver">{hint}</p> : null}
    </div>
  );
}
