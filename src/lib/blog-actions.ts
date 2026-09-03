"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-actions";
import { recordAudit } from "@/lib/audit";
import {
  parseBlogForm,
  toBlogData,
  calculateReadingTime,
  BLOG_CATEGORIES,
  type BlogInput,
  type BlogLocale,
} from "@/lib/validators/blog";

/* ── Helpers ────────────────────────────────────────────────────── */

async function ensureUniqueSlug(
  baseSlug: string,
  locale: BlogLocale,
  excludeId?: string,
): Promise<string> {
  let candidate = baseSlug;
  let counter = 2;
  while (true) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug_locale: { slug: candidate, locale } },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
    if (counter > 99) {
      candidate = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
      break;
    }
  }
  return candidate;
}

/* ── Form-driven CRUD ───────────────────────────────────────────── */

export async function saveBlogPostAction(formData: FormData) {
  const session = await requirePermission("blog:write");
  const id = String(formData.get("id") ?? "");
  const parsed = parseBlogForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const data = toBlogData(parsed.data);

  // Enforce slug uniqueness per locale (excluding current row in edit mode)
  const uniqueSlug = await ensureUniqueSlug(data.slug, parsed.data.locale, id || undefined);

  const payload = {
    ...data,
    slug: uniqueSlug,
  };

  if (id) {
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return { error: "Article introuvable." };
    await prisma.blogPost.update({ where: { id }, data: payload });
    await recordAudit({
      userId: session.sub,
      action: "blog.update",
      entity: `blog:${id}`,
      metadata: { slug: payload.slug, locale: payload.locale },
    });
  } else {
    const created = await prisma.blogPost.create({
      data: {
        ...payload,
        authorId: session.sub,
        // Default unpublished unless caller explicitly sets publishedAt
      },
    });
    await recordAudit({
      userId: session.sub,
      action: "blog.create",
      entity: `blog:${created.id}`,
      metadata: { slug: payload.slug, locale: payload.locale },
    });
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

/* ── Delete (super-admin only) ───────────────────────────────────── */

export async function deleteBlogPostAction(formData: FormData) {
  const session = await requirePermission("blog:delete");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };

  const row = await prisma.blogPost.findUnique({ where: { id } });
  if (!row) return { error: "Article introuvable." };

  await prisma.blogPost.delete({ where: { id } });
  await recordAudit({
    userId: session.sub,
    action: "blog.delete",
    entity: `blog:${id}`,
    metadata: { slug: row.slug, locale: row.locale, title: row.title },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${row.slug}`);
  redirect("/admin/blog");
}

/* ── Publish / unpublish ─────────────────────────────────────────── */

export async function publishBlogPostAction(formData: FormData) {
  const session = await requirePermission("blog:publish");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };

  const row = await prisma.blogPost.findUnique({ where: { id } });
  if (!row) return { error: "Article introuvable." };

  const publishedAt = row.publishedAt ?? new Date();
  await prisma.blogPost.update({ where: { id }, data: { publishedAt } });
  await recordAudit({
    userId: session.sub,
    action: "blog.publish",
    entity: `blog:${id}`,
    metadata: { slug: row.slug, locale: row.locale, publishedAt: publishedAt.toISOString() },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${row.slug}`);
  return { ok: true, publishedAt: publishedAt.toISOString() };
}

export async function unpublishBlogPostAction(formData: FormData) {
  const session = await requirePermission("blog:publish");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };

  const row = await prisma.blogPost.findUnique({ where: { id } });
  if (!row) return { error: "Article introuvable." };

  await prisma.blogPost.update({ where: { id }, data: { publishedAt: null } });
  await recordAudit({
    userId: session.sub,
    action: "blog.unpublish",
    entity: `blog:${id}`,
    metadata: { slug: row.slug, locale: row.locale },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${row.slug}`);
  return { ok: true };
}

/* ── Toggle featured (super-admin only) ─────────────────────────── */

export async function toggleBlogFeaturedAction(formData: FormData) {
  const session = await requirePermission("blog:featured");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };
  const row = await prisma.blogPost.findUnique({ where: { id } });
  if (!row) return { error: "Article introuvable." };

  const next = !row.isFeatured;
  await prisma.blogPost.update({ where: { id }, data: { isFeatured: next } });
  await recordAudit({
    userId: session.sub,
    action: "blog.featured.toggle",
    entity: `blog:${id}`,
    metadata: { from: row.isFeatured, to: next, slug: row.slug },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { ok: true, isFeatured: next };
}

/* ── Duplicate (translate to other locale) ───────────────────────── */

export async function duplicateBlogPostAction(formData: FormData) {
  const session = await requirePermission("blog:write");
  const id = String(formData.get("id") ?? "");
  const newLocaleRaw = String(formData.get("newLocale") ?? "");
  if (!id) return { error: "ID manquant." };
  if (newLocaleRaw !== "fr" && newLocaleRaw !== "en") {
    return { error: "Locale cible invalide." };
  }

  const source = await prisma.blogPost.findUnique({ where: { id } });
  if (!source) return { error: "Article source introuvable." };

  // Don't duplicate onto the same locale
  if (source.locale === newLocaleRaw) {
    return { error: "L'article est déjà dans cette langue." };
  }

  const targetSlug = await ensureUniqueSlug(source.slug, newLocaleRaw as BlogLocale);
  const created = await prisma.blogPost.create({
    data: {
      slug: targetSlug,
      locale: newLocaleRaw,
      title: source.title,
      excerpt: source.excerpt,
      body: source.body,
      coverImageId: source.coverImageId,
      authorId: session.sub,
      category: source.category,
      tags: source.tags,
      readingTime: source.readingTime,
      publishedAt: null, // Start as a draft for translation
      isFeatured: false,
      seoMeta: source.seoMeta as never,
    },
  });

  await recordAudit({
    userId: session.sub,
    action: "blog.duplicate",
    entity: `blog:${created.id}`,
    metadata: { fromId: source.id, fromLocale: source.locale, newLocale: newLocaleRaw },
  });

  revalidatePath("/admin/blog");
  return { ok: true, id: created.id };
}

/* ── Pure functions — usable from server scripts ────────────────── */

export async function createBlogPost(
  input: BlogInput & { authorId: string; publishedAt?: Date | null; isFeatured?: boolean },
): Promise<{ ok: true; id: string } | { error: string }> {
  const session = await requirePermission("blog:write");
  const uniqueSlug = await ensureUniqueSlug(input.slug, input.locale);
  const created = await prisma.blogPost.create({
    data: {
      ...toBlogData(input),
      slug: uniqueSlug,
      authorId: input.authorId ?? session.sub,
      publishedAt: input.publishedAt ?? null,
      isFeatured: input.isFeatured ?? false,
      seoMeta: toBlogData(input).seoMeta ?? null,
    },
  });
  return { ok: true, id: created.id };
}

/* ── Reading-time recompute (idempotent) ─────────────────────────── */

export async function recomputeReadingTime(id: string) {
  await requirePermission("blog:write");
  const row = await prisma.blogPost.findUnique({ where: { id }, select: { body: true } });
  if (!row) return;
  const minutes = calculateReadingTime(row.body);
  await prisma.blogPost.update({ where: { id }, data: { readingTime: minutes } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export { BLOG_CATEGORIES };
