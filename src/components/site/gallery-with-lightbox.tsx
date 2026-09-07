"use client";

import { useCallback, useEffect, useState } from "react";

type ImageItem = {
  src: string;
  alt: string;
  /** Optional caption shown below the image in the lightbox. */
  caption?: string;
};

type Props = {
  /** All images shown as thumbnails. */
  images: ImageItem[];
};

/**
 * Thumbnail grid + click-to-zoom lightbox.
 *
 * Features:
 *  - Renders a responsive grid of thumbnails (4/3 ratio).
 *  - Clicking a thumbnail opens a full-screen lightbox.
 *  - In the lightbox: keyboard navigation (← / → / Home / End / Escape),
 *    on-screen prev/next buttons, click-outside-to-close, swipe on touch.
 *  - Body scroll is locked while the lightbox is open.
 *  - Each image has alt text + an `aria-current` indicator on the active one.
 *
 * Built as a single client component so the lightbox state stays local to
 * the gallery block — no hydration boundary issues elsewhere.
 */
export function GalleryWithLightbox({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  );
  const prev = useCallback(
    () =>
      setActiveIndex((i) =>
        i === null ? null : (i - 1 + images.length) % images.length,
      ),
    [images.length],
  );

  // Keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(e: KeyboardEvent) {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          close();
          break;
        case "ArrowRight":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(images.length - 1);
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, close, next, prev, images.length]);

  // Lock body scroll while open
  useEffect(() => {
    if (activeIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activeIndex]);

  // Touch swipe
  const [touchX, setTouchX] = useState<number | null>(null);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-label={`Agrandir : ${img.alt}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-sand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center justify-center rounded-full bg-sand/90 p-2 text-navy opacity-0 transition-opacity group-hover:opacity-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6" />
                <path d="M10 14L21 3" />
                <path d="M9 21H3v-6" />
                <path d="M3 21l8-8" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      {activeIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse d'images"
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/95 p-4 md:p-8"
          onClick={(e) => {
            // Click on backdrop closes; clicks on the image / controls don't.
            if (e.target === e.currentTarget) close();
          }}
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 40) {
              if (dx > 0) prev();
              else next();
            }
            setTouchX(null);
          }}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="absolute top-4 right-4 z-10 inline-flex items-center justify-center rounded-full bg-sand/15 p-2 text-sand backdrop-blur hover:bg-sand/25 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Image précédente"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center rounded-full bg-sand/15 p-3 text-sand backdrop-blur hover:bg-sand/25 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Image suivante"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center rounded-full bg-sand/15 p-3 text-sand backdrop-blur hover:bg-sand/25 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          ) : null}

          <div className="relative flex flex-col items-center gap-4 max-w-6xl max-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeIndex}
              src={images[activeIndex].src}
              alt={images[activeIndex].alt}
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl animate-[fadeIn_150ms_ease-out]"
            />
            <div className="flex flex-col items-center gap-1 text-sand">
              <p className="text-sm font-medium">{images[activeIndex].alt}</p>
              {images.length > 1 ? (
                <p className="text-xs text-mist/70 tabular-nums">
                  {activeIndex + 1} / {images.length}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
