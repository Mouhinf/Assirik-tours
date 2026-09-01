"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-actions";
import { recordAudit } from "@/lib/audit";
import { uploadBuffer, deleteAsset } from "@/lib/cloudinary";
import {
  parseGalleryForm,
  toGalleryData,
  deriveAltFromPublicId,
  type GalleryInput,
} from "@/lib/validators/gallery";

/* ── Cloudinary configuration check ─────────────────────────────── */

function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

/* ── Pure functions — usable from admin forms & server scripts ─── */

export async function createGalleryItem(
  input: GalleryInput,
): Promise<{ ok: true; id: string } | { error: string }> {
  const session = await requirePermission("gallery:write");
  const created = await prisma.galleryItem.create({ data: toGalleryData(input) });
  await recordAudit({
    userId: session.sub,
    action: "gallery.create",
    entity: `gallery:${created.id}`,
    metadata: {
      cloudinaryId: input.cloudinaryId,
      isFeatured: input.isFeatured,
    },
  });
  return { ok: true, id: created.id };
}

export async function updateGalleryItem(
  id: string,
  input: GalleryInput,
): Promise<{ ok: true } | { error: string }> {
  const session = await requirePermission("gallery:write");
  const existing = await prisma.galleryItem.findUnique({ where: { id } });
  if (!existing) return { error: "Photo introuvable." };

  // If the public_id changed and the new one is a Cloudinary asset (starts with folder),
  // the orphan check below will sweep the previous one.
  await prisma.galleryItem.update({ where: { id }, data: toGalleryData(input) });
  await recordAudit({
    userId: session.sub,
    action: "gallery.update",
    entity: `gallery:${id}`,
    metadata: { cloudinaryId: input.cloudinaryId },
  });

  if (existing.cloudinaryId && existing.cloudinaryId !== input.cloudinaryId) {
    await cleanupOrphanedAsset(existing.cloudinaryId);
  }
  return { ok: true };
}

export async function deleteGalleryItem(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await requirePermission("gallery:delete");
  const existing = await prisma.galleryItem.findUnique({ where: { id } });
  if (!existing) return { error: "Photo introuvable." };

  await prisma.galleryItem.delete({ where: { id } });
  await recordAudit({
    userId: session.sub,
    action: "gallery.delete",
    entity: `gallery:${id}`,
    metadata: { cloudinaryId: existing.cloudinaryId },
  });

  await cleanupOrphanedAsset(existing.cloudinaryId);
  return { ok: true };
}

/* ── Form-driven CRUD (matches destination-actions pattern) ─────── */

export async function saveGalleryItemAction(formData: FormData) {
  const session = await requirePermission("gallery:write");
  const id = String(formData.get("id") ?? "");
  const parsed = parseGalleryForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const data = toGalleryData(parsed.data);

  if (id) {
    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) return { error: "Photo introuvable." };

    await prisma.galleryItem.update({ where: { id }, data });
    await recordAudit({
      userId: session.sub,
      action: "gallery.update",
      entity: `gallery:${id}`,
      metadata: { cloudinaryId: data.cloudinaryId },
    });

    if (existing.cloudinaryId !== data.cloudinaryId) {
      await cleanupOrphanedAsset(existing.cloudinaryId);
    }
  } else {
    const created = await prisma.galleryItem.create({ data });
    await recordAudit({
      userId: session.sub,
      action: "gallery.create",
      entity: `gallery:${created.id}`,
      metadata: { cloudinaryId: data.cloudinaryId },
    });
  }

  revalidatePath("/admin/galerie");
  revalidatePath("/galerie");
  redirect("/admin/galerie");
}

export async function deleteGalleryItemAction(formData: FormData) {
  const session = await requirePermission("gallery:delete");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };
  const existing = await prisma.galleryItem.findUnique({ where: { id } });
  if (!existing) return { error: "Photo introuvable." };

  await prisma.galleryItem.delete({ where: { id } });
  await recordAudit({
    userId: session.sub,
    action: "gallery.delete",
    entity: `gallery:${id}`,
    metadata: { cloudinaryId: existing.cloudinaryId },
  });

  await cleanupOrphanedAsset(existing.cloudinaryId);
  revalidatePath("/admin/galerie");
  revalidatePath("/galerie");
  redirect("/admin/galerie");
}

