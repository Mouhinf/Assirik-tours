import type { Metadata } from "next";
import { PageBlockRenderer } from "@/components/site/page-block-renderer";
import { getPageContent } from "@/lib/page-content-actions";
import { PageHero } from "@/components/site/page-hero";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export async function generateMetadata(): Promise<Metadata> {
  const db = await getPageContent("services", "fr");
  const title = db?.seoMeta.title || db?.title || "Services";
  const description =
    db?.seoMeta.description ||
    "Assistance visa, hôtels, location de véhicule avec chauffeur, assurance voyage, transferts aéroport — tous les services complémentaires d'Assirik Tours.";
  return {
    title,
    description,
    alternates: { canonical: "/services" },
    openGraph: {
      title,
      description,
      url: "/services",
      type: "website",
      images: db?.seoMeta.ogImage ? [{ url: db.seoMeta.ogImage }] : undefined,
    },
  };
}

export default async function ServicesPage() {
  const db = await getPageContent("services", "fr");

  if (!db) {
    return (
      <>
        <PageHero
          eyebrow="Services"
          title="Tout ce qu'il faut autour du billet"
          description="Voyager, c'est aussi régler les formalités et le confort sur place. Voici les services que nous coordonnons pour vous."
        />
        <section className="container-narrow pb-20">
          <p className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
            Le détail des services sera bientôt disponible.
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
              { name: db.title || "Services", url: "/services" },
            ]),
          ),
        }}
      />
    </>
  );
}
