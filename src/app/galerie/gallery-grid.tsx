"use client";

import { useEffect, useRef, useState } from "react";
import type { DestinationRegion } from "@prisma/client";

type Item = {
  id: string;
  cloudinaryId: string;
  altText: string;
  captionFr: string | null;
  captionEn: string | null;
  location: string | null;
  region: DestinationRegion | null;
  width: number | null;
  height: number | null;
};

type FeaturedItem = {
  id: string;
  cloudinaryId: string;
  altText: string;
  captionFr: string | null;
  location: string | null;
};

type Props = {
  items: Item[];
  featured: FeaturedItem[];
  featuredCount: number;
  restCount: number;
  regionLabels: Record<DestinationRegion, string>;
  buildSrc: (publicId: string, width: number) => string;
};

export function GalleryGrid({
  items,
  featured,
  featuredCount,
  restCount,
  regionLabels,
  buildSrc,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const active = activeId ? items.find((it) => it.id === activeId) ?? null : null;
  const activeIndex = active ? items.findIndex((it) => it.id === active.id) : -1;

  function open(id: string) {
    setActiveId(id);
  }
  function close() {
    setActiveId(null);
  }
  function navigate(delta: -1 | 1) {
    if (activeIndex < 0) return;
    const nextIdx = (activeIndex + delta + items.length) % items.length;
    setActiveId(items[nextIdx].id);
  }

  // Sync dialog open/close with state
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (activeId && !dlg.open) {
      dlg.showModal();
    } else if (!activeId && dlg.open) {
      dlg.close();
    }
  }, [activeId]);

  // Keyboard nav when lightbox is open
  useEffect(() => {
    if (!activeId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, activeIndex]);

  return (
    <>
      {/* Featured bandeau */}
      {featuredCount > 0 ? (
        <section
          aria-label="Photos à la une"
          className="container-narrow pb-10"
        >
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(featuredCount, 4)}, minmax(0, 1fr))`,
            }}
          >
            {featured.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => open(f.id)}
                className={`group relative overflow-hidden rounded-xl bg-sand-deep text-left transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean ${
                  i === 0 && featuredCount > 1 ? "col-span-2 row-span-2" : ""
                }`}
                style={{ aspectRatio: i === 0 && featuredCount > 1 ? "1/1" : "4/3" }}
                aria-label={`Ouvrir ${f.altText}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={buildSrc(f.cloudinaryId, 800)}
                  alt={f.altText}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-sunrise-orange/90 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-white">
                  ★ À la une
                </span>
                {(f.captionFr || f.location) ? (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent px-3 py-2 text-xs text-sand">
                    <span className="font-semibold block truncate">
                      {f.captionFr || f.altText}
                    </span>
                    {f.location ? (
                      <span className="text-[0.65rem] text-mist/80 truncate block">
                        {f.location}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* Masonry grid (CSS columns + preserve ratio) */}
      <section className="container-narrow pb-20">
        <p className="mb-3 text-xs text-silver">
          {restCount > 0
            ? `${restCount} photo${restCount > 1 ? "s" : ""}`
            : "Galerie en construction"}
        </p>
        <div className="masonry gap-3" data-testid="gallery-masonry">
          {items.map((it) => {
            const ratio = it.width && it.height ? `${it.width} / ${it.height}` : "4 / 3";
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => open(it.id)}
                className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl bg-sand-deep text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                aria-label={`Ouvrir ${it.altText}`}
              >
                <div className="relative w-full" style={{ aspectRatio: ratio }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={buildSrc(it.cloudinaryId, 600)}
                    alt={it.altText}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {(it.captionFr || it.location) ? (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 to-transparent px-3 py-2 text-xs text-sand opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="block truncate font-semibold">
                        {it.captionFr || it.altText}
                      </span>
                      <span className="block truncate text-[0.65rem] text-mist/80">
                        {it.location}
                        {it.region ? ` · ${regionLabels[it.region]}` : ""}
                      </span>
                    </figcaption>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Lightbox — native <dialog> */}
      <dialog
        ref={dialogRef}
        className="max-h-screen max-w-screen bg-transparent p-0 backdrop:bg-navy/85"
        onClose={() => setActiveId(null)}
      >
        {active ? (
          <div className="relative mx-auto flex h-screen w-screen items-center justify-center p-4 md:p-8">
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-navy hover:bg-white"
              aria-label="Fermer la lightbox"
            >
              <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-navy hover:bg-white"
                  aria-label="Photo précédente"
                >
                  <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-navy hover:bg-white"
                  aria-label="Photo suivante"
                >
                  <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
            <figure className="relative max-h-[88vh] max-w-[92vw] overflow-hidden rounded-2xl bg-sand shadow-lift">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={buildSrc(active.cloudinaryId, 1600)}
                alt={active.altText}
                className="block max-h-[88vh] w-auto max-w-[92vw] object-contain"
              />
              {(active.captionFr || active.captionEn || active.location) ? (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/95 to-transparent p-5 text-sand">
                  {active.captionFr ? (
                    <p className="text-sm font-semibold">{active.captionFr}</p>
                  ) : null}
                  {active.captionEn ? (
                    <p className="text-xs text-mist/85">{active.captionEn}</p>
                  ) : null}
                  <p className="mt-1 text-[0.7rem] text-mist/70">
                    {active.location}
                    {active.region ? ` · ${regionLabels[active.region]}` : ""}
                  </p>
                </figcaption>
              ) : null}
            </figure>
          </div>
        ) : null}
      </dialog>

      <style>{`
        @media (min-width: 768px) {
          [data-testid="gallery-masonry"] { column-count: 3; }
        }
        @media (min-width: 1280px) {
          [data-testid="gallery-masonry"] { column-count: 4; }
        }
      `}</style>
    </>
  );
}
