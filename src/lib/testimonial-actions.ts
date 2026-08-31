"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requirePermission } from "@/lib/auth-actions";
import { recordAudit } from "@/lib/audit";
import {
  parseTestimonialForm,
  toTestimonialData,
  type TestimonialInput,
} from "@/lib/validators/testimonial";

/* ── Reorder helper (exported) ──────────────────────────────────────── */

/**
 * Lightweight in-memory type shared with the form layer.
 * (TestimonialInput already exported from validators.)
 */

async function requireSuperAdminContext() {
  // Separate from requirePermission: lets us reuse session across writes for audit.
  const session = await requirePermission("testimonials:delete");
  return session;
}

/* ── Create / update (form-driven, like destination-actions) ────────── */

export async function saveTestimonialAction(formData: FormData) {
  // SUPER_ADMIN + AGENT (write)
  const session = await requirePermission("testimonials:write");

  const id = String(formData.get("id") ?? "");
  const parsed = parseTestimonialForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const data = toTestimonialData(parsed.data);

  if (id) {
    await prisma.testimonial.update({ where: { id }, data });
    await recordAudit({
      userId: session.sub,
      action: "testimonial.update",
      entity: `testimonial:${id}`,
      metadata: { author: data.author, locale: data.locale },
    });
  } else {
    const created = await prisma.testimonial.create({ data });
    await recordAudit({
      userId: session.sub,
      action: "testimonial.create",
      entity: `testimonial:${created.id}`,
      metadata: { author: data.author, locale: data.locale, approved: data.approved },
    });
  }

  revalidatePath("/admin/temoignages");
  revalidatePath("/");
  revalidatePath("/temoignages");
  redirect("/admin/temoignages");
}

/* ── Delete (super-admin only) ───────────────────────────────────────── */

export async function deleteTestimonialAction(formData: FormData) {
  const session = await requireSuperAdminContext();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };

  const t = await prisma.testimonial.findUnique({ where: { id } });
  if (!t) return { error: "Témoignage introuvable." };

  await prisma.testimonial.delete({ where: { id } });
  await recordAudit({
    userId: session.sub,
    action: "testimonial.delete",
    entity: `testimonial:${id}`,
    metadata: { author: t.author, locale: t.locale },
  });

  revalidatePath("/admin/temoignages");
  revalidatePath("/");
  revalidatePath("/temoignages");
  redirect("/admin/temoignages");
}

/* ── Toggle approved (super-admin + agent) ───────────────────────────── */

export async function toggleApprovedAction(formData: FormData) {
  const session = await requirePermission("testimonials:approve");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };

  const t = await prisma.testimonial.findUnique({ where: { id } });
  if (!t) return { error: "Témoignage introuvable." };

  const next = !t.approved;
  await prisma.testimonial.update({ where: { id }, data: { approved: next } });
  await recordAudit({
    userId: session.sub,
    action: "testimonial.approve.toggle",
    entity: `testimonial:${id}`,
    metadata: { from: t.approved, to: next, author: t.author },
  });

  revalidatePath("/admin/temoignages");
  revalidatePath("/");
  revalidatePath("/temoignages");
  return { ok: true, approved: next };
}

/* ── Reorder (super-admin only) ─────────────────────────────────────── */

export async function reorderTestimonialsAction(formData: FormData) {
  const session = await requireSuperAdminContext();
  const orderedIdsRaw = String(formData.get("orderedIds") ?? "");
  if (!orderedIdsRaw) return { error: "Liste vide." };

  const orderedIds = orderedIdsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (orderedIds.length === 0) return { error: "Liste invalide." };

  // Apply order in a single transaction to keep the list consistent.
  await prisma.$transaction(
    orderedIds.map((id, order) =>
      prisma.testimonial.update({ where: { id }, data: { order } }),
    ),
  );
  await recordAudit({
    userId: session.sub,
    action: "testimonial.reorder",
    metadata: { count: orderedIds.length },
  });

  revalidatePath("/admin/temoignages");
  revalidatePath("/");
  return { ok: true };
}

/* ── Pure functions (also used internally for callers that already have
     a validated shape, e.g. console scripts) ────────────────────────── */

export type ActionOk<T = unknown> = { ok: true } & T;
export type ActionFail = { error: string };

export async function createTestimonial(
  input: TestimonialInput,
): Promise<ActionOk<{ id: string }> | ActionFail> {
  const session = await requirePermission("testimonials:write");
  const created = await prisma.testimonial.create({ data: toTestimonialData(input) });
  await recordAudit({
    userId: session.sub,
    action: "testimonial.create",
    entity: `testimonial:${created.id}`,
    metadata: { author: input.author, locale: input.locale, approved: input.approved },
  });
  return { ok: true, id: created.id };
}

export async function updateTestimonial(
  id: string,
  input: TestimonialInput,
): Promise<ActionOk | ActionFail> {
  const session = await requirePermission("testimonials:write");
  await prisma.testimonial.update({ where: { id }, data: toTestimonialData(input) });
  await recordAudit({
    userId: session.sub,
    action: "testimonial.update",
    entity: `testimonial:${id}`,
    metadata: { author: input.author, locale: input.locale },
  });
  return { ok: true };
}

export async function toggleApproved(id: string): Promise<ActionOk<{ approved: boolean }> | ActionFail> {
  const session = await requirePermission("testimonials:approve");
  const t = await prisma.testimonial.findUnique({ where: { id } });
  if (!t) return { error: "Témoignage introuvable." };
  const next = !t.approved;
  await prisma.testimonial.update({ where: { id }, data: { approved: next } });
  await recordAudit({
    userId: session.sub,
    action: "testimonial.approve.toggle",
    entity: `testimonial:${id}`,
    metadata: { from: t.approved, to: next },
  });
  return { ok: true, approved: next };
}