export async function toggleGalleryActiveAction(formData: FormData) {
  const session = await requirePermission("gallery:write");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };
  const row = await prisma.galleryItem.findUnique({ where: { id } });
  if (!row) return { error: "Photo introuvable." };

  const next = !row.isActive;
  await prisma.galleryItem.update({ where: { id }, data: { isActive: next } });
  await recordAudit({
    userId: session.sub,
    action: "gallery.toggle",
    entity: `gallery:${id}`,
    metadata: { from: row.isActive, to: next },
  });
  revalidatePath("/admin/galerie");
  revalidatePath("/galerie");
  return { ok: true, isActive: next };
}

export async function toggleGalleryFeaturedAction(formData: FormData) {
  const session = await requirePermission("gallery:featured");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };
  const row = await prisma.galleryItem.findUnique({ where: { id } });
  if (!row) return { error: "Photo introuvable." };

  const next = !row.isFeatured;
  await prisma.galleryItem.update({ where: { id }, data: { isFeatured: next } });
  await recordAudit({
    userId: session.sub,
    action: "gallery.featured.toggle",
    entity: `gallery:${id}`,
    metadata: { from: row.isFeatured, to: next },
  });
  revalidatePath("/admin/galerie");
  revalidatePath("/galerie");
  revalidatePath("/");
  return { ok: true, isFeatured: next };
}

export async function reorderGalleryItemsAction(formData: FormData) {
  const session = await requirePermission("gallery:featured");
  const orderedIdsRaw = String(formData.get("orderedIds") ?? "");
  if (!orderedIdsRaw) return { error: "Liste vide." };

  const orderedIds = orderedIdsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (orderedIds.length === 0) return { error: "Liste invalide." };

  await prisma.$transaction(
    orderedIds.map((id, order) =>
      prisma.galleryItem.update({ where: { id }, data: { order } }),
    ),
  );
  await recordAudit({
    userId: session.sub,
    action: "gallery.reorder",
    metadata: { count: orderedIds.length },
  });

  revalidatePath("/admin/galerie");
  revalidatePath("/galerie");
  return { ok: true };
}

/* ── Upload helper — used by gallery-form (single) & bulk-uploader ── */

export async function uploadGalleryImageAction(formData: FormData) {
  const session = await requirePermission("gallery:write");

  if (!cloudinaryConfigured()) {
    return { error: "Cloudinary n'est pas configuré." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Aucun fichier reçu." };
  }
  const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  if (!ALLOWED.has(file.type)) {
    return { error: "Format non supporté (JPEG, PNG, WebP, AVIF)." };
  }
  if (file.size > 12 * 1024 * 1024) {
    return { error: "Image trop lourde (max 12 MB)." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "photo";

  try {
    const result = await uploadBuffer(buffer, {
      folder: "assirik-tours/gallery",
      filename: safeName,
    });
    // Auto-create the DB row so the admin lands directly in the edit form.
    const altText = deriveAltFromPublicId(result.publicId);
    const created = await prisma.galleryItem.create({
      data: {
        cloudinaryId: result.publicId,
        altText,
        width: result.width,
        height: result.height,
        order: 0,
        isActive: false, // admin reviews before publishing
        isFeatured: false,
      },
    });
    await recordAudit({
      userId: session.sub,
      action: "gallery.create",
      entity: `gallery:${created.id}`,
      metadata: {
        cloudinaryId: result.publicId,
        bytes: result.bytes,
        source: "upload",
      },
    });
    revalidatePath("/admin/galerie");
    return {
      ok: true,
      asset: {
        id: created.id,
        publicId: result.publicId,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    };
  } catch (e) {
    console.error("[gallery upload] failed", e);
    return { error: "Échec de l'upload Cloudinary." };
  }
}

/* ── Helpers ─────────────────────────────────────────────────────── */

async function cleanupOrphanedAsset(publicId: string) {
  if (!publicId || !publicId.startsWith("assirik-tours/")) return;
  const still = await prisma.galleryItem.count({ where: { cloudinaryId: publicId } });
  if (still > 0) return;
  if (!cloudinaryConfigured()) return;
  try {
    await deleteAsset(publicId);
  } catch (e) {
    console.warn("[gallery cleanup] delete failed", publicId, e);
  }
}
