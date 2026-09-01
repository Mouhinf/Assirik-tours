"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadGalleryImageAction } from "@/lib/gallery-actions";

type Uploaded = {
  id: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

type Failed = { name: string; reason: string };

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function GalleryBulkUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
    current: string | null;
  } | null>(null);
  const [results, setResults] = useState<{
    uploaded: Uploaded[];
    failed: Failed[];
  }>({ uploaded: [], failed: [] });
  const [error, setError] = useState<string | null>(null);

  function runUpload(files: File[]) {
    setError(null);
    setResults({ uploaded: [], failed: [] });
    setProgress({ done: 0, total: files.length, current: null });

    let cancelled = false;

    startTransition(async () => {
      const uploaded: Uploaded[] = [];
      const failed: Failed[] = [];
      for (let i = 0; i < files.length; i++) {
        if (cancelled) break;
        const file = files[i];
        setProgress({ done: i, total: files.length, current: file.name });
        if (!ALLOWED.has(file.type)) {
          failed.push({ name: file.name, reason: "Format non supporté" });
          continue;
        }
        if (file.size > 12 * 1024 * 1024) {
          failed.push({ name: file.name, reason: "Trop lourd (max 12 MB)" });
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        try {
          const res = await uploadGalleryImageAction(fd);
          if ("error" in res) {
            failed.push({ name: file.name, reason: res.error ?? "Erreur inconnue" });
          } else {
            uploaded.push(res.asset);
          }
        } catch (e) {
          failed.push({
            name: file.name,
            reason: e instanceof Error ? e.message : "Erreur inconnue",
          });
        }
      }
      setProgress({ done: files.length, total: files.length, current: null });
      setResults({ uploaded, failed });
      if (uploaded.length > 0) router.refresh();
    });

    return () => {
      cancelled = true;
    };
  }

  function onFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);
    if (files.length === 0) return;
    runUpload(files);
  }

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-ocean bg-ocean/10"
            : "border-sand-deep bg-sand-deep/30"
        }`}
      >
        <p className="text-base font-semibold text-navy">
          Glissez-déposez vos photos ici
        </p>
        <p className="mt-1 text-sm text-graphite">
          ou utilisez le bouton — uploads parallèles limités à 1 par fichier pour
          respecter les quotas Cloudinary.
        </p>
        <label className="mt-4 inline-block">
          <span className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-3 text-sm font-semibold text-sand hover:bg-navy transition-colors">
            {isPending ? "Upload en cours…" : "Sélectionner des fichiers"}
          </span>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <p className="mt-3 text-xs text-silver">
          JPEG, PNG, WebP, AVIF · 12 MB par fichier max
        </p>
      </div>

      {progress && progress.total > 0 && (
        <div className="rounded-xl border border-sand-deep bg-sand p-4">
          <div className="flex items-center justify-between text-sm text-navy">
            <span>
              {progress.done < progress.total
                ? `Upload ${progress.done}/${progress.total}`
                : `${progress.total} fichier(s) traité(s)`}
              {progress.current ? ` · ${progress.current}` : ""}
            </span>
            {progress.done === progress.total ? null : (
              <span className="text-silver">…</span>
            )}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-sand-deep">
            <div
              className="h-full bg-ocean transition-all"
              style={{
                width: `${(progress.done / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
          {error}
        </p>
      )}

      {results.uploaded.length > 0 && (
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">
            ✓ {results.uploaded.length} photo(s) envoyée(s) — vous pouvez maintenant
            les éditer pour ajouter légende, alt text et tags.
          </p>
        </div>
      )}

      {results.failed.length > 0 && (
        <div className="rounded-xl border border-sunrise-coral/40 bg-sunrise-coral/10 p-4 space-y-2">
          <p className="text-sm font-semibold text-sunrise-coral">
            ✗ {results.failed.length} échec(s) :
          </p>
          <ul className="space-y-1 text-xs text-sunrise-amber">
            {results.failed.map((f, i) => (
              <li key={i}>
                <span className="font-mono">{f.name}</span> — {f.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
