"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-actions";

function toIntOrNull(v: FormDataEntryValue | null) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toStrArray(v: FormDataEntryValue | null): string[] {
  if (typeof v !== "string") return [];
  return v
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function dateOrNull(v: FormDataEntryValue | null): Date | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function saveOfferAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const kind = String(formData.get("kind") ?? "SEJOUR");
  const summary = String(formData.get("summary") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceFCFA = Number(formData.get("priceFCFA") ?? 0);
  const durationDaysRaw = formData.get("durationDays");
  const maxGuestsRaw = formData.get("maxGuests");
  const destinationId = String(formData.get("destinationId") ?? "");
  const coverImageId = String(formData.get("coverImageId") ?? "").trim() || null;
  const inclusions = toStrArray(formData.get("inclusions"));
  const exclusions = toStrArray(formData.get("exclusions"));
  const promoPriceFCFA = toIntOrNull(formData.get("promoPriceFCFA"));
  const promoEndsAt = dateOrNull(formData.get("promoEndsAt"));
  const availabilityTypeRaw = String(formData.get("availabilityType") ?? "ON_DEMAND");
  const availabilityType = availabilityTypeRaw === "FIXED_STOCK" ? "FIXED_STOCK" : "ON_DEMAND";
  const stock = toIntOrNull(formData.get("stock"));
  const published = formData.get("published") === "on";
  const featuredOnHome = formData.get("featuredOnHome") === "on";
  const homeOrder = toIntOrNull(formData.get("homeOrder"));

  if (!title) return { error: "Le titre est requis." };
  if (!summary) return { error: "Le résumé est requis." };
  if (!Number.isFinite(priceFCFA) || priceFCFA < 0)
    return { error: "Prix invalide." };
  if (!destinationId) return { error: "Destination requise." };

  const slug = slugify(title);
  const existing = await prisma.offer.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    return { error: `Le slug "${slug}" est déjà utilisé.` };
  }

  const data = {
    title,
    slug,
    kind: kind as
      | "SEJOUR"
      | "CIRCUIT"
      | "SUR_MESURE"
      | "OMRA"
      | "HAJJ"
      | "BILLETERIE",
    summary,
    description: description || null,
    priceFCFA,
    durationDays: durationDaysRaw ? Number(durationDaysRaw) : null,
    maxGuests: maxGuestsRaw ? Number(maxGuestsRaw) : null,
    destinationId,
    coverImageId,
    inclusions,
    exclusions,
    promoPriceFCFA,
    promoEndsAt,
    availabilityType,
    stock,
    published,
    featuredOnHome,
    homeOrder,
  };

  if (id) {
    await prisma.offer.update({ where: { id }, data });
  } else {
    await prisma.offer.create({ data });
  }

  revalidatePath("/admin/offres");
  revalidatePath("/offres");
  revalidatePath("/");
  redirect("/admin/offres");
}

export async function deleteOfferAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };
  await prisma.reservation.updateMany({
    where: { offerId: id },
    data: { offerId: null },
  });
  await prisma.offer.delete({ where: { id } });
  revalidatePath("/admin/offres");
  redirect("/admin/offres");
}