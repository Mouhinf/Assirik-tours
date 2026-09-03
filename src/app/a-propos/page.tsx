import type { Metadata } from "next";
import { PageBlockRenderer } from "@/components/site/page-block-renderer";
import { getPageContent } from "@/lib/page-content-actions";
import { siteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { AProposFallback } from "@/components/site/a-propos-fallback";
import { getLocaleCookie } from "@/lib/i18n-actions";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n";

const TITLES = { fr: "À propos", en: "About us" } as const;
const DESCRIPTIONS = {
  fr: "L'histoire d'Assirik Tours, notre équipe, nos agréments et notre manière de travailler — pour comprendre à qui vous confiez votre voyage.",
  en: "The story behind Assirik Tours, our team, credentials, and the way we work — so you know exactly who handles your trip.",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const cookieLocale = await getLocaleCookie();
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const db = await getPageContent("about", locale);
  const fallbackDb = locale === DEFAULT_LOCALE ? null : await getPageContent("about", DEFAULT_LOCALE);
  const effective = db ?? fallbackDb;
  const title = effective?.seoMeta.title || effective?.title || TITLES[locale];
  const description = effective?.seoMeta.description || DESCRIPTIONS[locale];
  return {
    title,
    description,
    alternates: {
      canonical: "/a-propos",
      languages: { "fr-FR": "/a-propos", "en-US": "/a-propos" },
    },
    openGraph: {
      title,
      description,
      url: "/a-propos",
      type: "website",
      images: effective?.seoMeta.ogImage ? [{ url: effective.seoMeta.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AProposPage() {
  const cookieLocale = await getLocaleCookie();
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const db = await getPageContent("about", locale);
  const fallbackDb = locale === DEFAULT_LOCALE ? null : await getPageContent("about", DEFAULT_LOCALE);
  const effective = db ?? fallbackDb;

  return (
    <>
      {effective ? (
        effective.blocks.map((block, i) => (
          <PageBlockRenderer key={i} block={block} />
        ))
      ) : (
        <AProposFallback agencyName={siteConfig.name} city={siteConfig.address.city} />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: locale === "en" ? "Home" : "Accueil", url: "/" },
              { name: effective?.title || TITLES[locale], url: "/a-propos" },
            ]),
          ),
        }}
      />
    </>
  );
}
