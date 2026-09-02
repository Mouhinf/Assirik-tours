import type { Metadata } from "next";
import { PageBlockRenderer } from "@/components/site/page-block-renderer";
import { getPageContent } from "@/lib/page-content-actions";
import { PageHero } from "@/components/site/page-hero";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { ServiceGrid } from "@/components/site/service-grid";
import { listActiveServices } from "@/lib/service-actions";

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
  const [db, services] = await Promise.all([
    getPageContent("services", "fr"),
    listActiveServices(),
  ]);

  return (
    <>
      {db ? (
        db.blocks.map((block, i) => (
          <PageBlockRenderer key={i} block={block} />
        ))
      ) : (
        <>
          <PageHero
            eyebrow="Services"
            title="Tout ce qu'il faut autour du billet"
            description="Voyager, c'est aussi régler les formalités et le confort sur place. Voici les services que nous coordonnons pour vous."
          />
          <section className="container-narrow pb-10">
            <p className="rounded-xl border border-sand-deep bg-sand p-6 text-center text-sm text-graphite">
              Le détail de nos prestations est en cours d&apos;enrichissement — vous
              pouvez déjà consulter les services ci-dessous.
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
              { name: "Accueil", url: "/" },
              { name: db?.title || "Services", url: "/services" },
            ]),
          ),
        }}
      />
    </>
  );
}
