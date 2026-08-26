import type { Metadata } from "next";
import { PageHero, InProgressBlock } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Assistance visa, hôtels, location de véhicule avec chauffeur, assurance voyage, transferts aéroport — tous les services complémentaires d'Assirik Tours.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Tout ce qu'il faut autour du billet"
        description="Voyager, c'est aussi régler les formalités et le confort sur place. Voici les services que nous coordonnons pour vous."
      />

      <InProgressBlock
        title="Fiches services détaillées — Phase 2"
        description="Chaque service aura sa page dédiée avec tarification indicative et FAQ. Liste actuelle :"
        bulletItems={[
          "Assistance visa (Schengen, USA, Canada, Royaume-Uni, Omra)",
          "Réservation d'hôtels et lodges",
          "Location de véhicule avec chauffeur",
          "Assurance voyage (annulation, rapatriement)",
          "Transferts aéroport AIBD ↔ Dakar",
          "Sur-mesure entreprise & groupes",
        ]}
      />
    </>
  );
}