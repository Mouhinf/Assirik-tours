"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-actions";
import { recordAudit } from "@/lib/audit";
import { SERVICE_CATEGORIES, type ServiceCategory } from "@/lib/service-catalog";

/* ── Helpers ──────────────────────────────────────────────────── */

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function toIntOrNull(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Internal aliases — the canonical lists live in `@/lib/service-catalog`
// so the same constants can be safely imported from non-"use server"
// files (Client Components, etc.).
const CATEGORIES = SERVICE_CATEGORIES;

function parseCategory(v: FormDataEntryValue | null): ServiceCategory {
  const s = str(v).toUpperCase();
  return (CATEGORIES as readonly string[]).includes(s) ? (s as ServiceCategory) : "AUTRE";
}

/* ── Public ─────────────────────────────────────────────────── */

export async function listActiveServices() {
  return prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { title: "asc" }],
  });
}

/* ── Admin ──────────────────────────────────────────────────── */

export async function listServicesForAdmin() {
  await requirePermission("services:read");
  return prisma.service.findMany({
    orderBy: [{ isActive: "desc" }, { order: "asc" }, { title: "asc" }],
  });
}

export async function getServiceForAdmin(id: string) {
  await requirePermission("services:read");
  return prisma.service.findUnique({ where: { id } });
}

export async function saveServiceAction(formData: FormData) {
  const session = await requirePermission("services:write");

  const id = str(formData.get("id"));
  const title = str(formData.get("title"));
  const slugInput = str(formData.get("slug"));
  const shortDescription = str(formData.get("shortDescription"));
  const longDescription = str(formData.get("longDescription"));
  const category = parseCategory(formData.get("category"));
  const icon = str(formData.get("icon")) || null;
  const imageId = str(formData.get("imageId")) || null;
  const priceFromFCFA = toIntOrNull(formData.get("priceFromFCFA"));
  const priceNote = str(formData.get("priceNote")) || null;
  const order = toIntOrNull(formData.get("order")) ?? 0;
  const isActive = formData.get("isActive") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const ctaLabel = str(formData.get("ctaLabel")) || null;
  const ctaHref = str(formData.get("ctaHref")) || null;

  if (!title) return { error: "Le titre est requis." };
  if (!shortDescription) return { error: "La description courte est requise." };
  if (priceFromFCFA !== null && priceFromFCFA < 0) {
    return { error: "Prix invalide." };
  }

  const slug = slugInput || slugify(title);
  if (!slug) return { error: "Slug invalide." };

  // Uniqueness check (excluding self)
  const conflict = await prisma.service.findUnique({ where: { slug } });
  if (conflict && conflict.id !== id) {
    return { error: `Le slug « ${slug} » est déjà utilisé.` };
  }

  const data = {
    title,
    slug,
    shortDescription,
    longDescription: longDescription || null,
    category,
    icon,
    imageId,
    priceFromFCFA,
    priceNote,
    order,
    isActive,
    isFeatured,
    ctaLabel,
    ctaHref,
  };

  if (id) {
    const updated = await prisma.service.update({ where: { id }, data });
    await recordAudit({
      userId: session.sub,
      action: "service.update",
      entity: `service:${updated.id}`,
      metadata: { slug, category, isActive },
    });
    revalidatePath("/admin/services");
    revalidatePath("/services");
    redirect(`/admin/services/${updated.id}`);
  }

  const created = await prisma.service.create({ data });
  await recordAudit({
    userId: session.sub,
    action: "service.create",
    entity: `service:${created.id}`,
    metadata: { slug, category, isActive },
  });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  redirect(`/admin/services/${created.id}`);
}

export async function toggleServiceActiveAction(formData: FormData) {
  const session = await requirePermission("services:write");
  const id = str(formData.get("id"));
  if (!id) return { error: "ID manquant." };
  const current = await prisma.service.findUnique({ where: { id }, select: { isActive: true } });
  if (!current) return { error: "Service introuvable." };
  await prisma.service.update({ where: { id }, data: { isActive: !current.isActive } });
  await recordAudit({
    userId: session.sub,
    action: "service.update",
    entity: `service:${id}`,
    metadata: { toggle: "isActive", newValue: !current.isActive },
  });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { ok: true };
}

export async function deleteServiceAction(formData: FormData) {
  const session = await requirePermission("services:delete");
  const id = str(formData.get("id"));
  if (!id) return { error: "ID manquant." };
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) return { error: "Service introuvable." };
  await prisma.service.delete({ where: { id } });
  await recordAudit({
    userId: session.sub,
    action: "service.delete",
    entity: `service:${id}`,
    metadata: { slug: existing.slug, title: existing.title },
  });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  redirect("/admin/services");
}

export async function reorderServicesAction(input: { id: string; order: number }[]) {
  const session = await requirePermission("services:reorder");
  if (!Array.isArray(input)) return { error: "Données invalides." };
  // Bulk update — cheap transaction
  await prisma.$transaction(
    input.map((row) =>
      prisma.service.update({ where: { id: row.id }, data: { order: row.order } }),
    ),
  );
  await recordAudit({
    userId: session.sub,
    action: "service.update",
    entity: "service:reorder",
    metadata: { count: input.length },
  });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { ok: true };
}

/* ── Constants exported for the UI ────────────────────────────── */

/* Les constantes partagées (catégories, icônes, libellés) vivent dans
 * `@/lib/service-catalog` — ce fichier ne peut exporter que des
 * fonctions async (règle "use server" de Next.js). */
