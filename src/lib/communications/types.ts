/**
 * Outbound communications — shared types.
 *
 * A `Message` is a fully-rendered payload (subject + body for email,
 * body for SMS/WhatsApp) that one of the providers can dispatch.
 * Templates are resolved upstream by `communications-actions.ts`.
 */

export type Channel = "email" | "sms" | "whatsapp";

export type Locale = "fr" | "en";

export type Message = {
  channel: Channel;
  /** Email address (email) or E.164 phone number (sms/whatsapp). */
  to: string;
  toName?: string;
  subject?: string; // email only
  body: string;
  /** Optional HTML body for email — falls back to plain text otherwise. */
  html?: string;
  /** Optional Reply-To override. */
  replyTo?: string;
  metadata?: Record<string, unknown>;
};

export type SendResult = {
  ok: boolean;
  /** Provider-specific message id (Resend id, Twilio sid, WhatsApp message id). */
  providerMessageId?: string;
  /** Name of the provider that handled the send (or "noop" if skipped). */
  provider?: string;
  error?: string;
  sentAt: Date;
};

export type Provider = {
  readonly name: string;
  readonly channel: Channel;
  /** Reports whether the provider is ready (credentials configured). */
  readonly configured: boolean;
  send(message: Message): Promise<SendResult>;
};

/** Renders a `{{var}}` template body with the provided variables. */
export function renderTemplate(
  text: string,
  vars: Record<string, string | number | undefined | null>,
): string {
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const v = vars[key];
    return v == null ? "" : String(v);
  });
}

/** HTML-escape for safe interpolation into HTML email bodies. */
export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
