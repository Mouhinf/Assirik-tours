import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://assiriktours.sn";

/**
 * Dynamic robots.txt. Next.js prefers this over a static `public/robots.txt`
 * when both exist; we delete the static one in this same change to keep the
 * source of truth in code.
 *
 * Notes:
 *  - `/admin/*`, `/api/*`, `/espace-client/*` and `/espace-client` are
 *    disallowed for all user agents. The static file used to use a trailing
 *    slash (`/espace-client/`) which let `/espace-client` (no slash) be
 *    crawled; the pattern below closes that gap.
 *  - `Googlebot` inherits the same rules — we deliberately do NOT widen
 *    permissions for Googlebot.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/*", "/api", "/api/*", "/espace-client", "/espace-client/*", "/paiement/*"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
