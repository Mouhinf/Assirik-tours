import type { Metadata } from "next";
import { PageHero, InProgressBlock } from "@/components/site/page-hero";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "L'histoire d'Assirik Tours, notre équipe, nos agréments et notre manière de travailler — pour comprendre à qui vous confiez votre voyage.",
};

export default function AProposPage() {
  return (
    <>
      <PageHero
        eyebrow="À propos"
        title="Une agence dakaroise, pas une plateforme"
        description={`${siteConfig.name} est une agence de voyages installée à ${siteConfig.address.city}, spécialisée dans l'organisation de voyages depuis le Sénégal — pour les Sénégalais, les résidents et la diaspora.`}
      />

      <InProgressBlock
        title="Page histoire & équipe — Phase 2"
        description="Le contenu sera rédigé avec l'équipe d'Assirik pour refléter fidèlement l'histoire et les valeurs de l'agence. Sections prévues :"
        bulletItems={[
          "Histoire et dates clés",
          "Équipe (photos, rôles, contacts directs)",
          "Agréments (IATA, ministère du Tourisme)",
          "Partenaires compagnies et hôtels",
          "Engagements (clients, environnement)",
          "Mentions légales & contact dirigeants",
        ]}
      />
    </>
  );
}