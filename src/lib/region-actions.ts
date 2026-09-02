"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-actions";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function toInt(v: FormDataEntryValue | null, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toStrArray(v: FormDataEntryValue | null): string[] {
  if (!v) return [];
  return String(v)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const VALID_GROUPS = new Set(["senegal", "international"]);

export async function saveRegionAction(formData: FormData) {
  await requirePermission("destinations:write");
  const id = str(formData.get("id"));
  const labelFr = str(formData.get("labelFr"));
  const labelEn = str(formData.get("labelEn")) || labelFr;
  const groupRaw = str(formData.get("group")) || "international";
  const group = VALID_GROUPS.has(groupRaw) ? groupRaw : "international";
  const order = toInt(formData.get("order"), 0);
  const isActive = formData.get("isActive") === "on";
  const legacyEnumKeys = toStrArray(formData.get("legacyEnumKeys"));
  const slugInput = str(formData.get("slug"));

  if (!labelFr) throw new Error("Le libellé français est requis.");

  const slug = slugInput || slugify(labelFr);
  if (!slug) throw new Error("Slug invalide.");

  const existing = await prisma.region.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    throw new Error(`Le slug « ${slug} » est déjà utilisé.`);
  }

  if (id) {
    await prisma.region.update({
      where: { id },
      data: { slug, labelFr, labelEn, group, order, isActive, legacyEnumKeys },
    });
  } else {
    await prisma.region.create({
      data: { slug, labelFr, labelEn, group, order, isActive, legacyEnumKeys },
    });
  }

  revalidatePath("/admin/destinations/regions");
  revalidatePath("/destinations");
  revalidatePath("/");
  redirect("/admin/destinations/regions");
}

export async function toggleRegionActiveAction(formData: FormData) {
  await requirePermission("destinations:write");
  const id = str(formData.get("id"));
  if (!id) throw new Error("ID manquant.");
  const region = await prisma.region.findUnique({ where: { id } });
  if (!region) throw new Error("Région introuvable.");
  await prisma.region.update({
    where: { id },
    data: { isActive: !region.isActive },
  });
  revalidatePath("/admin/destinations/regions");
  revalidatePath("/destinations");
  revalidatePath("/");
}

export async function deleteRegionAction(formData: FormData) {
  await requirePermission("destinations:write");
  const id = str(formData.get("id"));
  if (!id) throw new Error("ID manquant.");

  const linked = await prisma.destination.count({ where: { customRegionId: id } });
  if (linked > 0) {
    throw new Error(
      `Impossible de supprimer : ${linked} destination(s) utilisent encore cette région. Réassignez-les d'abord.`,
    );
  }

  await prisma.region.delete({ where: { id } });
  revalidatePath("/admin/destinations/regions");
  revalidatePath("/destinations");
  revalidatePath("/");
}

export async function reorderRegionsAction(formData: FormData) {
  await requirePermission("destinations:write");
  const raw = str(formData.get("orderedIds"));
  const ids = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) throw new Error("Liste vide.");
  await Promise.all(
    ids.map((rid, idx) =>
      prisma.region.update({
        where: { id: rid },
        data: { order: (idx + 1) * 10 },
      }),
    ),
  );
  revalidatePath("/admin/destinations/regions");
  revalidatePath("/destinations");
}
