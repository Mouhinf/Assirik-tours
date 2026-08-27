/**
 * Site settings — a small key/value store for agency copy (whatsapp
 * number, tagline, footer text). Backed by a simple JSON column on a
 * singleton row so admins can edit it from the back-office.
 */
import { prisma } from "@/lib/prisma";
import { siteConfig as fallback } from "@/lib/site-config";

type SiteSettings = {
  whatsappNumber: string;
  landline: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  hoursWeekdays: string;
  hoursSaturday: string;
  hoursSunday: string;
  tagline: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
};

const DEFAULTS: SiteSettings = {
  whatsappNumber: fallback.phones.whatsappTel,
  landline: fallback.phones.landlineTel,
  email: fallback.email,
  addressLine1: fallback.address.line1,
  addressLine2: fallback.address.line2,
  city: fallback.address.city,
  country: fallback.address.country,
  hoursWeekdays: fallback.hours.weekdays,
  hoursSaturday: fallback.hours.saturday,
  hoursSunday: fallback.hours.sunday,
  tagline: fallback.tagline,
  socialFacebook: fallback.social.facebook,
  socialInstagram: fallback.social.instagram,
  socialLinkedin: fallback.social.linkedin,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
  if (!row) return DEFAULTS;
  return { ...DEFAULTS, ...(row.data as Partial<SiteSettings>) };
}

export async function saveSiteSettings(data: Partial<SiteSettings>) {
  const next = { ...DEFAULTS, ...data };
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", data: next as never },
    update: { data: next as never },
  });
}
