"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  parsePublicTestimonialForm,
  toTestimonialData,
  type TestimonialLocale,
} from "@/lib/validators/testimonial";
import {
  checkHoneypot,
  formRateLimit,
} from "@/lib/validators/public-forms";
import { recordAudit } from "@/lib/audit";

/**
 * Server action for the PUBLIC testimonial submission form (no auth).
 *
 * Submissions always land in the DB with `approved = false` — they wait
 * for a human moderator in the back-office (`/admin/temoignages`, status
 * filter "En attente"). This protects the public surface from prompt
 * injection and one-star revenge reviews.
 */

export type SubmitTestimonialState =
  | { ok: true; reference: string }
  | { ok: false; error: string }
  | null;

function makeReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `AT-AVIS-${year}-${rand}`;
}

export async function submitTestimonialAction(
  _prev: SubmitTestimonialState,
  formData: FormData,
): Promise<SubmitTestimonialState> {
  if (checkHoneypot(formData)) {
    return { ok: true, reference: "AT-AVIS-DISCARDED" };
  }

  const limited = formRateLimit(`testimonial|${String(formData.get("email") ?? "").toLowerCase()}`, {
    windowMs: 5 * 60 * 1000,
    max: 1,
    lockMs: 5 * 60 * 1000,
  });
  if (!limited.ok) return { ok: false, error: limited.error };

  // Locale is taken from the i18n cookie, NOT from the form — protects
  // against attackers posting the form in a non-public locale.
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale")?.value;
  const locale: TestimonialLocale = localeCookie === "en" ? "en" : "fr";

  const parsed = parsePublicTestimonialForm(formData, locale);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  // Light rate-limit: refuse if the same author + email submitted in the
  // last 5 minutes. Protects against double-clicks and trivial spam.
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recent = await prisma.testimonial.findFirst({
    where: {
      author: parsed.data.author,
      createdAt: { gte: fiveMinAgo },
    },
    select: { id: true },
  });
  if (recent) {
    return {
      ok: false,
      error:
        "Un témoignage identique a déjà été soumis il y a quelques minutes. Merci de patienter avant de réessayer.",
    };
  }

  // Persist with approved=false (moderation queue). All other fields come
  // straight from the validated input — no client-side override possible.
  const data = toTestimonialData({ ...parsed.data, approved: false });
  const created = await prisma.testimonial.create({ data });

  const reference = makeReference();
  void created; // we don't expose the id publicly — only the reference

  await recordAudit({
    action: "public.testimonial.submit",
    metadata: { reference, locale },
  });

  revalidatePath("/admin/temoignages");
  revalidatePath("/temoignages");

  return { ok: true, reference };
}
