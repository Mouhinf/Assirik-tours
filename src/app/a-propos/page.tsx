import type { Metadata } from "next";
import { PageBlockRenderer } from "@/components/site/page-block-renderer";
import { getPageContent } from "@/lib/page-content-actions";
import { siteConfig } from "@/lib/site-config";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { AProposFallback } from "@/components/site/a-propos-fallback";

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

  return (
    <>
      {db ? (
        db.blocks.map((block, i) => (
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
              { name: "Accueil", url: "/" },
              { name: db?.title || "À propos", url: "/a-propos" },
            ]),
          ),
        }}
      />
    </>
  );
}
