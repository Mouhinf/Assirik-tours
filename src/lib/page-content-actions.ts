"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-actions";
import { recordAudit } from "@/lib/audit";
import { parseBlocks, parseSeoMeta } from "@/lib/validators/page-blocks";
import type { Block } from "@/lib/page-blocks";

export type PageContentInput = {
  slug: string;
  locale: "fr" | "en";
  title: string;
  subtitle: string;
  blocks: Block[];
  seoMeta: {
    title: string;
    description: string;
    ogImage: string;
    keywords: string[];
  };
  isActive: boolean;
};

/* ── Pure read helpers (safe to call from public pages) ─────────── */

export async function getPageContent(
  slug: string,
  locale: "fr" | "en",
): Promise<{
  slug: string;
  locale: string;
  title: string;
  subtitle: string | null;
  blocks: Block[];
  seoMeta: {
    title: string;
    description: string;
    ogImage: string;
    keywords: string[];
  };
  isActive: boolean;
  updatedAt: Date;
} | null> {
  const row = await prisma.pageContent.findUnique({
    where: { slug_locale: { slug, locale } },
  });
  if (!row || !row.isActive) return null;
  const blocks = (Array.isArray(row.blocks) ? row.blocks : []) as Block[];
  const seo = parseSeoMeta(row.seoMeta);
  return {
    slug: row.slug,
    locale: row.locale,
    title: row.title,
    subtitle: row.subtitle,
    blocks,
    seoMeta: seo,
    isActive: row.isActive,
    updatedAt: row.updatedAt,
  };
}

export async function listPageContents() {
  const rows = await prisma.pageContent.findMany({
    orderBy: [{ slug: "asc" }, { locale: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    locale: r.locale,
    title: r.title,
    subtitle: r.subtitle,
    isActive: r.isActive,
    blocksCount: Array.isArray(r.blocks) ? (r.blocks as unknown[]).length : 0,
    updatedAt: r.updatedAt,
  }));
}

/* ── Admin form-driven save ─────────────────────────────────── */

export async function savePageContentAction(formData: FormData) {
  const session = await requirePermission("page:write");
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const localeRaw = String(formData.get("locale") ?? "");
  if (localeRaw !== "fr" && localeRaw !== "en") {
    return { error: "Langue invalide (fr ou en)." };
  }
  if (!slug || !/^[a-z0-9-]{2,40}$/.test(slug)) {
    return { error: "Slug invalide (a-z, 0-9, tirets)." };
  }
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  if (title.length < 1) return { error: "Le titre est requis." };
  const subtitle = String(formData.get("subtitle") ?? "")
    .trim()
    .slice(0, 280);

  let blocksJson: unknown;
  try {
    blocksJson = JSON.parse(String(formData.get("blocks") ?? "[]"));
  } catch {
    return { error: "JSON des blocs invalide." };
  }
  const parsedBlocks = parseBlocks(blocksJson);
  if (!parsedBlocks.ok) return { error: parsedBlocks.error };

  const seoMeta = {
    title: String(formData.get("seoTitle") ?? "").trim().slice(0, 60),
    description: String(formData.get("seoDescription") ?? "")
      .trim()
      .slice(0, 160),
    ogImage: String(formData.get("seoOgImage") ?? "").trim().slice(0, 200),
    keywords: String(formData.get("seoKeywords") ?? "")
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 15),
  };

  const isActive = formData.get("isActive") === "on";

  const data = {
    slug,
    locale: localeRaw,
    title,
    subtitle: subtitle || null,
    blocks: parsedBlocks.data as never,
    seoMeta: seoMeta as never,
    isActive,
  };

  if (id) {
    await prisma.pageContent.update({ where: { id }, data });
    await recordAudit({
      userId: session.sub,
      action: "page.update",
      entity: `page:${id}`,
      metadata: { slug, locale: localeRaw, blocksCount: parsedBlocks.data.length },
    });
  } else {
    const created = await prisma.pageContent.create({ data });
    await recordAudit({
      userId: session.sub,
      action: "page.create",
      entity: `page:${created.id}`,
      metadata: { slug, locale: localeRaw, blocksCount: parsedBlocks.data.length },
    });
  }

  // Public pages to revalidate (best-effort — slug may map to multiple paths)
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages`);
  if (slug === "about") revalidatePath("/a-propos");
  if (slug === "services") revalidatePath("/services");

  redirect(`/admin/pages/${slug}`);
}

export async function deletePageContentAction(formData: FormData) {
  const session = await requirePermission("page:delete");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };
  const row = await prisma.pageContent.findUnique({ where: { id } });
  if (!row) return { error: "Page introuvable." };

  // Soft: keep history, deactivate
  await prisma.pageContent.update({
    where: { id },
    data: { isActive: false },
  });
  await recordAudit({
    userId: session.sub,
    action: "page.delete",
    entity: `page:${id}`,
    metadata: { slug: row.slug, locale: row.locale, soft: true },
  });

  revalidatePath("/admin/pages");
  if (row.slug === "about") revalidatePath("/a-propos");
  if (row.slug === "services") revalidatePath("/services");
  redirect("/admin/pages");
}

export async function togglePageContentActiveAction(formData: FormData) {
  const session = await requirePermission("page:write");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };
  const row = await prisma.pageContent.findUnique({ where: { id } });
  if (!row) return { error: "Page introuvable." };
  const next = !row.isActive;
  await prisma.pageContent.update({ where: { id }, data: { isActive: next } });
  await recordAudit({
    userId: session.sub,
    action: "page.update",
    entity: `page:${id}`,
    metadata: { from: row.isActive, to: next, slug: row.slug, locale: row.locale },
  });
  revalidatePath("/admin/pages");
  if (row.slug === "about") revalidatePath("/a-propos");
  if (row.slug === "services") revalidatePath("/services");
  return { ok: true, isActive: next };
}
