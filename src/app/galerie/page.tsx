import type { Metadata } from "next";
import { PageHero, InProgressBlock } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "Photos de nos destinations et voyages organisés par l'équipe Assirik Tours.",
};

export default function GaleriePage() {
  return (
    <>
      <PageHero
        eyebrow="Galerie"
        title="Quelques images de nos destinations"
        description="Aperçu visuel du Sénégal et de nos voyages internationaux. Galerie complète avec lightbox à venir."
      />

      <InProgressBlock
        title="Galerie photo — Phase 2"
        description="La galerie sera alimentée par les reportages photos de l'équipe et par les photos envoyées par les voyageurs (avec leur accord). Albums prévus :"
        bulletItems={[
          "Lac Rose & Niayes",
          "Île de Gorée",
          "Casamance & Ziguinchor",
          "Saly & Petite-Côte",
          "Lompoul & Saint-Louis",
          "Omra — Mecque & Médine",
          "Destinations internationales",
        ]}
      />
    </>
  );
}