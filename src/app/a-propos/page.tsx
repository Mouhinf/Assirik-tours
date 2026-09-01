import type { Metadata } from "next";
import { PageBlockRenderer } from "@/components/site/page-block-renderer";
import { getPageContent } from "@/lib/page-content-actions";
import { siteConfig } from "@/lib/site-config";
import { PageHero } from "@/components/site/page-hero";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export async function generateMetadata(): Promise<Metadata> {
  const db = await getPageContent("about", "fr");
  const title = db?.seoMeta.title || db?.title || "À propos";
  const description =
    db?.seoMeta.description ||
    "L'histoire d'Assirik Tours, notre équipe, nos agréments et notre manière de travailler — pour comprendre à qui vous confiez votre voyage.";
  return {
    title,
    description,
    alternates: { canonical: "/a-propos" },
    openGraph: {
      title,
      description,
      url: "/a-propos",
      type: "website",
      images: db?.seoMeta.ogImage ? [{ url: db.seoMeta.ogImage }] : undefined,
    },
  };
}

export default async function AProposPage() {
  const db = await getPageContent("about", "fr");

  if (!db) {
    return (
      <>
        <PageHero
          eyebrow="À propos"
          title="Une agence dakaroise, pas une plateforme"
          description={`${siteConfig.name} est une agence de voyages installée à ${siteConfig.address.city}, spécialisée dans l'organisation de voyages depuis le Sénégal — pour les Sénégalais, les résidents et la diaspora.`}
        />
        <section className="container-narrow pb-20">
          <p className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
            Le contenu détaillé de la page À propos sera bientôt disponible.
          </p>
        </section>
      </>
    );
  }

  return (
    <>
      {db.blocks.map((block, i) => (
        <PageBlockRenderer key={i} block={block} />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Accueil", url: "/" },
              { name: db.title || "À propos", url: "/a-propos" },
            ]),
          ),
        }}
      />
    </>
  );
}
