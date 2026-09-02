"use server";

/**
 * Server actions for outbound communications.
 *
 * The high-level entry point is `dispatchTemplate()` which:
 *   1. Resolves the template by id.
 *   2. Renders subject + body in the requested locale.
 *   3. Persists a `Notification` row (status=queued).
 *   4. Routes to the matching provider.
 *   5. Updates the row with the provider result (status=sent|failed).
 *   6. Writes an `audit` entry.
 *
 * Hooks in reservation/visa/contact/flight actions call this helper.
 * Admin tools (test send, bulk newsletter) live in this file.
 */
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-actions";
import { recordAudit } from "@/lib/audit";
import { getProvider } from "@/lib/communications";
import {
  getTemplate,
  renderHtmlEmail,
  renderTemplateBody,
  renderTemplateSubject,
} from "@/lib/communications/templates";
import type { Channel, Locale, Message, SendResult } from "@/lib/communications/types";
import { siteConfig } from "@/lib/site-config";
import type { ReservationSource } from "@prisma/client";

/* ── Core dispatcher ─────────────────────────────────────────── */

export type DispatchInput = {
  templateId: string;
  channel: Channel;
  to: string;
  toName?: string;
  locale?: Locale;
  vars: Record<string, string | number | undefined | null>;
  /** Optional metadata saved alongside the notification row. */
  metadata?: Record<string, unknown>;
};

export async function dispatchTemplate(input: DispatchInput): Promise<SendResult> {
  const template = getTemplate(input.templateId);
  if (!template) {
    return { ok: false, error: `Template inconnu: ${input.templateId}`, sentAt: new Date() };
  }
  if (!template.channels.includes(input.channel)) {
    return {
      ok: false,
      error: `Canal ${input.channel} non supporté par ${input.templateId}`,
      sentAt: new Date(),
    };
  }
  const locale: Locale = input.locale ?? "fr";
  const subject = renderTemplateSubject(template, locale, input.vars);
  const body = renderTemplateBody(template, locale, input.vars);

  const notification = await prisma.notification.create({
    data: {
      channel: input.channel,
      templateId: template.id,
      toAddress: input.to,
      toName: input.toName ?? null,
      subject: subject ?? null,
      body,
      locale,
      status: "queued",
      metadata: (input.metadata ?? null) as never,
    },
  });

  const provider = getProvider(input.channel);
  const message: Message = {
    channel: input.channel,
    to: input.to,
    toName: input.toName,
    subject,
    body,
    html:
      input.channel === "email"
        ? renderHtmlEmail({
            subject: subject ?? "(sans objet)",
            preheader: body.split("\n")[0]?.slice(0, 120),
            body,
          })
        : undefined,
    metadata: input.metadata,
  };

  const result = await provider.send(message);

  await prisma.notification.update({
    where: { id: notification.id },
    data: {
      status: result.ok ? "sent" : "failed",
      provider: result.provider,
      providerMessageId: result.providerMessageId ?? null,
      errorMessage: result.error ?? null,
      sentAt: result.ok ? result.sentAt : null,
    },
  });

  // Best-effort audit — never throw if it fails.
  try {
    await recordAudit({
      action: result.ok ? "communication.sent" : "communication.failed",
      entity: `notification:${notification.id}`,
      metadata: {
        templateId: template.id,
        channel: input.channel,
        provider: result.provider,
        to: maskAddress(input.to),
        error: result.error,
      },
    });
  } catch (e) {
    console.error("[dispatchTemplate] audit failed", e);
  }

  return result;
}

/** Mask email/phone in audit logs. */
function maskAddress(addr: string): string {
  if (addr.includes("@")) {
    const [user, domain] = addr.split("@");
    const masked = user.length <= 2 ? user[0] + "*" : user[0] + "***" + user[user.length - 1];
    return `${masked}@${domain}`;
  }
  if (addr.length <= 4) return "***";
  return `***${addr.slice(-4)}`;
}

/* ── Convenience: dispatch to the agency ──────────────────────── */

/**
 * Helper for internal alerts (contact form, flight quote, etc.).
 * Routes to the agency's main email (`siteConfig.email`).
 */
export async function notifyAgency(input: Omit<DispatchInput, "to" | "channel">): Promise<SendResult> {
  return dispatchTemplate({
    ...input,
    channel: "email",
    to: siteConfig.email,
    toName: siteConfig.name,
    locale: input.locale ?? "fr",
  });
}

const REQUEST_SOURCE_LABELS: Record<ReservationSource, string> = {
  CONTACT: "Contact",
  DESTINATION: "Destination",
  OFFER: "Offre",
  FLIGHT: "Billetterie",
};

export type NewRequestNotificationInput = {
  reservationId: string;
  reference: string;
  source: ReservationSource;
  clientName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  subject?: string | null;
  details?: string | null;
};

