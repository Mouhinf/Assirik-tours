"use client";

import { useEffect, useState, useTransition } from "react";
import { uploadImageAction, deleteImageAction } from "@/lib/media-actions";
import { deliveryUrl } from "@/lib/cloudinary-url";

type Asset = {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  folder?: string;
};

export function MediaUploader({
  folder = "assirik-tours/general",
  onUploaded,
}: {
  folder?: string;
  onUploaded?: (asset: Asset) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);

  function onFile(file: File) {
    setError(null);
    setPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);

    startTransition(async () => {
      const res = await uploadImageAction(fd);
      if (res.error) {
        setError(res.error);
        setPreview(null);
        return;
      }
      if (res.ok && onUploaded) onUploaded(res.asset);
      // keep preview shown — the gallery below will render the new asset
    });
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="rounded-xl border-2 border-dashed border-sand-deep bg-sand-deep/30 p-6 text-center">
      <p className="text-sm font-medium text-navy">
        Glissez une image ici, ou
      </p>
      <label className="mt-3 inline-block">
        <span className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors">
          {isPending ? "Upload…" : "Choisir un fichier"}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </label>
      <p className="mt-3 text-xs text-silver">JPEG, PNG, WebP, AVIF · max 10 MB</p>

      {preview && (
        <div className="mt-5 mx-auto max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt=""
            className="w-full h-auto rounded-lg border border-sand-deep"
          />
          {isPending && (
            <p className="mt-2 text-xs text-graphite">Upload en cours…</p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 inline-block rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-3 py-2 text-sm text-sunrise-coral">
          {error}
        </p>
      )}
    </div>
  );
}

export function MediaGallery({
  assets,
}: {
  assets: Array<{
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    folder?: string;
  }>;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (assets.length === 0) {
    return (
      <p className="text-sm text-silver text-center py-8">
        Aucun média pour l'instant.
      </p>
    );
  }

  function onDelete(publicId: string) {
    if (!confirm("Supprimer définitivement ? Cette opération est irréversible.")) return;
    setDeletingId(publicId);
    const fd = new FormData();
    fd.append("publicId", publicId);
    startTransition(async () => {
      await deleteImageAction(fd);
      setDeletingId(null);
      window.location.reload();
    });
  }

  function onCopy(publicId: string) {
    navigator.clipboard.writeText(publicId);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {assets.map((a) => (
        <div
          key={a.public_id}
          className="group relative rounded-lg overflow-hidden bg-sand-deep aspect-square"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.secure_url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-sand">
            <p className="text-[0.7rem] font-mono truncate">{a.public_id}</p>
            <p className="text-[0.65rem] text-mist/70">
              {a.width}×{a.height} · {Math.round((a.bytes ?? 0) / 1024)} KB
            </p>
            <div className="mt-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => onCopy(a.public_id)}
                className="text-[0.7rem] bg-white/15 hover:bg-white/25 rounded px-2 py-1"
              >
                Copier ID
              </button>
              <button
                type="button"
                onClick={() => onDelete(a.public_id)}
                disabled={deletingId === a.public_id}
                className="text-[0.7rem] bg-sunrise-coral/80 hover:bg-sunrise-coral rounded px-2 py-1 disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

void deliveryUrl; // exported for use in pickers