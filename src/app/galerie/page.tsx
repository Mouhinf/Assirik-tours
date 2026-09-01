import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { deliveryUrl } from "@/lib/cloudinary-url";
import { REGION_LABELS_GALLERY } from "@/lib/validators/gallery";
import { PageHero } from "@/components/site/page-hero";
import { GalleryGrid } from "./gallery-grid";

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "Photos de nos destinations et voyages organisés par l'équipe Assirik Tours : Sénégal, Omra, Maroc, Turquie, Dubaï.",
};

// Cache 60s — les uploads passent par revalidatePath, le cache est juste
// une assurance anti-stampede sur la home.
export const revalidate = 60;

export default async function GaleriePage() {
  const items = await prisma.galleryItem.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  // Featured subset — premier bandeau hero
  const featured = items.filter((it) => it.isFeatured).slice(0, 6);
  const rest = items.filter((it) => !featured.includes(it));

  // Sérialise en un type simple pour passer dans le composant client (lightbox).
  const serialized = items.map((item) => ({
    id: item.id,
    cloudinaryId: item.cloudinaryId,
    altText: item.altText,
    captionFr: item.captionFr,
    captionEn: item.captionEn,
    location: item.location,
    region: item.region,
    width: item.width,
    height: item.height,
  }));

  const featuredSerialized = featured.map((item) => ({
    id: item.id,
    cloudinaryId: item.cloudinaryId,
    altText: item.altText,
    captionFr: item.captionFr,
    location: item.location,
  }));

  return (
    <>
      <PageHero
        eyebrow="Galerie"
        title="Quelques images de nos destinations"
        description="Aperçu visuel du Sénégal et de nos voyages internationaux. Photographies éditoriales choisies pour donner le ton — pas des photos d'agence génériques."
      />

      {items.length === 0 ? (
        <section className="container-narrow pb-20">
          <p className="rounded-xl border border-sand-deep bg-sand p-8 text-center text-graphite">
            La galerie est en cours de constitution. Revenez bientôt !
          </p>
        </section>
      ) : (
        <GalleryGrid
          items={serialized}
          featured={featuredSerialized}
          featuredCount={featured.length}
          restCount={rest.length}
          regionLabels={REGION_LABELS_GALLERY}
          buildSrc={(id, w) => {
            if (id.startsWith("local:")) return id.slice("local:".length);
            return deliveryUrl(id, { width: w, crop: "fit" });
          }}
        />
      )}
    </>
  );
}
