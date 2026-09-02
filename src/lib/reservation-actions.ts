"use server";

import { revalidatePath } from "next/cache";
import { RequestStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-actions";
import { recordAudit } from "@/lib/audit";

/**
 * Server actions for the unified Reservation queue
 * (`/admin/reservations`).
 *
 * The actions are deliberately granular — one call per row mutation —
 * so the admin table can issue single-row updates without re-fetching
 * the whole list. The list page also stays small enough that
 * `router.refresh()` is cheap.
 */

const REQUEST_STATUS_VALUES: RequestStatus[] = [
  "NOUVEAU",
  "EN_COURS",
  "TRAITE",
];

export type UpdateReservationState =
  | { ok: true }
  | { ok: false; error: string }
  | null;

/**
 * Updates only the commercial follow-up state. Reservation.status remains the
 * independent booking/payment lifecycle used by reports and payments.
 */
export async function updateRequestStatusAction(
  _prev: UpdateReservationState,
  formData: FormData,
): Promise<UpdateReservationState> {
  const session = await requirePermission("reservations:write");
  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("processingStatus") ?? "");
  if (!id) return { ok: false, error: "ID réservation manquant." };
  if (!REQUEST_STATUS_VALUES.includes(statusRaw as RequestStatus)) {
    return { ok: false, error: "Statut de traitement invalide." };
  }
  const processingStatus = statusRaw as RequestStatus;

  const before = await prisma.reservation.findUnique({
    where: { id },
    select: { id: true, processingStatus: true, reference: true },
  });
  if (!before) return { ok: false, error: "Réservation introuvable." };

  const updated = await prisma.reservation.update({
    where: { id },
    data: { processingStatus },
    select: { id: true, reference: true, processingStatus: true },
  });

  await recordAudit({
    userId: session.sub,
    action: "reservation.update",
    entity: `reservation:${id}`,
    metadata: {
      kind: "processingStatus",
      from: before.processingStatus,
      to: processingStatus,
      reference: updated.reference,
    },
  });

  revalidatePath("/admin/reservations");
  return { ok: true };
}

/**
 * Assign (or unassign) a reservation to an admin user.
 *
 * Pass an empty string to clear the assignee.
 */
export async function updateReservationAssigneeAction(
  _prev: UpdateReservationState,
  formData: FormData,
): Promise<UpdateReservationState> {
  const session = await requirePermission("reservations:write");
  const id = String(formData.get("id") ?? "");
  const assigneeIdRaw = String(formData.get("assigneeId") ?? "");
  if (!id) return { ok: false, error: "ID réservation manquant." };

  // Empty string → null. Otherwise look up the admin and verify they exist.
  let assigneeId: string | null = null;
  if (assigneeIdRaw) {
    const admin = await prisma.adminUser.findUnique({
      where: {
        id: assigneeIdRaw,
        role: { in: ["AGENT", "SUPER_ADMIN"] },
      },
      select: { id: true, role: true, name: true },
    });
    if (!admin) {
      return { ok: false, error: "Agent commercial introuvable ou non assignable." };
    }
    assigneeId = admin.id;
  }

  const before = await prisma.reservation.findUnique({
    where: { id },
    select: { id: true, reference: true, assigneeId: true },
  });
  if (!before) return { ok: false, error: "Réservation introuvable." };

  await prisma.reservation.update({
    where: { id },
    data: { assigneeId },
  });

  await recordAudit({
    userId: session.sub,
    action: "reservation.update",
    entity: `reservation:${id}`,
    metadata: {
      kind: "assignee",
      from: before.assigneeId,
      to: assigneeId,
      reference: before.reference,
    },
  });

  revalidatePath("/admin/reservations");
  return { ok: true };
}

/**
 * Update the internal admin notes on a reservation. Useful for adding
 * context the agent has discovered (callback done, agreement sent, etc.).
 */
export async function updateReservationNotesAction(
  _prev: UpdateReservationState,
  formData: FormData,
): Promise<UpdateReservationState> {
  const session = await requirePermission("reservations:write");
  const id = String(formData.get("id") ?? "");
  const notesRaw = String(formData.get("notes") ?? "").slice(0, 4000);
  if (!id) return { ok: false, error: "ID réservation manquant." };

  const updated = await prisma.reservation.update({
    where: { id },
    data: { notes: notesRaw || null },
    select: { id: true, reference: true },
  });

  await recordAudit({
    userId: session.sub,
    action: "reservation.update",
    entity: `reservation:${id}`,
    metadata: { kind: "notes", reference: updated.reference },
  });

  revalidatePath("/admin/reservations");
  return { ok: true };
}

// Re-export for callers that want the canonical status list.
export const REQUEST_PROCESSING_STATUS_VALUES = REQUEST_STATUS_VALUES;

// Type helper for the Prisma `ReservationSource` enum — kept here so
// admin components don't have to import from `@prisma/client`.
export type { Prisma };
