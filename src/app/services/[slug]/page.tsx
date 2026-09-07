import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveImage, FALLBACK_BY_SLUG } from "@/lib/photos";
import { formatFCFA } from "@/lib/utils";
import { SERVICE_CATEGORY_LABELS } from "@/lib/service-catalog";
import { whatsappLink } from "@/lib/whatsapp";
import { ContactForm } from "@/components/site/contact-form";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";
import type { ServiceCategory } from "@prisma/client";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return services.map((s) => ({ slug: s.slug }));
}

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const s = await prisma.service.findUnique({
    where: { slug, isActive: true },
    select: { title: true, shortDescription: true, imageId: true },
  });
  if (!s) return { title: "Service introuvable" };
  const hero = resolveImage(s.imageId, FALLBACK_BY_SLUG["dakar"] ?? "/photos/destinations/dakar.jpg", {
    width: 1200,
    height: 630,
    crop: "fill",
  });
  return {
    title: s.title,
    description: s.shortDescription,
    alternates: { canonical: `/services/${slug}` },
    openGraph: {
      title: `${s.title} · Assirik Tours`,
      description: s.shortDescription,
      url: `/services/${slug}`,
      type: "website",
      images: [{ url: hero, width: 1200, height: 630, alt: s.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${s.title} · Assirik Tours`,
      description: s.shortDescription,
      images: [hero],
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const s = await prisma.service.findUnique({
    where: { slug, isActive: true },
  });
  if (!s) notFound();

  const heroImage = resolveImage(s.imageId, FALLBACK_BY_SLUG["dakar"] ?? "/photos/destinations/dakar.jpg", {
    width: 1600,
    height: 900,
    crop: "fill",
  });

  const categoryLabel = SERVICE_CATEGORY_LABELS[s.category as ServiceCategory] ?? "Service";

  // Split longDescription into paragraphs (blank line separator)
  const longParagraphs = (s.longDescription ?? "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[45vh] min-h-[320px] max-h-[540px] overflow-hidden bg-navy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={s.title}
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="container-narrow pb-10 md:pb-14 text-sand">
              <p className="inline-flex items-center gap-2 rounded-full bg-sand/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                {categoryLabel}
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-4xl md:text-5xl font-semibold text-sand leading-[1.05] text-balance">
                {s.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-mist leading-relaxed">
                {s.shortDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav className="container-narrow py-4 text-sm text-graphite" aria-label="Fil d'Ariane">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-ocean">Accueil</Link></li>
          <li aria-hidden>›</li>
          <li><Link href="/services" className="hover:text-ocean">Services</Link></li>
          <li aria-hidden>›</li>
          <li className="text-navy font-medium">{s.title}</li>
        </ol>
      </nav>

      {/* Description longue + caractéristiques */}
      <section className="container-narrow pb-12">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12">
          <article className="prose-assirik max-w-none">
            <h2 className="font-display text-2xl font-semibold text-navy">
              Présentation détaillée
            </h2>
            {longParagraphs.length > 0 ? (
              <div className="mt-4 space-y-4 text-graphite leading-relaxed">
                {longParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-graphite">
                Pour le détail complet de cette prestation, contactez-nous — un
                conseiller vous répond sous 24h ouvrées.
              </p>
            )}
          </article>

          <aside className="space-y-5">
            <div className="rounded-xl bg-sand border border-sand-deep p-6">
              <h3 className="font-display text-base font-semibold text-navy">
                Caractéristiques
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="Catégorie" value={categoryLabel} />
                <Row
                  label="Tarification"
                  value={
                    s.priceFromFCFA != null
                      ? `À partir de ${formatFCFA(s.priceFromFCFA)}${s.priceNote ? ` / ${s.priceNote}` : ""}`
                      : "Sur devis"
                  }
                />
                <Row label="Référence" value={s.slug} mono />
              </dl>
            </div>

            <div className="rounded-xl bg-whatsapp/10 border border-whatsapp/30 p-6">
              <h3 className="font-display text-base font-semibold text-navy">
                Discuter sur WhatsApp
              </h3>
              <p className="mt-2 text-sm text-graphite leading-relaxed">
                Une question précise ? Un conseiller répond directement — pas de
                formulaire intermédiaire.
              </p>
              <a
                href={whatsappLink(
                  `Bonjour Assirik Tours, j'aimerais des informations sur votre service « ${s.title} ».`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-sand hover:bg-whatsapp-hover transition-colors"
              >
                Démarrer la discussion
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* Formulaire dédié */}
      <section className="container-narrow pb-16">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 rounded-2xl bg-sand border border-sand-deep p-7 md:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
              Demander ce service
            </p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold text-navy text-balance">
              Intéressé par {s.title} ?
            </h2>
            <p className="mt-3 text-sm text-graphite leading-relaxed">
              Renseignez quelques informations — délais souhaités, contexte du
              voyage ou du besoin — un conseiller vous répond sous 24h ouvrées
              avec un devis détaillé.
            </p>
            <a
              href={whatsappLink(
                `Bonjour Assirik Tours, j'aimerais des informations sur votre service « ${s.title} ».`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-sand hover:bg-whatsapp-hover transition-colors"
            >
              Discuter sur WhatsApp
            </a>
          </div>

          <ContactForm
            defaultSubject={`Demande de service — ${s.title}`}
            defaultMessage={`Bonjour,\n\nJe souhaite en savoir plus sur votre service « ${s.title} ».\n\nPrécisions sur mon besoin :\n`}
            serviceSlug={s.slug}
          />
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd({
              name: s.title,
              description: s.shortDescription,
              slug: s.slug,
              imageId: s.imageId ?? undefined,
              category: categoryLabel,
              priceFromFCFA: s.priceFromFCFA ?? undefined,
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Accueil", url: "/" },
              { name: "Services", url: "/services" },
              { name: s.title, url: `/services/${s.slug}` },
            ]),
          ),
        }}
      />
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-sand-deep/60 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-graphite">{label}</dt>
      <dd className={`text-sm text-navy font-medium text-right ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
