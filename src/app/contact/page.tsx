import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ContactForm } from "@/components/site/contact-form";
import { siteConfig } from "@/lib/site-config";
import { whatsappLink } from "@/lib/whatsapp";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contacter l'agence Assirik Tours à Dakar : adresse, téléphone, WhatsApp, e-mail. Réponse sous 24h ouvrées.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{
    service?: string;
    objet?: string;
    destination?: string;
    offer?: string;
  }>;
}) {
  const sp = await searchParams;
  const serviceSlug = typeof sp.service === "string" ? sp.service : null;
  const objet = typeof sp.objet === "string" ? sp.objet : null;
  const destinationSlug =
    typeof sp.destination === "string" ? sp.destination : null;
  const offerSlug = typeof sp.offer === "string" ? sp.offer : null;

  // Pre-fill from a Service, Destination or Offer if requested
  let preselectedService: { title: string; category: string } | null = null;
  let preselectedDestination: { title: string } | null = null;
  let preselectedOffer: { title: string } | null = null;

  const [serviceRow, destinationRow, offerRow] = await Promise.all([
    serviceSlug
      ? prisma.service.findUnique({
          where: { slug: serviceSlug },
          select: { title: true, category: true },
        })
      : Promise.resolve(null),
    destinationSlug
      ? prisma.destination.findUnique({
          where: { slug: destinationSlug },
          select: { title: true },
        })
      : Promise.resolve(null),
    offerSlug
      ? prisma.offer.findUnique({
          where: { slug: offerSlug },
          select: { title: true },
        })
      : Promise.resolve(null),
  ]);
  if (serviceRow) preselectedService = serviceRow;
  if (destinationRow) preselectedDestination = destinationRow;
  if (offerRow) preselectedOffer = offerRow;

  const subjectTitle =
    preselectedService?.title ??
    preselectedDestination?.title ??
    preselectedOffer?.title;
  const defaultSubject = subjectTitle
    ? `Demande — ${subjectTitle}`
    : objet === "service-sur-mesure"
      ? "Demande — service sur mesure"
      : undefined;

  const defaultMessage = preselectedService
    ? `Bonjour,\n\nJe souhaite en savoir plus sur le service « ${preselectedService.title} » (catégorie : ${preselectedService.category}).\n\nPrécisions sur mon besoin :\n`
    : preselectedDestination
      ? `Bonjour,\n\nJe souhaite en savoir plus sur la destination « ${preselectedDestination.title} ».\n\nDates envisagées et voyageurs :\n`
      : preselectedOffer
        ? `Bonjour,\n\nJe souhaite un devis pour l'offre « ${preselectedOffer.title} ».\n\nDates souhaitées et voyageurs :\n`
        : objet === "service-sur-mesure"
          ? "Bonjour,\n\nJ'ai un besoin spécifique qui ne figure pas dans vos prestations classiques.\n\nDescription du besoin :\n"
          : undefined;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Parlons de votre prochain voyage"
        description="Un conseiller vous répond — pas un robot, pas un formulaire perdu. Choisissez le canal qui vous arrange."
      />

      <section className="container-narrow pb-20">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10">
          {/* Contact details */}
          <div className="space-y-8">
            <ContactBlock
              icon="pin"
              title="À l'agence"
              lines={[
                siteConfig.address.line1,
                `${siteConfig.address.line2}, ${siteConfig.address.city}`,
                siteConfig.address.country,
              ]}
            />

            <ContactBlock
              icon="phone"
              title="Par téléphone"
              lines={[
                `Fixe : ${siteConfig.phones.landline}`,
                `WhatsApp : ${siteConfig.phones.whatsapp}`,
              ]}
              linesAsLinks={[
                { href: `tel:${siteConfig.phones.landlineTel}`, label: `Fixe : ${siteConfig.phones.landline}` },
                {
                  href: whatsappLink("Bonjour Assirik Tours"),
                  label: `WhatsApp : ${siteConfig.phones.whatsapp}`,
                  external: true,
                },
              ]}
            />

            <ContactBlock
              icon="mail"
              title="Par e-mail"
              lines={[siteConfig.email]}
              linesAsLinks={[
                { href: `mailto:${siteConfig.email}`, label: siteConfig.email },
              ]}
            />

            <ContactBlock
              icon="clock"
              title="Horaires"
              lines={[
                siteConfig.hours.weekdays,
                siteConfig.hours.saturday,
                siteConfig.hours.sunday,
              ]}
            />
          </div>

          {/* Form */}
          <div className="rounded-xl border border-sand-deep bg-sand p-7">
            <h2 className="font-display text-xl font-semibold text-navy">
              Formulaire de devis
            </h2>
            <p className="mt-2 text-sm text-graphite leading-relaxed">
              Décrivez votre projet — destinations, dates approximatives,
              nombre de voyageurs. Un conseiller vous répond sous 24h ouvrées.
            </p>

            {preselectedService ? (
              <div className="mt-4 rounded-lg border border-ocean/30 bg-ocean/5 px-4 py-3 text-sm text-graphite">
                <span className="text-xs font-semibold uppercase tracking-wider text-ocean">
                  Service présélectionné
                </span>
                <p className="mt-0.5 font-semibold text-navy">
                  {preselectedService.title}
                </p>
              </div>
            ) : null}

            <ContactForm
              defaultMessage={defaultMessage}
              defaultSubject={defaultSubject}
              destinationSlug={destinationSlug ?? undefined}
              offerSlug={offerSlug ?? undefined}
            />

            <div className="mt-6 pt-6 border-t border-sand-deep">
              <a
                href={whatsappLink(
                  "Bonjour Assirik Tours, j'aimerais des informations sur un voyage.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-whatsapp hover:underline"
              >
                Ou écrivez-nous directement sur WhatsApp →
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------------------------------------------------- */

function ContactBlock({
  icon,
  title,
  lines,
  linesAsLinks,
}: {
  icon: "pin" | "phone" | "mail" | "clock";
  title: string;
  lines: string[];
  linesAsLinks?: { href: string; label: string; external?: boolean }[];
}) {
  const linesToRender =
    linesAsLinks ??
    lines.map(
      (l): { href: string; label: string; external?: boolean } => ({
        href: "#",
        label: l,
      }),
    );

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ocean/10 text-ocean">
          <Icon name={icon} />
        </span>
        <h3 className="font-display text-base font-semibold text-navy">
          {title}
        </h3>
      </div>
      <div className="mt-3 ml-12 space-y-1 text-sm text-graphite">
        {linesToRender.map((l, i) => (
          <p key={i}>
            {l.href === "#" ? (
              l.label
            ) : (
              <a
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
                className="hover:text-ocean transition-colors break-all"
              >
                {l.label}
              </a>
            )}
          </p>
        ))}
      </div>
    </div>
  );
}

function Icon({ name }: { name: "pin" | "phone" | "mail" | "clock" }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 18,
    height: 18,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "pin":
      return (
        <svg {...common}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
  }
}
