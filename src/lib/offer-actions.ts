"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-actions";

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
  const published = formData.get("published") === "on";

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
    published,
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