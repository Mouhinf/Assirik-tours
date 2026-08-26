"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-actions";
import { deleteAsset } from "@/lib/cloudinary";

/* ─── Helpers ─────────────────────────────────────────────────── */

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toIntOrNull(v: FormDataEntryValue | null) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toStringArray(v: FormDataEntryValue | null): string[] {
  if (!v) return [];
  return String(v)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ─── Create / update ─────────────────────────────────────────── */

export async function saveDestinationAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const region = String(formData.get("region") ?? "DAKAR");
  const summary = String(formData.get("summary") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const heroImageId = String(formData.get("heroImageId") ?? "").trim() || null;
  const gallery = toStringArray(formData.get("gallery"));
  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";

  if (!title) return { error: "Le titre est requis." };
  if (!summary) return { error: "Le résumé est requis." };

  const slug = slugInput || slugify(title);

  // Ensure slug uniqueness (exclude current row)
  const existing = await prisma.destination.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    return { error: `Le slug "${slug}" est déjà utilisé.` };
  }

  const data = {
    title,
    slug,
    region: region as
      | "DAKAR"
      | "NIAYES"
      | "PETITE_COTE"
      | "CASAMANCE"
      | "SENEGAL_ORIENTAL"
      | "SAINT_LOUIS"
      | "AFRIQUE_OUEST"
      | "EUROPE"
      | "MOYEN_ORIENT"
      | "ASIE"
      | "AMERIQUE",
    summary,
    description: description || null,
    heroImageId,
    gallery,
    published,
    featured,
  };

  if (id) {
    await prisma.destination.update({ where: { id }, data });
  } else {
    await prisma.destination.create({ data });
  }

  revalidatePath("/admin/destinations");
  revalidatePath("/destinations");
  revalidatePath("/");
  redirect("/admin/destinations");
}

export async function deleteDestinationAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };

  const dest = await prisma.destination.findUnique({ where: { id } });
  if (!dest) return { error: "Destination introuvable." };

  // Detach offers first (use undefined to clear relation; destinationId is required
  // on the model, so we delete the offers instead)
  const orphanedOffers = await prisma.offer.findMany({
    where: { destinationId: id },
    select: { id: true },
  });

  await prisma.reservation.updateMany({
    where: { offerId: { in: orphanedOffers.map((o) => o.id) } },
    data: { offerId: null },
  });

  await prisma.offer.deleteMany({ where: { destinationId: id } });
  await prisma.destination.delete({ where: { id } });

  // Best-effort cloudinary cleanup
  if (dest.heroImageId) {
    try {
      await deleteAsset(dest.heroImageId);
    } catch {}
  }
  await Promise.all(
    dest.gallery.map((g) =>
      deleteAsset(g).catch(() => undefined),
    ),
  );

  revalidatePath("/admin/destinations");
  revalidatePath("/destinations");
  redirect("/admin/destinations");
}