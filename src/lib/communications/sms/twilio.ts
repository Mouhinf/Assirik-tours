/**
 * Twilio Programmable SMS — outbound transactional.
 * Docs: https://www.twilio.com/docs/sms/api
 *
 * Falls back to no-op if `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN`
 * / `TWILIO_FROM` are missing.
 */
import "server-only";
import type { Provider, Message, SendResult } from "../types";

function configured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM,
  );
}

function authHeader(): string {
  const sid = process.env.TWILIO_ACCOUNT_SID ?? "";
  const token = process.env.TWILIO_AUTH_TOKEN ?? "";
  return "Basic " + Buffer.from(`${sid}:${token}`).toString("base64");
}

function twilioUrl(): string {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  return `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
}

async function dispatch(message: Message): Promise<SendResult> {
  if (!configured()) {
    console.warn("[communications/sms] Twilio creds missing — skipping send", {
      to: message.to,
    });
    return {
      ok: false,
      provider: "noop",
      error: "Twilio not configured",
      sentAt: new Date(),
    };
  }
  try {
    const form = new URLSearchParams({
      To: message.to,
      From: process.env.TWILIO_FROM ?? "",
      Body: message.body,
    });
    const res = await fetch(twilioUrl(), {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        provider: "twilio",
        error: `Twilio ${res.status}: ${text.slice(0, 200)}`,
        sentAt: new Date(),
      };
    }
    const json = (await res.json()) as { sid?: string };
    return {
      ok: true,
      provider: "twilio",
      providerMessageId: json.sid,
      sentAt: new Date(),
    };
  } catch (e) {
    return {
      ok: false,
      provider: "twilio",
      error: e instanceof Error ? e.message : "Network error",
      sentAt: new Date(),
    };
  }
}

export const twilioProvider: Provider = {
  name: "twilio",
  channel: "sms",
  get configured() {
    return configured();
  },
  send: dispatch,
};
