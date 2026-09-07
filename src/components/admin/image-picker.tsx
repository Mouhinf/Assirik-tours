"use client";

import { useEffect, useRef, useState, useTransition } from "react";

export type ImagePickerAsset = {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  folder?: string;
};

type Props = {
  /** Current value (Cloudinary public_id, or "local:/..." for local fallback). */
  value: string;
  /** Called with the new public_id after upload, or empty string when cleared. */
  onChange: (publicId: string) => void;
  /** Cloudinary folder (server-side enforced). */
  folder: string;
  /** Label shown above the picker. */
  label?: string;
  /** Width / height preset for the preview card. */
  previewWidth?: number;
  previewHeight?: number;
  /** crop when rendering the preview (matches the public site rendering). */
  previewCrop?: "fill" | "fit" | "limit";
  /** Optional helper text shown under the picker. */
  hint?: string;
};

/**
 * Unified image picker used across all admin forms. Combines:
 *  - Live preview of the currently-set image (rendered via the Cloudinary
 *    CDN with f_auto,q_auto so the preview matches what the public site shows).
 *  - Drag-and-drop upload to Cloudinary via `uploadImageAction`. The server
 *    enforces MIME type, size limit, and folder path.
 *  - A "Browse library" link to /admin/media where existing assets are listed.
 *  - An optional fallback URL paste — useful for switching to a previously
 *    uploaded asset by public_id.
 *
 * State is purely client-side until the form is submitted: the picker does
 * NOT mutate any DB row by itself. The `onChange` callback just updates the
 * parent form's controlled state.
 */
export function ImagePicker({
  value,
  onChange,
  folder,
  label = "Image",
  previewWidth = 240,
  previewHeight = 160,
  previewCrop = "fill",
  hint,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [manualId, setManualId] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const publicSrc = value && !value.startsWith("local:")
    ? `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_${previewWidth},h_${previewHeight},c_${previewCrop}/${value}`
    : null;
  const localSrc = value && value.startsWith("local:") ? value.slice("local:".length) : null;

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  function uploadFile(file: File) {
    setError(null);
    setLocalPreview(URL.createObjectURL(file));
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
          | { ok: true; asset: ImagePickerAsset }
          | { error: string };
        if ("error" in data) {
          setError(data.error);
          setLocalPreview(null);
          return;
        }
        onChange(data.asset.publicId);
        setLocalPreview(null);
      } catch (e) {
        console.error("[upload] failed", e);
        setError("Erreur réseau pendant l'upload.");
        setLocalPreview(null);
      }
    });
  }

  return (
    <div>
      <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
        {label}
      </span>

      {/* Preview */}
      <div
        className={`relative overflow-hidden rounded-lg border-2 border-dashed ${
          isPending ? "border-ocean bg-ocean/5" : "border-sand-deep bg-sand-deep/30"
        } transition-colors`}
        onDragEnter={(e) => {
          e.preventDefault();
          dragCounter.current += 1;
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          dragCounter.current -= 1;
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          dragCounter.current = 0;
          const f = e.dataTransfer.files?.[0];
          if (f) uploadFile(f);
        }}
      >
        {(localPreview || publicSrc || localSrc) ? (
          <div className="flex items-center gap-4 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={localPreview || publicSrc || localSrc || ""}
              alt=""
              className="rounded-lg border border-sand-deep object-cover bg-sand-deep"
              style={{ width: previewWidth, height: previewHeight }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs text-graphite truncate">
                {value || "(en attente d'upload…)"}
              </p>
              {value && !localPreview && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="mt-1 text-xs text-sunrise-coral hover:underline"
                >
                  Retirer
                </button>
              )}
              {isPending && (
                <p className="mt-2 text-xs font-semibold text-ocean">Upload en cours…</p>
              )}
            </div>
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium text-navy">
              Glissez une image ici, ou
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors"
              disabled={isPending}
            >
              {isPending ? "Upload…" : "Choisir un fichier"}
            </button>
            <p className="mt-3 text-xs text-silver">JPEG, PNG, WebP, AVIF · max 10 MB</p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadFile(f);
          e.target.value = "";
        }}
      />

      {/* Footer actions */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="rounded-full border border-sand-deep px-3 py-1.5 font-semibold text-navy hover:border-ocean hover:text-ocean transition-colors disabled:opacity-50"
        >
          {value ? "Remplacer" : "Uploader"}
        </button>
        <button
          type="button"
          onClick={() => setShowManualPaste((v) => !v)}
          className="rounded-full border border-sand-deep px-3 py-1.5 font-semibold text-navy hover:border-ocean hover:text-ocean transition-colors"
        >
          Coller un public_id
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

      {showManualPaste ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="ex: assirik-tours/destinations/casamance-hero"
            className="flex-1 rounded-lg border border-sand-deep bg-sand px-3 py-2 font-mono text-xs text-navy outline-none focus:border-ocean"
          />
          <button
            type="button"
            onClick={() => {
              if (manualId.trim()) {
                onChange(manualId.trim());
                setManualId("");
                setShowManualPaste(false);
              }
            }}
            className="rounded-full bg-ocean px-4 py-2 text-xs font-semibold text-sand hover:bg-navy"
          >
            Utiliser
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