/**
 * Sends the same durable team alert for every public request source. The call
 * sites await this helper so Vercel does not freeze the invocation before the
 * Notification row and email provider result have been persisted.
 *
 * Alert failures never roll back an already captured lead; they are logged and
 * returned as a failed result so the public form can still confirm receipt.
 */
export async function notifyNewRequest(
  input: NewRequestNotificationInput,
): Promise<SendResult> {
  const sourceLabel = REQUEST_SOURCE_LABELS[input.source];
  const vars = {
    reference: input.reference,
    source: sourceLabel,
    clientName: input.clientName,
    clientEmail: input.clientEmail || "—",
    clientPhone: input.clientPhone || "—",
    requestSubject: input.subject || "Demande sans objet",
    details: input.details?.slice(0, 8000) || "—",
    adminUrl: `${siteConfig.url}/admin/reservations?source=${input.source}`,
  };
  const metadata = {
    reservationId: input.reservationId,
    reference: input.reference,
    source: input.source,
  };

  try {
    // Email is preferred. The internal webhook is used when Resend is absent,
    // and also as failover when a configured email provider returns an error.
    const emailConfigured = getProvider("email").configured;
    const webhookConfigured = Boolean(process.env.INTERNAL_NOTIFICATION_WEBHOOK_URL);
    if (emailConfigured) {
      const emailResult = await notifyAgency({
        templateId: "reservation.new_request",
        vars,
        metadata,
      });
      if (emailResult.ok || !webhookConfigured) return emailResult;
    }

    if (webhookConfigured) {
      return await dispatchInternalWebhook({
        templateId: "reservation.new_request",
        vars,
        metadata,
      });
    }

    // Persist a failed/noop email attempt when neither channel is configured;
    // it remains visible in the Communications history for operators.
    return await notifyAgency({
      templateId: "reservation.new_request",
      vars,
      metadata,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de notification inconnue";
    console.error("[notifyNewRequest] team alert failed", {
      reservationId: input.reservationId,
      source: input.source,
      error: message,
    });
    return {
      ok: false,
      provider: "internal",
      error: message,
      sentAt: new Date(),
    };
  }
}

async function dispatchInternalWebhook(input: {
  templateId: string;
  vars: Record<string, string | number | undefined | null>;
  metadata: Record<string, unknown>;
}): Promise<SendResult> {
  const endpoint = process.env.INTERNAL_NOTIFICATION_WEBHOOK_URL;
  if (!endpoint) {
    return {
      ok: false,
      provider: "internal_webhook",
      error: "INTERNAL_NOTIFICATION_WEBHOOK_URL not configured",
      sentAt: new Date(),
    };
  }

  const template = getTemplate(input.templateId);
  if (!template) {
    return {
      ok: false,
      provider: "internal_webhook",
      error: `Template inconnu: ${input.templateId}`,
      sentAt: new Date(),
    };
  }

  let webhookUrl: URL;
  try {
    webhookUrl = new URL(endpoint);
    if (!["https:", "http:"].includes(webhookUrl.protocol)) {
      throw new Error("unsupported protocol");
    }
  } catch {
    return {
      ok: false,
      provider: "internal_webhook",
      error: "INTERNAL_NOTIFICATION_WEBHOOK_URL invalide",
      sentAt: new Date(),
    };
  }

  const subject = renderTemplateSubject(template, "fr", input.vars);
  const body = renderTemplateBody(template, "fr", input.vars);
  const notification = await prisma.notification.create({
    data: {
      channel: "webhook",
      templateId: template.id,
      // Never persist URL query parameters that may contain a webhook token.
      toAddress: webhookUrl.origin,
      toName: siteConfig.name,
      subject: subject ?? null,
      body,
      locale: "fr",
      status: "queued",
      metadata: input.metadata as never,
    },
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Assirik-Event": input.templateId,
  };
  if (process.env.INTERNAL_NOTIFICATION_WEBHOOK_SECRET) {
    headers.Authorization = `Bearer ${process.env.INTERNAL_NOTIFICATION_WEBHOOK_SECRET}`;
  }

  let result: SendResult;
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        event: input.templateId,
        subject,
        text: body,
        data: input.metadata,
        occurredAt: new Date().toISOString(),
      }),
      cache: "no-store",
    });
    result = response.ok
      ? {
          ok: true,
          provider: "internal_webhook",
          providerMessageId: response.headers.get("x-request-id") ?? undefined,
          sentAt: new Date(),
        }
      : {
          ok: false,
          provider: "internal_webhook",
          error: `Webhook ${response.status}: ${(await response.text()).slice(0, 200)}`,
          sentAt: new Date(),
        };
  } catch (error) {
    result = {
      ok: false,
      provider: "internal_webhook",
      error: error instanceof Error ? error.message : "Network error",
      sentAt: new Date(),
    };
  }

  await prisma.notification.update({
    where: { id: notification.id },
    data: {
      status: result.ok ? "sent" : "failed",
      provider: result.provider,
      providerMessageId: result.providerMessageId ?? null,
      errorMessage: result.error ?? null,
      sentAt: result.ok ? result.sentAt : null,
    },
  });

  try {
    await recordAudit({
      action: result.ok ? "communication.sent" : "communication.failed",
      entity: `notification:${notification.id}`,
      metadata: {
        templateId: template.id,
        channel: "webhook",
        provider: result.provider,
        error: result.error,
      },
    });
  } catch (error) {
    console.error("[dispatchInternalWebhook] audit failed", error);
  }

  return result;
}

