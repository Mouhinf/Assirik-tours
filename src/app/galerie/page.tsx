import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { resolveImage, FALLBACK_BY_SLUG } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "Photos de nos destinations et voyages organisés par l'équipe Assirik Tours.",
};

const galleryItems: Array<{
  title: string;
  alt: string;
  src: string;
  span?: "wide" | "tall";
  category: string;
}> = [
  { title: "Lac Rose", alt: "Ciel rose sur le Lac Rose", src: FALLBACK_BY_SLUG["lac-rose"]!, category: "Sénégal" },
  { title: "Île de Gorée", alt: "Maison coloniale bleue à Gorée", src: FALLBACK_BY_SLUG["goree"]!, category: "Sénégal" },
  { title: "Casamance", alt: "Pirogue dans les bolongs de Casamance", src: FALLBACK_BY_SLUG["casamance"]!, category: "Sénégal" },
  { title: "Saly-Portudal", alt: "Plage de Saly-Portudal au coucher du soleil", src: FALLBACK_BY_SLUG["saly"]!, category: "Sénégal" },
  { title: "Désert de Lompoul", alt: "Dunes orange du désert de Lompoul", src: FALLBACK_BY_SLUG["lompoul"]!, category: "Sénégal" },
  { title: "Saint-Louis", alt: "Pont Faidherbe à Saint-Louis au lever du soleil", src: FALLBACK_BY_SLUG["saint-louis"]!, category: "Sénégal" },
  { title: "Dakar", alt: "Corniche de Dakar au coucher du soleil", src: FALLBACK_BY_SLUG["dakar"]!, category: "Sénégal" },
  { title: "Omra", alt: "Mosquée illuminée à la Mecque", src: FALLBACK_BY_SLUG["omra"]!, category: "Religion" },
  { title: "Maroc", alt: "Ruelle bleue de Chefchaouen", src: FALLBACK_BY_SLUG["maroc"]!, category: "International" },
  { title: "Turquie", alt: "Montgolfières en Cappadoce", src: FALLBACK_BY_SLUG["turquie"]!, category: "International" },
  { title: "Dubaï", alt: "Skyline de Dubaï au crépuscule", src: FALLBACK_BY_SLUG["dubai"]!, category: "International" },
  { title: "Artisanat", alt: "Atelier d'artisanat sénégalais", src: "/photos/gallery/artisanat.jpg", category: "Culture" },
  { title: "Musique", alt: "Griot jouant de la kora", src: "/photos/gallery/musique.jpg", category: "Culture" },
  { title: "Gastronomie", alt: "Thieboudienne dans un bol traditionnel", src: "/photos/gallery/gastronomie.jpg", category: "Gastronomie" },
  { title: "Famille", alt: "Famille se promenant sur la plage de Saly", src: "/photos/gallery/famille.jpg", category: "Voyageurs" },
  { title: "Soleil", alt: "Soleil couchant sur les dunes", src: "/photos/gallery/soleil.jpg", category: "Sénégal" },
];

export default function GaleriePage() {
  return (
    <>
      <PageHero
        eyebrow="Galerie"
        title="Quelques images de nos destinations"
        description="Aperçu visuel du Sénégal et de nos voyages internationaux. Photographies éditoriales choisies pour donner le ton — pas des photos d'agence génériques."
      />

      <section className="container-narrow pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {galleryItems.map((item, i) => (
            <figure
              key={i}
              className="group relative overflow-hidden rounded-xl bg-sand-deep"
              style={{
                  // Break monotony with an occasional tall tile
                  gridRow: i % 7 === 3 ? "span 2" : undefined,
                }}
            >
              <div className={`relative w-full ${i % 7 === 3 ? "aspect-[3/4]" : "aspect-square"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent px-3 py-2 text-xs text-sand opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="font-semibold">{item.title}</span>
                  <span className="ml-2 text-mist/80">{item.category}</span>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
