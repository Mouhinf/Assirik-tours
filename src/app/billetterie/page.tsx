import type { Metadata } from "next";
import { PageHero, InProgressBlock } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Billetterie aérienne",
  description:
    "Recherche et comparaison de billets d'avion depuis Dakar — vols nationaux et internationaux sur les principales compagnies.",
};

export default function BilletteriePage() {
  return (
    <>
      <PageHero
        eyebrow="Billetterie"
        title="Vols nationaux et internationaux depuis Dakar"
        description="Comparaison manuelle sur les compagnies et alliances que nous travaillons au quotidien. Pas de robot, pas de frais cachés."
      />

      <InProgressBlock
        title="Module de recherche — Phase 2"
        description="Le moteur de recherche de vols sera intégré prochainement. En attendant, contactez-nous pour un devis sur votre trajet :"
        bulletItems={[
          "Vols internes Sénégal (AIBD ↔ régions)",
          "Afrique de l'Ouest (Dakar ↔ capitales)",
          "Europe (France, Belgique, Turquie…)",
          "Moyen-Orient (Dubaï, Jeddah, Doha)",
          "Amérique du Nord (New York, Montréal)",
          "Comparaison multi-compagnies",
        ]}
      />
    </>
  );
}