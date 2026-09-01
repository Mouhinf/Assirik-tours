/**
 * Provider factory + queue processing entry point.
 *
 * Each channel picks the active provider by env var. If no credentials
 * are set the provider is a no-op that still returns a structured
 * SendResult (so dev/preview environments can run).
 */
import "server-only";
import { resendProvider } from "./email/resend";
import { twilioProvider } from "./sms/twilio";
import { whatsappCloudProvider } from "./whatsapp/cloud";
import type { Channel, Provider } from "./types";

export function getProvider(channel: Channel): Provider {
  switch (channel) {
    case "email":
      return resendProvider;
    case "sms":
      return twilioProvider;
    case "whatsapp":
      return whatsappCloudProvider;
  }
}

export function getProvidersStatus(): Record<Channel, { provider: string; configured: boolean }> {
  return {
    email: { provider: resendProvider.name, configured: resendProvider.configured },
    sms: { provider: twilioProvider.name, configured: twilioProvider.configured },
    whatsapp: { provider: whatsappCloudProvider.name, configured: whatsappCloudProvider.configured },
  };
}

export { type Channel, type Message, type SendResult, type Provider } from "./types";
export { TEMPLATES, getTemplate, renderTemplateBody, renderTemplateSubject, renderHtmlEmail } from "./templates";