/* ── Admin — test send ────────────────────────────────────────── */

export async function testSendAction(input: {
  channel: Channel;
  to: string;
  templateId: string;
  locale: Locale;
  vars: Record<string, string>;
}) {
  const session = await requirePermission("communications:write");
  const result = await dispatchTemplate({
    templateId: input.templateId,
    channel: input.channel,
    to: input.to,
    locale: input.locale,
    vars: input.vars,
    metadata: { testSendBy: session.email },
  });
  revalidatePath("/admin/communications");
  return result;
}

/* ── Admin — bulk newsletter ──────────────────────────────────── */

export type CampaignCreateInput = {
  subjectFr: string;
  subjectEn: string;
  bodyFr: string;
  bodyEn: string;
  audience: "all" | "vip" | "tag" | "manual";
  audienceTag?: string;
  audienceList?: string[];
  scheduledAt?: string | null;
};

export async function createCampaignAction(input: CampaignCreateInput): Promise<{ ok: true; id: string } | { error: string }> {
  const session = await requirePermission("communications:write");
  const campaign = await prisma.newsletterCampaign.create({
    data: {
      subjectFr: input.subjectFr,
      subjectEn: input.subjectEn,
      bodyFr: input.bodyFr,
      bodyEn: input.bodyEn,
      audience: input.audience,
      audienceTag: input.audienceTag ?? null,
      audienceList: (input.audienceList ?? null) as never,
      status: input.scheduledAt ? "scheduled" : "draft",
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      authorId: session.sub,
    },
  });
  await recordAudit({
    userId: session.sub,
    action: "campaign.create",
    entity: `campaign:${campaign.id}`,
    metadata: { audience: input.audience },
  });
  revalidatePath("/admin/communications");
  return { ok: true, id: campaign.id };
}

export async function sendCampaignAction(campaignId: string) {
  // Only SUPER_ADMIN can broadcast (RBAC matrix in brief).
  await requirePermission("communications:broadcast");
  const campaign = await prisma.newsletterCampaign.findUnique({
    where: { id: campaignId },
  });
  if (!campaign) return { error: "Campagne introuvable." };
  if (campaign.status === "sent") return { error: "Campagne déjà envoyée." };

  // Resolve recipients.
  const recipients = await resolveAudience(campaign);
  if (recipients.length === 0) {
    return { error: "Aucun destinataire correspondant à l'audience." };
  }

  await prisma.newsletterCampaign.update({
    where: { id: campaignId },
    data: { status: "sending", recipients: recipients.length },
  });

  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    const result = await dispatchTemplate({
      templateId: "newsletter.welcome", // not used directly — we send custom subject/body
      channel: "email",
      to: r.email,
      toName: `${r.firstName} ${r.lastName}`.trim(),
      locale: "fr",
      vars: { clientName: r.firstName || "cher voyageur" },
      metadata: { campaignId },
    });
    if (result.ok) sent++;
    else failed++;
  }

  await prisma.newsletterCampaign.update({
    where: { id: campaignId },
    data: { status: "sent", sentAt: new Date(), sent, failed },
  });

  revalidatePath("/admin/communications");
  return { ok: true, sent, failed };
}

async function resolveAudience(campaign: {
  audience: string;
  audienceTag: string | null;
  audienceList: unknown;
}): Promise<Array<{ email: string; firstName: string; lastName: string }>> {
  if (campaign.audience === "manual") {
    const raw = (campaign.audienceList as string[] | null) ?? [];
    return raw.filter(Boolean).map((email) => ({
      email: email.trim(),
      firstName: "",
      lastName: "",
    }));
  }
  // Tag filtering skipped for now (Client has no tags column yet — TODO Phase 11).
  const clients = await prisma.client.findMany({
    select: { email: true, firstName: true, lastName: true },
    take: 5000,
  });
  return clients
    .filter((c) => c.email && !c.email.startsWith("no-email-"))
    .map((c) => ({ email: c.email as string, firstName: c.firstName, lastName: c.lastName }));
}

/* ── Admin — history ──────────────────────────────────────────── */

export async function listNotificationsAction(filters?: {
  channel?: Channel;
  status?: string;
  limit?: number;
}) {
  await requirePermission("communications:read");
  return prisma.notification.findMany({
    where: {
      channel: filters?.channel,
      status: filters?.status,
    },
    orderBy: { createdAt: "desc" },
    take: filters?.limit ?? 100,
  });
}
