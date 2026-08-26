import type { Metadata } from "next";
import { PageHero, InProgressBlock } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Offres & forfaits",
  description:
    "Séjours tout compris, circuits accompagnés, voyages sur mesure — toutes nos offres avec dates et disponibilités réelles.",
};

export default function OffresPage() {
  return (
    <>
      <PageHero
        eyebrow="Offres & forfaits"
        title="Des voyages prêts à réserver ou à personnaliser"
        description="Quelques idées de séjours et circuits. Toutes nos offres sont ajustables en dates, en hébergements et en prestations."
      />

      <InProgressBlock
        title="Catalogue des offres — Phase 2"
        description="Le moteur d'offres affichera bientôt la liste filtrable par destination, budget et dates. En attendant, voici les catégories prévues :"
        bulletItems={[
          "Séjours tout compris (3-14 nuits)",
          "Circuits accompagnés en groupe",
          "Voyages sur mesure (devis personnalisé)",
          "Omra Ramadan & Hajj",
          "Escapades week-end (Lac Rose, Gorée, Saly)",
          "Codes promo et offres saisonnières",
        ]}
      />
    </>
  );
}