"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-actions";
import { recordAudit } from "@/lib/audit";
import { saveFlightConfig } from "@/lib/flight-config";

export async function saveFlightConfigAction(formData: FormData) {
  const session = await requirePermission("settings:write");
  const notes = String(formData.get("notes") ?? "");
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  await saveFlightConfig({ notes, contactEmail, contactPhone });
  await recordAudit({
    userId: session.sub,
    action: "flight.config.update",
    metadata: {
      hasNotes: notes.trim().length > 0,
      hasEmail: contactEmail.length > 0,
      hasPhone: contactPhone.length > 0,
    },
  });
  revalidatePath("/admin/billetterie");
  return { ok: true };
}
