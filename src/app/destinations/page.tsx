import type { Metadata } from "next";
import { PageHero, InProgressBlock } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Circuits au Sénégal (Lac Rose, Gorée, Casamance, Saly, Lompoul) et voyages internationaux : Omra, Maroc, Turquie, Dubaï, Europe.",
};

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="Du Sénégal au reste du monde"
        description="Circuits accompagnés et séjours sur mesure, sélectionnés par notre équipe pour leur rapport authenticité / confort / budget."
      />

      <InProgressBlock
        title="Catalogue en cours de production"
        description="Les fiches destinations seront publiées au fil du sprint. Voici les régions et pays prévus au lancement :"
        bulletItems={[
          "Lac Rose — excursion à la journée",
          "Île de Gorée — visite mémorielle",
          "Casamance — circuits 5 à 10 jours",
          "Saly-Portudal — séjours balnéaires",
          "Lompoul — désert et bivouac",
          "Saint-Louis — patrimoine et oiseaux",
          "Omra & Hajj — formules accompagnées",
          "Maroc, Turquie, Dubaï, Europe",
        ]}
      />
    </>
  );
}