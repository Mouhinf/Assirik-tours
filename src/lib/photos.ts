/**
 * Image resolver — chooses between Cloudinary (when heroImageId is set
 * on the row) and a curated local fallback (in /public/photos).
 *
 * Centralised so every destination/offer card renders the same way.
 */
const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export type ImageOpts = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit";
};

export function resolveImage(
  publicId: string | null | undefined,
  fallback: string,
  opts: ImageOpts = {},
): string {
  const { width, height, crop = "fill" } = opts;

  if (publicId && CLOUDINARY_CLOUD) {
    const transforms = [
      "f_auto",
      "q_auto",
      width ? `w_${width}` : null,
      height ? `h_${height}` : null,
      `c_${crop}`,
    ]
      .filter(Boolean)
      .join(",");
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${transforms}/${publicId}`;
  }

  if (publicId) {
    // Cloudinary not configured yet — fall through to local.
    // In production this branch shouldn't be hit because uploads go via Cloudinary.
  }

  // Local fallback — served by Next from /public.
  const url = new URL(fallback, "http://placeholder.local");
  if (width) url.searchParams.set("w", String(width));
  if (height) url.searchParams.set("h", String(height));
  // Just return the path (Next will serve /public files directly).
  const path = url.pathname;
  return path === "/placeholder.local" ? fallback : path + (url.search || "");
}

/**
 * Curated fallback photos per region. Matches the assets generated and
 * stored under /public/photos/destinations/.
 */
export const FALLBACK_BY_SLUG: Record<string, string> = {
  "lac-rose": "/photos/destinations/lac-rose.jpg",
  "goree": "/photos/destinations/goree.jpg",
  "casamance": "/photos/destinations/casamance.jpg",
  "saly-portudal": "/photos/destinations/saly.jpg",
  "lompoul": "/photos/destinations/lompoul.jpg",
  "saint-louis": "/photos/destinations/saint-louis.jpg",
  "dakar": "/photos/destinations/dakar.jpg",
  "omra": "/photos/destinations/omra.jpg",
  "maroc": "/photos/destinations/maroc.jpg",
  "turquie": "/photos/destinations/turquie.jpg",
  "dubai": "/photos/destinations/dubai.jpg",
};

export const OG_FALLBACK = "/photos/og/og-default.jpg";
