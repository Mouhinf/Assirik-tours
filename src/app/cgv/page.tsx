import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente d'Assirik Tours — réservation, paiement, annulation, responsabilité.",
  robots: { index: true, follow: true },
};

export default function CgvPage() {
  return (
    <>
      <PageHero
        eyebrow="Conditions générales de vente"
        title="CGV — Conditions Générales de Vente"
        description="Les présentes conditions régissent les relations entre Assirik Tours et ses clients pour la réservation de voyages, séjours et services associés."
      />

      <section className="container-narrow pb-20 max-w-3xl text-graphite">
        <p className="text-sm text-silver">
          En vigueur à compter du{" "}
          {new Date().toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </p>

        <Article title="1. Objet et champ d'application">
          <p>
            Les présentes Conditions Générales de Vente (ci-après « CGV »)
            s'appliquent à toutes les prestations de services proposées par{" "}
            {siteConfig.name} (ci-après « l'Agence ») à ses clients (ci-après
            « le Client »), notamment :billets d'avion, forfaits de séjour,
            circuits accompagnés, voyages sur mesure, assistance visa,
            réservation d'hébergement, location de véhicule et transferts.
          </p>
          <p className="mt-3">
            Toute réservation implique l'acceptation sans réserve des
            présentes CGV. Le Client reconnaît en avoir pris connaissance
            avant la validation de sa commande.
          </p>
        </Article>

        <Article title="2. Inscription et réservation">
          <p>
            La réservation devient ferme et définitive à réception :
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>du acompte convenu (voir article 3) ;</li>
            <li>du formulaire d'inscription signé (électroniquement ou physiquement) ;</li>
            <li>des documents d'identité valides du ou des voyageurs.</li>
          </ul>
          <p className="mt-3">
            L'Agence se réserve le droit de refuser une réservation si les
            informations fournies sont incomplètes ou inexactes.
          </p>
        </Article>

        <Article title="3. Prix et paiement">
          <p>
            Les prix sont exprimés en francs CFA (FCFA), toutes taxes
            comprises (TTC), sauf mention contraire. Ils sont révisables
            jusqu'à la confirmation de la réservation en cas de variation
            significative des taux de change, des taxes aériennes ou du prix
            du carburant.
          </p>
          <p className="mt-3">
            Modalités de paiement :
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>Acompte de 30 % à la réservation ;</li>
            <li>Solde au plus tard 30 jours avant le départ ;</li>
            <li>Paiement intégral immédiat pour toute réservation effectuée à moins de 30 jours du départ.</li>
          </ul>
          <p className="mt-3">
            Moyens de paiement acceptés : espèces (à l'agence), virement
            bancaire, [compléter : Wave, Orange Money, carte bancaire].
          </p>
        </Article>

        <Article title="4. Annulation et modification">
          <p>Par le Client :</p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>Plus de 60 jours avant le départ : retenue de l'acompte ;</li>
            <li>De 60 à 30 jours : retenue de 50 % du montant total ;</li>
            <li>Moins de 30 jours : retenue de 100 % du montant total.</li>
          </ul>
          <p className="mt-3">
            Par l'Agence : en cas d'annulation imputable à l'Agence (force
            majeure comprise), le Client est remboursé intégralement des
            sommes versées, à l'exclusion de toute indemnité complémentaire.
          </p>
          <p className="mt-3">
            Toute modification demandée par le Client après confirmation peut
            entraîner des frais, facturés au coût réel supporté par l'Agence.
          </p>
        </Article>

        <Article title="5. Formalités et documents">
          <p>
            L'Agence informe le Client des formalités administratives et
            sanitaires requises (passeport, visa, vaccinations). La
            responsabilité de l'Agence ne saurait être engagée en cas de
            non-respect de ces formalités par le Client.
          </p>
          <p className="mt-3">
            Pour les demandes de visa, l'Agence propose un service
            d'assistance. L'obtention du visa reste de la seule compétence
            des autorités consulaires ; aucun remboursement n'est effectué
            en cas de refus.
          </p>
        </Article>

        <Article title="6. Assurance voyage">
          <p>
            Il est vivement recommandé au Client de souscrire une assurance
            voyage couvrant l'annulation, l'assistance rapatriement et la
            responsabilité civile. L'Agence peut proposer une assurance en
            option ; les conditions figurent alors dans le contrat
            d'assurance remis au Client.
          </p>
        </Article>

        <Article title="7. Responsabilité">
          <p>
            L'Agence est tenue à une obligation de moyens et non de résultat.
            Sa responsabilité ne saurait être engagée en cas de :
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>force majeure, événement imprévisible ou exceptionnel ;</li>
            <li>faute du Client (notamment non-respect des formalités) ;</li>
            <li>prestations fournies par un tiers (compagnie aérienne, hôtelier, etc.) ;</li>
            <li>retard, annulation ou modification imputable au transporteur.</li>
          </ul>
        </Article>

        <Article title="8. Réclamations">
          <p>
            Toute réclamation doit être adressée par écrit à l'Agence dans un
            délai de 30 jours suivant la fin de la prestation, à l'adresse{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-ocean hover:underline"
            >
              {siteConfig.email}
            </a>
            , accompagnée des justificatifs utiles. En cas de litige
            persistant, le Client peut recourir gratuitement au médiateur du
            tourisme compétent.
          </p>
        </Article>

        <Article title="9. Données personnelles">
          <p>
            Les données personnelles collectées sont traitées conformément à
            notre politique de confidentialité (voir{" "}
            <a href="/mentions-legales" className="text-ocean hover:underline">
              mentions légales
            </a>
            ). Le Client dispose d'un droit d'accès, de rectification et
            d'effacement de ses données.
          </p>
        </Article>

        <Article title="10. Loi applicable et juridiction">
          <p>
            Les présentes CGV sont régies par le droit sénégalais. Tout
            litige relatif à leur interprétation ou à leur exécution sera
            soumis à la compétence exclusive des tribunaux de Dakar, sauf
            disposition impérative contraire.
          </p>
        </Article>

        <p className="mt-10 text-xs text-silver">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </p>
      </section>
    </>
  );
}

function Article({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-lg font-semibold text-navy">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}