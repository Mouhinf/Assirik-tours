import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site Assirik Tours — éditeur, hébergeur, contact.",
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHero
        eyebrow="Mentions légales"
        title="Informations légales et contact"
        description="Identité de l'éditeur du site, hébergeur et moyens de nous contacter — conformément aux obligations légales applicables."
      />

      <section className="container-narrow pb-20 max-w-3xl">
        <LegalSection title="Éditeur du site">
          <Field label="Dénomination sociale" value={siteConfig.name} />
          <Field
            label="Siège social"
            value={`${siteConfig.address.line1}, ${siteConfig.address.line2}, ${siteConfig.address.city}, ${siteConfig.address.country}`}
          />
          <Field label="Téléphone" value={siteConfig.phones.landline} />
          <Field label="WhatsApp" value={siteConfig.phones.whatsapp} />
          <Field label="Email" value={siteConfig.email} />

          <Field
            label="Forme juridique"
            value="[À compléter — ex. SARL, SA, EI…]"
            placeholder
          />
          <Field
            label="Capital social"
            value="[À compléter — ex. 1 000 000 FCFA]"
            placeholder
          />
          <Field
            label="NINEA"
            value="[À compléter — Numéro d'Identifiant National des Entreprises et Associations]"
            placeholder
          />
          <Field
            label="Registre du commerce"
            value="[À compléter — ex. RC/DKR/2020/B/1234]"
            placeholder
          />
          <Field
            label="Licence d'agence de voyages"
            value="[À compléter — délivrée par le Ministère du Tourisme et des Loisirs du Sénégal]"
            placeholder
          />
          <Field
            label="Numéro IATA"
            value="[À compléter si applicable]"
            placeholder
          />
          <Field
            label="Directeur de la publication"
            value="[À compléter — nom du responsable]"
            placeholder
          />
        </LegalSection>

        <LegalSection title="Hébergement">
          <Field label="Hébergeur" value="Vercel Inc." />
          <Field
            label="Adresse"
            value="340 S Lemon Ave #4133, Walnut, CA 91789, USA"
          />
          <Field
            label="Site"
            value={
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ocean hover:underline"
              >
                vercel.com
              </a>
            }
          />
        </LegalSection>

        <LegalSection title="Propriété intellectuelle">
          <p className="text-graphite leading-relaxed">
            L'ensemble du contenu de ce site (textes, images, logos, illustrations,
            vidéos, code source) est la propriété exclusive d'
            {siteConfig.name} ou de ses partenaires. Toute reproduction,
            représentation ou diffusion, totale ou partielle, est interdite
            sans autorisation écrite préalable.
          </p>
        </LegalSection>

        <LegalSection title="Données personnelles">
          <p className="text-graphite leading-relaxed">
            Les informations recueillies via le formulaire de contact ou la
            création d'un compte client font l'objet d'un traitement
            informatique destiné à répondre à vos demandes et à gérer vos
            réservations. Conformément aux dispositions applicables en
            matière de protection des données, vous disposez d'un droit
            d'accès, de rectification, d'effacement et de portabilité de vos
            données.
          </p>
          <p className="mt-3 text-graphite leading-relaxed">
            Pour exercer ces droits, contactez-nous à{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-ocean hover:underline"
            >
              {siteConfig.email}
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection title="Cookies">
          <p className="text-graphite leading-relaxed">
            Ce site n'utilise pas de cookies de mesure d'audience ni de
            traceurs publicitaires. Seuls des cookies strictement nécessaires
            au bon fonctionnement (session d'authentification à l'espace admin)
            peuvent être déposés.
          </p>
        </LegalSection>

        <LegalSection title="Contact">
          <p className="text-graphite leading-relaxed">
            Pour toute question relative à ce site ou à son contenu, vous
            pouvez nous contacter à{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-ocean hover:underline"
            >
              {siteConfig.email}
            </a>{" "}
            ou par téléphone au{" "}
            <a
              href={`tel:${siteConfig.phones.landlineTel}`}
              className="text-ocean hover:underline"
            >
              {siteConfig.phones.landline}
            </a>
            .
          </p>
        </LegalSection>

        <p className="mt-10 text-xs text-silver">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </p>
      </section>
    </>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-display text-xl font-semibold text-navy">{title}</h2>
      <div className="mt-4 space-y-2 text-sm">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: React.ReactNode;
  placeholder?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_2fr] gap-4 py-1.5 border-b border-sand-deep/60 last:border-0">
      <dt className="text-silver font-medium">{label}</dt>
      <dd
        className={
          placeholder
            ? "text-silver italic"
            : "text-navy"
        }
      >
        {value}
      </dd>
    </div>
  );
}