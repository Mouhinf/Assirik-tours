"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-actions";
import { recordAudit } from "@/lib/audit";
import {
  parseFaqForm,
  toFaqData,
  type FaqInput,
} from "@/lib/validators/faq";

/* ── Form-driven CRUD (matches the destination-actions pattern) ─── */

export async function saveFaqItemAction(formData: FormData) {
  const session = await requirePermission("faq:write");
  const id = String(formData.get("id") ?? "");
  const parsed = parseFaqForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const data = toFaqData(parsed.data);

  if (id) {
    await prisma.faqItem.update({ where: { id }, data });
    await recordAudit({
      userId: session.sub,
      action: "faq.update",
      entity: `faq:${id}`,
      metadata: { category: data.category, locale: data.locale },
    });
  } else {
    const created = await prisma.faqItem.create({ data });
    await recordAudit({
      userId: session.sub,
      action: "faq.create",
      entity: `faq:${created.id}`,
      metadata: { category: data.category, locale: data.locale },
    });
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");
  redirect("/admin/faq");
}

export async function deleteFaqItemAction(formData: FormData) {
  const session = await requirePermission("faq:delete");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };

  const row = await prisma.faqItem.findUnique({ where: { id } });
  if (!row) return { error: "Question introuvable." };

  await prisma.faqItem.delete({ where: { id } });
  await recordAudit({
    userId: session.sub,
    action: "faq.delete",
    entity: `faq:${id}`,
    metadata: { category: row.category, locale: row.locale },
  });

  revalidatePath("/admin/faq");
  revalidatePath("/faq");
  redirect("/admin/faq");
}

export async function toggleFaqActiveAction(formData: FormData) {
  const session = await requirePermission("faq:write");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };

  const row = await prisma.faqItem.findUnique({ where: { id } });
  if (!row) return { error: "Question introuvable." };

  const next = !row.isActive;
  await prisma.faqItem.update({ where: { id }, data: { isActive: next } });
  await recordAudit({
    userId: session.sub,
    action: "faq.toggle",
    entity: `faq:${id}`,
    metadata: { from: row.isActive, to: next },
  });

  revalidatePath("/admin/faq");
  revalidatePath("/faq");
  return { ok: true, isActive: next };
}

export async function reorderFaqItemsAction(formData: FormData) {
  const session = await requirePermission("faq:reorder");
  const orderedIdsRaw = String(formData.get("orderedIds") ?? "");
  if (!orderedIdsRaw) return { error: "Liste vide." };

  const orderedIds = orderedIdsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (orderedIds.length === 0) return { error: "Liste invalide." };
  if (new Set(orderedIds).size !== orderedIds.length) {
    return { error: "La liste contient des doublons." };
  }

  const rows = await prisma.faqItem.findMany({
    where: { id: { in: orderedIds } },
    select: { id: true, category: true, locale: true },
  });
  if (rows.length !== orderedIds.length) {
    return { error: "Une ou plusieurs questions sont introuvables." };
  }

  const scope = rows[0];
  const sameScope = rows.every(
    (row) =>
      row.category === scope.category && row.locale === scope.locale,
  );
  if (!sameScope) {
    return {
      error: "Le réordonnancement doit rester dans une langue et une catégorie.",
    };
  }

  const scopeCount = await prisma.faqItem.count({
    where: { category: scope.category, locale: scope.locale },
  });
  if (scopeCount !== orderedIds.length) {
    return {
      error: "La liste est incomplète. Rechargez la page avant de réessayer.",
    };
  }

  await prisma.$transaction(
    orderedIds.map((id, order) =>
      prisma.faqItem.update({ where: { id }, data: { order } }),
    ),
  );
  await recordAudit({
    userId: session.sub,
    action: "faq.reorder",
    metadata: {
      count: orderedIds.length,
      category: scope.category,
      locale: scope.locale,
    },
  });

  revalidatePath("/admin/faq");
  revalidatePath("/faq");
  return { ok: true };
}

/* ── Pure helpers (useful for scripts and console flows) ───────── */

export type ActionOk<T = unknown> = { ok: true } & T;
export type ActionFail = { error: string };

export async function createFaqItem(
  input: FaqInput,
): Promise<ActionOk<{ id: string }> | ActionFail> {
  const session = await requirePermission("faq:write");
  const created = await prisma.faqItem.create({ data: toFaqData(input) });
  await recordAudit({
    userId: session.sub,
    action: "faq.create",
    entity: `faq:${created.id}`,
    metadata: { category: input.category, locale: input.locale },
  });
  return { ok: true, id: created.id };
}

export async function updateFaqItem(
  id: string,
  input: FaqInput,
): Promise<ActionOk | ActionFail> {
  const session = await requirePermission("faq:write");
  await prisma.faqItem.update({ where: { id }, data: toFaqData(input) });
  await recordAudit({
    userId: session.sub,
    action: "faq.update",
    entity: `faq:${id}`,
    metadata: { category: input.category, locale: input.locale },
  });
  return { ok: true };
}

export async function toggleFaqActive(id: string): Promise<ActionOk<{ isActive: boolean }> | ActionFail> {
  const session = await requirePermission("faq:write");
  const row = await prisma.faqItem.findUnique({ where: { id } });
  if (!row) return { error: "Question introuvable." };
  const next = !row.isActive;
  await prisma.faqItem.update({ where: { id }, data: { isActive: next } });
  await recordAudit({
    userId: session.sub,
    action: "faq.toggle",
    entity: `faq:${id}`,
    metadata: { from: row.isActive, to: next },
  });
  return { ok: true, isActive: next };
}
