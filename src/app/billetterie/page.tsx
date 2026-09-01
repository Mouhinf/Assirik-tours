import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { FlightSearchEngine } from "@/components/site/flight-search-engine";
import { isUsingMockProvider } from "@/lib/flight-providers";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Billetterie aérienne | Assirik Tours",
  description:
    "Recherchez et comparez les vols depuis Dakar — Sénégal, Afrique de l'Ouest, Europe, Omra, Moyen-Orient. Tarifs négociés, conseillers basés à Dakar.",
  alternates: { canonical: "/billetterie" },
  openGraph: {
    title: "Billetterie aérienne | Assirik Tours",
    description:
      "Recherchez et comparez les vols depuis Dakar — Sénégal, Afrique de l'Ouest, Europe, Omra, Moyen-Orient.",
    url: "/billetterie",
    type: "website",
  },
};

export default function BilletteriePage() {
  const mock = isUsingMockProvider();
  return (
    <>
      <PageHero
        eyebrow="Billetterie"
        title="Vols nationaux et internationaux depuis Dakar"
        description="Recherchez parmi des centaines de compagnies. Un conseiller basé à Dakar finalise votre réservation sous 24h."
      />

      <FlightSearchEngine />

      {/* Bandeau rassurant */}
      <section className="container-narrow pb-10">
        <div className="grid sm:grid-cols-3 gap-3">
          <ReassureCard
            title="Sur mesure"
            body="Nos conseillers finalisent votre réservation sous 24h ouvrées."
          />
          <ReassureCard
            title="Tarifs négociés"
            body="Compagnies directes, comparatif multi-providers, pas de frais cachés."
          />
          <ReassureCard
            title="Paiement local"
            body="Wave, Orange Money, carte bancaire, virement FCFA."
          />
        </div>
      </section>

      {/* Provider disclaimer */}
      <section className="container-narrow pb-20">
        <div className="rounded-xl border border-sand-deep bg-sand p-6 text-sm text-graphite">
          <h2 className="font-display text-base font-semibold text-navy mb-2">
            Comment ça marche ?
          </h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Vous lancez une recherche de vols (origine, destination, dates, passagers).
            </li>
            <li>
              Le moteur interroge{" "}
              {mock ? "notre base de référence (mode démo)" : "le provider Kiwi.com"} et
              affiche les options disponibles triées par prix.
            </li>
            <li>
              Vous sélectionnez un vol et vous nous envoyez une demande de devis (nom, email, téléphone).
            </li>
            <li>
              Un conseiller d&apos;Assirik Tours vous rappelle sous 24h pour finaliser la réservation avec la compagnie et émettre le billet.
            </li>
          </ol>
          <p className="mt-3 text-xs text-silver">
            Provider actif : <code className="font-mono">{mock ? "mock" : "kiwi"}</code>{" "}
            (configurable via <code className="font-mono">FLIGHT_PROVIDER</code> dans <code className="font-mono">.env.local</code>).
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Accueil", url: "/" },
              { name: "Billetterie", url: "/billetterie" },
            ]),
          ),
        }}
      />
    </>
  );
}

function ReassureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-sand-deep bg-sand p-4">
      <p className="font-display text-sm font-semibold text-navy">{title}</p>
      <p className="mt-1 text-xs text-graphite leading-relaxed">{body}</p>
    </div>
  );
}
