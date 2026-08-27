"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-actions";
import { saveSiteSettings } from "@/lib/site-settings";
import { recordAudit } from "@/lib/audit";

export async function saveSiteSettingsAction(formData: FormData) {
  const session = await requirePermission("settings:write");
  await saveSiteSettings({
    whatsappNumber: String(formData.get("whatsappNumber") ?? "").trim(),
    landline: String(formData.get("landline") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    addressLine1: String(formData.get("addressLine1") ?? "").trim(),
    addressLine2: String(formData.get("addressLine2") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    hoursWeekdays: String(formData.get("hoursWeekdays") ?? "").trim(),
    hoursSaturday: String(formData.get("hoursSaturday") ?? "").trim(),
    hoursSunday: String(formData.get("hoursSunday") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    socialFacebook: String(formData.get("socialFacebook") ?? "").trim(),
    socialInstagram: String(formData.get("socialInstagram") ?? "").trim(),
    socialLinkedin: String(formData.get("socialLinkedin") ?? "").trim(),
  });
  await recordAudit({
    userId: session.sub,
    action: "settings.update",
    metadata: { surface: "site-settings" },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
