/**
 * WhatsApp Cloud API (Meta) — outbound transactional.
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/messages
 *
 * Requires:
 *   - WHATSAPP_CLOUD_PHONE_ID
 *   - WHATSAPP_CLOUD_ACCESS_TOKEN (system user token)
 *
 * If missing, the provider no-ops (logged).
 *
 * NOTE: For production, the recipient phone number must be opted-in
 * (24h customer service window, or template message outside the window).
 * Templates require Meta approval — see templates section in `templates.ts`.
 */
import "server-only";
import type { Provider, Message, SendResult } from "../types";

const API_VERSION = "v21.0";

function configured(): boolean {
  return Boolean(
    process.env.WHATSAPP_CLOUD_PHONE_ID && process.env.WHATSAPP_CLOUD_ACCESS_TOKEN,
  );
}

function endpoint(): string {
  const phoneId = process.env.WHATSAPP_CLOUD_PHONE_ID;
  return `https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`;
}

async function dispatch(message: Message): Promise<SendResult> {
  if (!configured()) {
    console.warn(
      "[communications/whatsapp] Cloud API creds missing — skipping send",
      { to: message.to },
    );
    return {
      ok: false,
      provider: "noop",
      error: "WhatsApp Cloud API not configured",
      sentAt: new Date(),
    };
  }
  try {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: message.to.replace(/[^\d+]/g, ""),
      type: "text",
      text: { preview_url: false, body: message.body },
    };
    const res = await fetch(endpoint(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        provider: "whatsapp_cloud",
        error: `WhatsApp ${res.status}: ${text.slice(0, 200)}`,
        sentAt: new Date(),
      };
    }
    const json = (await res.json()) as {
      messages?: Array<{ id?: string }>;
    };
    return {
      ok: true,
      provider: "whatsapp_cloud",
      providerMessageId: json.messages?.[0]?.id,
      sentAt: new Date(),
    };
  } catch (e) {
    return {
      ok: false,
      provider: "whatsapp_cloud",
      error: e instanceof Error ? e.message : "Network error",
      sentAt: new Date(),
    };
  }
}

export const whatsappCloudProvider: Provider = {
  name: "whatsapp_cloud",
  channel: "whatsapp",
  get configured() {
    return configured();
  },
  send: dispatch,
};
