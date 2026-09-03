import type { Metadata } from "next";
import { PageBlockRenderer } from "@/components/site/page-block-renderer";
import { getPageContent } from "@/lib/page-content-actions";
import { PageHero } from "@/components/site/page-hero";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { ServiceGrid } from "@/components/site/service-grid";
import { listActiveServices } from "@/lib/service-actions";
import { getLocaleCookie } from "@/lib/i18n-actions";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n";

const TITLES = { fr: "Services", en: "Services" } as const;
const DESCRIPTIONS = {
  fr: "Assistance visa, hôtels, location de véhicule avec chauffeur, assurance voyage, transferts aéroport — tous les services complémentaires d'Assirik Tours.",
  en: "Visa assistance, hotels, chauffeured car hire, travel insurance, airport transfers — every side service Assirik Tours coordinates for you.",
} as const;
const FALLBACK_TITLES = { fr: "Tout ce qu'il faut autour du billet", en: "Everything you need around the ticket" } as const;
const FALLBACK_DESCRIPTIONS = {
  fr: "Voyager, c'est aussi régler les formalités et le confort sur place. Voici les services que nous coordonnons pour vous.",
  en: "Travel is also about paperwork and on-the-ground comfort. Here are the services we coordinate for you.",
} as const;
const FALLBACK_EYEBROWS = { fr: "Services", en: "Services" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const cookieLocale = await getLocaleCookie();
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const db = await getPageContent("services", locale);
  const fallbackDb = locale === DEFAULT_LOCALE ? null : await getPageContent("services", DEFAULT_LOCALE);
  const effective = db ?? fallbackDb;
  const title = effective?.seoMeta.title || effective?.title || TITLES[locale];
  const description = effective?.seoMeta.description || DESCRIPTIONS[locale];
  return {
    title,
    description,
    alternates: {
      canonical: "/services",
      languages: { "fr-FR": "/services", "en-US": "/services" },
    },
    openGraph: {
      title,
      description,
      url: "/services",
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

export default async function ServicesPage() {
  const cookieLocale = await getLocaleCookie();
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const [db, services] = await Promise.all([
    getPageContent("services", locale),
    listActiveServices(),
  ]);
  const fallbackDb = locale === DEFAULT_LOCALE ? null : await getPageContent("services", DEFAULT_LOCALE);
  const effective = db ?? fallbackDb;

  return (
    <>
      {effective ? (
        effective.blocks.map((block, i) => (
          <PageBlockRenderer key={i} block={block} />
        ))
      ) : (
        <>
          <PageHero
            eyebrow={FALLBACK_EYEBROWS[locale]}
            title={FALLBACK_TITLES[locale]}
            description={FALLBACK_DESCRIPTIONS[locale]}
          />
          <section className="container-narrow pb-10">
            <p className="rounded-xl border border-sand-deep bg-sand p-6 text-center text-sm text-graphite">
              {locale === "en"
                ? "Our service catalogue is being enriched — the cards below are already live."
                : "Le détail de nos prestations est en cours d'enrichissement — vous pouvez déjà consulter les services ci-dessous."}
            </p>
          </section>
        </>
      )}

      <ServiceGrid services={services} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: locale === "en" ? "Home" : "Accueil", url: "/" },
              { name: effective?.title || TITLES[locale], url: "/services" },
            ]),
          ),
        }}
      />
    </>
  );
}
