import type { Metadata } from "next";
import Link from "next/link";
import { PageBlockRenderer } from "@/components/site/page-block-renderer";
import { getPageContent } from "@/lib/page-content-actions";
import { PageHero } from "@/components/site/page-hero";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { ServiceGrid } from "@/components/site/service-grid";
import { listActiveServices } from "@/lib/service-actions";
import { getLocaleCookie } from "@/lib/i18n-actions";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import { whatsappLink } from "@/lib/whatsapp";

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

const TRUST_ITEMS = {
  fr: [
    { title: "Une équipe sur place", body: "Tous nos prestataires sont testés ou visités par l'équipe Assirik à Dakar." },
    { title: "Devis transparent", body: "Pas de frais cachés : le prix annoncé est le prix payé, ou le devis détaillé est gratuit." },
    { title: "Réponse sous 24h ouvrées", body: "Un conseiller — pas un robot — reprend votre demande et vous rappelle." },
  ],
  en: [
    { title: "An on-the-ground team", body: "Every provider is tested or visited by the Assirik team in Dakar." },
    { title: "Transparent quotes", body: "No hidden fees — the price we quote is the price you pay, or the detailed quote is free." },
    { title: "Reply within 24 business hours", body: "A person — not a bot — picks up your request and calls you back." },
  ],
} as const;

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

  const isFr = locale === "fr";
  const navLabels = {
    visa: isFr ? "Visa" : "Visa",
    hotels: isFr ? "Hôtels" : "Hotels",
    chauffeur: isFr ? "Chauffeur" : "Car hire",
    transfert: isFr ? "Transferts" : "Transfers",
    assurance: isFr ? "Assurance" : "Insurance",
    entreprise: isFr ? "Entreprise" : "Corporate",
    autre: isFr ? "Autres" : "Other",
  } as const;

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

      {/* Sticky category nav — links to in-page anchors set by ServiceGrid */}
      {services.length > 0 ? (
        <nav
          aria-label={isFr ? "Catégories de services" : "Service categories"}
          className="sticky top-16 z-20 border-y border-sand-deep bg-sand/85 backdrop-blur"
        >
          <div className="container-narrow">
            <ul className="flex items-center gap-1 overflow-x-auto py-3 text-xs font-semibold uppercase tracking-wider text-navy">
              {(["visa", "hotels", "chauffeur", "transfert", "assurance", "entreprise", "autre"] as const).map(
                (key) => (
                  <li key={key}>
                    <a
                      href={`#cat-${key}`}
                      className="inline-flex items-center rounded-full px-3 py-1.5 hover:bg-ocean hover:text-sand transition-colors"
                    >
                      {navLabels[key]}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
        </nav>
      ) : null}

      {/* Trust strip — 3 quick value props */}
      <section className="container-narrow py-12">
        <div className="grid sm:grid-cols-3 gap-6">
          {TRUST_ITEMS[locale].map((t, i) => (
            <div
              key={i}
              className="rounded-xl bg-sand border border-sand-deep p-5"
            >
              <p className="font-display text-base font-semibold text-navy">
                {t.title}
              </p>
              <p className="mt-2 text-sm text-graphite leading-relaxed">
                {t.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ServiceGrid services={services} />

      {/* Bottom CTA strip — WhatsApp + contact form */}
      <section className="container-narrow pb-20">
        <div className="rounded-2xl bg-sand border border-sand-deep p-7 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-semibold text-navy">
              {isFr
                ? "Vous ne trouvez pas le service qu'il vous faut ?"
                : "Can't find the service you need?"}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-graphite leading-relaxed">
              {isFr
                ? "Décrivez-nous votre besoin — un conseiller voit avec vous comment l'organiser ou vous oriente vers le bon interlocuteur."
                : "Tell us what you need — a consultant will work with you on the best way to organise it, or direct you to the right contact."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappLink(
                isFr
                  ? "Bonjour Assirik Tours, j'ai un besoin de service qui ne figure pas dans votre catalogue."
                  : "Hello Assirik Tours, I need a service that isn't in your catalogue.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-sand hover:bg-whatsapp-hover transition-colors"
            >
              {isFr ? "Écrire sur WhatsApp" : "Message on WhatsApp"}
            </a>
            <Link
              href={isFr ? "/contact?objet=service-sur-mesure" : "/contact?objet=service-sur-mesure"}
              className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors"
            >
              {isFr ? "Demande écrite →" : "Send a written request →"}
            </Link>
          </div>
        </div>
      </section>

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
