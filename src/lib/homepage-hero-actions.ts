"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-actions";
import type { HomeHeroProps } from "@/lib/homepage-hero";

type SupportedLocale = "fr" | "en";

function strOrEmpty(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function strOrNull(v: FormDataEntryValue | null): string | null {
  const s = strOrEmpty(v);
  return s || null;
}

/**
 * Saves (or creates) the homepage hero config for one locale.
 * Upserts the PageContent row keyed by (slug="home-hero", locale).
 */
export async function saveHomeHeroAction(formData: FormData) {
  await requirePermission("page:write");

  const localeRaw = strOrEmpty(formData.get("locale"));
  const locale: SupportedLocale = localeRaw === "en" ? "en" : "fr";

  const props: HomeHeroProps = {
    eyebrow: strOrEmpty(formData.get("eyebrow")).slice(0, 120),
    title: strOrEmpty(formData.get("title")).slice(0, 120),
    titleAccent: strOrEmpty(formData.get("titleAccent")).slice(0, 120),
    description: strOrEmpty(formData.get("description")).slice(0, 400),
    primaryCtaLabel: strOrEmpty(formData.get("primaryCtaLabel")).slice(0, 60),
    primaryCtaHref: strOrEmpty(formData.get("primaryCtaHref")).slice(0, 200),
    whatsappMessage: strOrEmpty(formData.get("whatsappMessage")).slice(0, 300),
    heroImageId: strOrNull(formData.get("heroImageId")),
  };

  if (!props.title || !props.description || !props.primaryCtaLabel) {
    return { error: "Titre, description et libellé du CTA sont requis." };
  }

  // Title derived from the hero title (admin-facing label, never shown publicly).
  const adminTitle = `Hero accueil — ${locale.toUpperCase()}`;

  await prisma.pageContent.upsert({
    where: { slug_locale: { slug: "home-hero", locale } },
    create: {
      slug: "home-hero",
      locale,
      title: adminTitle,
      blocks: [{ type: "home-hero", props }],
      isActive: true,
    },
    update: {
      blocks: [{ type: "home-hero", props }],
      isActive: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/accueil");
  return { ok: true, locale };
}
