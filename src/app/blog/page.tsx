import type { Metadata } from "next";
import { PageHero, InProgressBlock } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Blog & guides",
  description:
    "Guides pratiques pour préparer un voyage : documents visa Schengen, meilleurs moments pour partir, conseils santé et sécurité.",
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Guides pratiques pour partir préparé"
        description="Articles courts et concrets, écrits par l'équipe Assirik et nos partenaires locaux. Pas de SEO-bait — du contenu qui fait gagner du temps."
      />

      <InProgressBlock
        title="Premiers articles à paraître"
        description="La rédaction du blog démarre en parallèle du site. Sujets prioritaires :"
        bulletItems={[
          "Documents visa Schengen — checklist 2026",
          "Quelle période partir au Sénégal ?",
          "Omra Ramadan — formalités et budget",
          "Premier voyage à Dubai — 7 jours conseillés",
          "Voyager avec un mineur — pièces requises",
          "Droits des passagers en cas de retard de vol",
        ]}
      />
    </>
  );
}