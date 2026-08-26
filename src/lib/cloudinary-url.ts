/**
 * Client-safe Cloudinary URL builder — does NOT import the cloudinary SDK.
 * Safe to use from client components and the browser.
 */
export function deliveryUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: "fill" | "fit" | "limit" } = {},
) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud || !publicId) return "";
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

/**
 * Direct delivery URL with custom transforms — used for image previews in forms.
 */
export function cloudinaryPreviewUrl(
  publicId: string,
  width: number,
  height: number,
) {
  return deliveryUrl(publicId, { width, height, crop: "fill" });
}