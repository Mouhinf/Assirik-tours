import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ClientLoginForm } from "@/components/client/login-form";

export const metadata: Metadata = {
  title: "Espace client",
  description:
    "Suivez vos réservations, retrouvez vos documents de voyage et votre historique.",
};

export default function EspaceClientLandingPage() {
  return (
    <>
      <PageHero
        eyebrow="Espace client"
        title="Vos voyages en un coup d'œil"
        description="Réservations actives, documents visa, historique, factures — toute l'information que vous avez partagée avec nous, accessible à tout moment."
      />
      <section className="container-narrow pb-20">
        <div className="mx-auto max-w-md">
          <div className="rounded-xl border border-sand-deep bg-sand p-8">
            <h2 className="font-display text-xl font-semibold text-navy">Connexion</h2>
            <p className="mt-2 text-sm text-graphite leading-relaxed">
              Saisissez l&apos;email utilisé lors de votre réservation ou lors de votre demande visa.
              Un conseiller Assirik Tours vous a envoyé votre lien d&apos;activation.
            </p>
            <div className="mt-6">
              <ClientLoginForm />
            </div>
          </div>
          <p className="mt-6 text-xs text-silver text-center">
            Pas encore client ? <a href="/contact" className="text-ocean hover:underline">Contactez-nous</a>.
          </p>
        </div>
      </section>
    </>
  );
}
