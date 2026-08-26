import { type ClassValue, clsx } from "clsx";

/**
 * Classname helper. Lightweight — no twMerge dependency to keep install lean.
 * Add `tailwind-merge` later if conflicting utilities become a problem.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a price in FCFA with thousand separators. */
export function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Build a Cloudinary URL with sensible defaults (f_auto, q_auto). */
export function cloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: "fill" | "fit" | "limit" } = {},
) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return "";
  const { width, height, crop = "limit" } = options;
  const transforms = [
    "f_auto",
    "q_auto",
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
    `c_${crop}`,
  ]
    .filter(Boolean)
    .join(",");
  return `https://res.cloudinary.com/${cloud}/image/upload/${transforms}/${publicId}`;
}