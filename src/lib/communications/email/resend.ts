/**
 * Resend — email transactional provider.
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 *
 * If `RESEND_API_KEY` is not set the provider degrades to a no-op that
 * still logs the would-be email so dev/preview environments can run
 * without secrets.
 */
import "server-only";
import type { Provider, Message, SendResult } from "../types";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function configured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

async function dispatch(message: Message): Promise<SendResult> {
  if (!configured()) {
    console.warn(
      "[communications/email] RESEND_API_KEY missing — skipping send",
      { to: message.to, subject: message.subject },
    );
    return {
      ok: false,
      provider: "noop",
      error: "RESEND_API_KEY not configured",
      sentAt: new Date(),
    };
  }
  const from = process.env.RESEND_FROM_EMAIL ?? "Assirik Tours <noreply@assiriktours.sn>";
  const payload = {
    from,
    to: message.toName ? `${message.toName} <${message.to}>` : message.to,
    subject: message.subject ?? "(sans objet)",
    text: message.body,
    html: message.html,
    reply_to: message.replyTo,
    headers: {
      "List-Unsubscribe": `<mailto:unsubscribe@assiriktours.sn?subject=unsubscribe>`,
    },
  };
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        provider: "resend",
        error: `Resend ${res.status}: ${text.slice(0, 200)}`,
        sentAt: new Date(),
      };
    }
    const json = (await res.json()) as { id?: string };
    return {
      ok: true,
      provider: "resend",
      providerMessageId: json.id,
      sentAt: new Date(),
    };
  } catch (e) {
    return {
      ok: false,
      provider: "resend",
      error: e instanceof Error ? e.message : "Network error",
      sentAt: new Date(),
    };
  }
}

export const resendProvider: Provider = {
  name: "resend",
  channel: "email",
  get configured() {
    return configured();
  },
  send: dispatch,
};
