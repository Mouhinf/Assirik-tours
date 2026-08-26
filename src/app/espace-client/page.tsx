import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Espace client",
  description:
    "Suivez vos réservations, retrouvez vos documents de voyage et votre historique.",
};

export default function EspaceClientPage() {
  return (
    <>
      <PageHero
        eyebrow="Espace client"
        title="Suivez vos voyages en un coup d'œil"
        description="Réservations actives, documents à fournir, historique, factures — toute l'information que vous avez partagée avec nous, accessible à tout moment."
      />

      <section className="container-narrow pb-20">
        <div className="mx-auto max-w-md text-center">
          <div className="rounded-xl border border-sand-deep bg-sand p-8">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-ocean/10 text-ocean">
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>

            <h2 className="mt-5 font-display text-xl font-semibold text-navy">
              Authentification requise
            </h2>
            <p className="mt-2 text-sm text-graphite leading-relaxed">
              Cet espace sera accessible après connexion avec l'adresse e-mail
              utilisée lors de votre réservation. Phase 2 — ouverture
              prochaine.
            </p>

            <div className="mt-6 space-y-2">
              <button
                type="button"
                disabled
                className="w-full rounded-full bg-ocean/40 px-5 py-3 text-sm font-semibold text-sand cursor-not-allowed"
              >
                Se connecter (bientôt)
              </button>
              <Link
                href="/contact"
                className="block w-full rounded-full border border-navy/15 px-5 py-3 text-sm font-semibold text-navy hover:border-ocean hover:text-ocean transition-colors"
              >
                Pas encore client ? Nous contacter
              </Link>
            </div>
          </div>

          <p className="mt-6 text-xs text-silver">
            Vous avez déjà une réservation active ? Un lien de connexion vous
            a été envoyé par e-mail.
          </p>
        </div>
      </section>
    </>
  );
}