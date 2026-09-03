/**
 * Blog content adapter — the data used to live as TypeScript constants in
 * this file. It now reads from the `BlogPost` table so the back-office can
 * edit articles without a redeploy.
 *
 * Locale is read from the i18n cookie via `getLocaleCookie()`. When no
 * article exists in the requested locale, the public site falls back to
 * French before giving up (handled by the page, not here).
 */
import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { deliveryUrl } from "@/lib/cloudinary-url";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

export type BlogPost = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  excerpt: string;
  body: string;
  coverImageId: string;
  category: string | null;
  tags: string[];
  readingTime: number | null;
  publishedAt: Date | null;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
};

async function readLocale(): Promise<Locale> {
  try {
    const c = await cookies();
    const v = c.get("ass_locale")?.value ?? c.get("locale")?.value;
    return isLocale(v) ? v : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export async function listBlogPosts(): Promise<BlogPost[]> {
  const locale = await readLocale();
  const primary = await prisma.blogPost.findMany({
    where: { locale, publishedAt: { not: null } },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  });
  if (primary.length > 0 || locale === DEFAULT_LOCALE) return primary;
  // Fallback to FR when the requested locale has no articles yet.
  return prisma.blogPost.findMany({
    where: { locale: DEFAULT_LOCALE, publishedAt: { not: null } },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  });
}

/** Get a published post by slug, honoring the current locale (with FR fallback). */
export async function getBlogPost(slug: string): Promise<{ post: BlogPost; locale: Locale } | null> {
  const locale = await readLocale();
  const row = await prisma.blogPost.findUnique({
    where: { slug_locale: { slug, locale } },
  });
  if (row && row.publishedAt) return { post: row, locale };
  if (locale !== DEFAULT_LOCALE) {
    const fallback = await prisma.blogPost.findUnique({
      where: { slug_locale: { slug, locale: DEFAULT_LOCALE } },
    });
    if (fallback && fallback.publishedAt) return { post: fallback, locale };
  }
  return null;
}

/** Render the cover image URL — handles local fallback (prefix `local:`). */
export function resolveBlogCover(coverImageId: string, opts: { width?: number } = {}): string {
  if (coverImageId.startsWith("local:")) {
    return coverImageId.slice("local:".length);
  }
  return deliveryUrl(coverImageId, { width: opts.width ?? 1280, crop: "fill" });
}

/** Slugs for generateStaticParams (all published locales). */
export async function listBlogSlugs(): Promise<string[]> {
  const rows = await prisma.blogPost.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true },
  });
  // Dedupe — same slug may exist in multiple locales.
  return Array.from(new Set(rows.map((r) => r.slug)));
}
