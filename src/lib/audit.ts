/**
 * Audit log helper — every privileged write in the back-office passes
 * through `recordAudit`. Stored in `AuditLog` for compliance + incident
 * response.
 */
import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "auth.2fa_enabled"
  | "auth.failed"
  | "destination.create"
  | "destination.update"
  | "destination.delete"
  | "destination.publish"
  | "offer.create"
  | "offer.update"
  | "offer.delete"
  | "offer.publish"
  | "reservation.create"
  | "reservation.update"
  | "reservation.delete"
  | "visa.create"
  | "visa.update"
  | "visa.delete"
  | "visa.document_upload"
  | "client.create"
  | "client.update"
  | "client.export"
  | "payment.refund"
  | "media.upload"
  | "media.delete"
  | "settings.update"
  | "user.create"
  | "user.update"
  | "testimonial.create"
  | "testimonial.update"
  | "testimonial.delete"
  | "testimonial.approve.toggle"
  | "testimonial.reorder"
  | "faq.create"
  | "faq.update"
  | "faq.delete"
  | "faq.toggle"
  | "faq.reorder";

export async function recordAudit(opts: {
  userId?: string | null;
  action: AuditAction;
  entity?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: opts.userId ?? undefined,
        action: opts.action,
        entity: opts.entity,
        metadata: opts.metadata as never,
        ip: opts.ip ?? undefined,
        userAgent: opts.userAgent ?? undefined,
      },
    });
  } catch {
    // Never fail a write because of audit — log to console and move on.
    console.error("[audit] failed to record", opts.action, opts.entity);
  }
}
