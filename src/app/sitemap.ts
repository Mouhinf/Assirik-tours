import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://assiriktours.sn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [destinations, offers, posts] = await Promise.all([
    prisma.destination.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.offer.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, locale: true, updatedAt: true },
    }),
  ]);

  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0, alternates: { languages: { "fr-FR": `${SITE_URL}/`, "en-US": `${SITE_URL}/` } } },
    { url: `${SITE_URL}/destinations`, lastModified: now, changeFrequency: "weekly", priority: 0.9, alternates: { languages: { "fr-FR": `${SITE_URL}/destinations`, "en-US": `${SITE_URL}/destinations` } } },
    { url: `${SITE_URL}/offres`, lastModified: now, changeFrequency: "daily", priority: 0.9, alternates: { languages: { "fr-FR": `${SITE_URL}/offres`, "en-US": `${SITE_URL}/offres` } } },
    { url: `${SITE_URL}/billetterie`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: { languages: { "fr-FR": `${SITE_URL}/services`, "en-US": `${SITE_URL}/services` } } },
    { url: `${SITE_URL}/a-propos`, lastModified: now, changeFrequency: "monthly", priority: 0.6, alternates: { languages: { "fr-FR": `${SITE_URL}/a-propos`, "en-US": `${SITE_URL}/a-propos` } } },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7, alternates: { languages: { "fr-FR": `${SITE_URL}/blog`, "en-US": `${SITE_URL}/blog` } } },
    { url: `${SITE_URL}/galerie`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/temoignages`, lastModified: now, changeFrequency: "weekly", priority: 0.7, alternates: { languages: { "fr-FR": `${SITE_URL}/temoignages`, "en-US": `${SITE_URL}/temoignages` } } },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const destinationPages: MetadataRoute.Sitemap = destinations.map((d) => ({
    url: `${SITE_URL}/destinations/${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const offerPages: MetadataRoute.Sitemap = offers.map((o) => ({
    url: `${SITE_URL}/offres/${o.slug}`,
    lastModified: o.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // One entry per published article, deduped by slug. Both locales point to
  // the same URL (no separate /en/blog/<slug> yet), with hreflang hints.
  const blogPages: MetadataRoute.Sitemap = (() => {
    const bySlug = new Map<string, { updatedAt: Date }>();
    for (const p of posts) {
      const existing = bySlug.get(p.slug);
      if (!existing || p.updatedAt > existing.updatedAt) {
        bySlug.set(p.slug, { updatedAt: p.updatedAt });
      }
    }
    return Array.from(bySlug.entries()).map(([slug, { updatedAt }]) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: {
        languages: {
          "fr-FR": `${SITE_URL}/blog/${slug}`,
          "en-US": `${SITE_URL}/blog/${slug}`,
        },
      },
    }));
  })();

  return [...staticPages, ...destinationPages, ...offerPages, ...blogPages];
}
