/**
 * Blog content adapter — the data used to live as TypeScript constants in
 * this file. It now reads from the `BlogPost` table so the back-office can
 * edit articles without a redeploy.
 *
 * The legacy helpers `getBlogPost` and `listBlogPosts` are preserved so
 * older call sites keep working during the migration; the admin pages
 * prefer the server actions and the prisma client directly.
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import { deliveryUrl } from "@/lib/cloudinary-url";

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

/** Public-facing list — only published French posts. */
export async function listBlogPosts(): Promise<BlogPost[]> {
  return prisma.blogPost.findMany({
    where: { locale: "fr", publishedAt: { not: null } },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  });
}

/** Get a published FR post by slug (404 if missing or unpublished). */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const row = await prisma.blogPost.findUnique({
    where: { slug_locale: { slug, locale: "fr" } },
  });
  if (!row || !row.publishedAt) return null;
  return row;
}

/** Render the cover image URL — handles local fallback (prefix `local:`). */
export function resolveBlogCover(coverImageId: string, opts: { width?: number } = {}): string {
  if (coverImageId.startsWith("local:")) {
    return coverImageId.slice("local:".length);
  }
  return deliveryUrl(coverImageId, { width: opts.width ?? 1280, crop: "fill" });
}

/** Slugs for generateStaticParams (FR only for now). */
export async function listBlogSlugs(): Promise<string[]> {
  const rows = await prisma.blogPost.findMany({
    where: { locale: "fr", publishedAt: { not: null } },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
