import type { Metadata } from "next";
import { PageHero, InProgressBlock } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description:
    "Réponses aux questions les plus posées à l'agence : délais visa, modes de paiement, assurance, modifications de réservation.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Les réponses aux questions qu'on nous pose le plus"
        description="Si vous ne trouvez pas la vôtre, contactez-nous directement — la réponse sera ajoutée ici."
      />

      <InProgressBlock
        title="FAQ détaillée — Phase 2"
        description="L'équipe Assirik fournira les questions/réponses pour chaque thématique :"
        bulletItems={[
          "Délais et coûts des visas (Schengen, USA, Canada)",
          "Moyens de paiement acceptés",
          "Politique d'annulation et de modification",
          "Assurance voyage — quand la prendre ?",
          "Voyages avec enfants / personnes âgées",
          "Documents de voyage (passeport, vaccination)",
        ]}
      />
    </>
  );
}