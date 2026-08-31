import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveImage, FALLBACK_BY_SLUG } from "@/lib/photos";
import { REGION_LABELS_FR, OFFER_KIND_LABELS_FR } from "@/lib/regions";
import { OfferCard } from "@/components/site/offer-card";
import { destinationJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { siteConfig } from "@/lib/site-config";
import { whatsappLink } from "@/lib/whatsapp";
import { formatFCFA } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const dest = await prisma.destination.findUnique({ where: { slug } });
  if (!dest) return { title: "Destination introuvable" };
  const hero = resolveImage(dest.heroImageId, FALLBACK_BY_SLUG[slug] ?? "/photos/destinations/dakar.jpg", {
    width: 1200,
    height: 630,
    crop: "fill",
  });
  return {
    title: dest.title,
    description: dest.summary,
    alternates: { canonical: `/destinations/${slug}` },
    openGraph: {
      title: `${dest.title} · Assirik Tours`,
      description: dest.summary,
      url: `/destinations/${slug}`,
      images: [{ url: hero, width: 1200, height: 630, alt: dest.title }],
    },
  };
}

export default async function DestinationDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const dest = await prisma.destination.findUnique({
    where: { slug },
    include: {
      offers: {
        where: { published: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!dest) notFound();

  const heroImage = resolveImage(dest.heroImageId, FALLBACK_BY_SLUG[slug] ?? "/photos/destinations/dakar.jpg", {
    width: 1600,
    height: 800,
    crop: "fill",
  });

  const paragraphs = (dest.description ?? dest.summary)
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const galleryImages = (dest.gallery ?? [])
    .map((id) => resolveImage(id, FALLBACK_BY_SLUG[slug] ?? "/photos/destinations/dakar.jpg", {
      width: 800,
      height: 600,
      crop: "fill",
    }))
    .filter(Boolean);

  const regionLabel = REGION_LABELS_FR[dest.region] ?? dest.region;

  return (
    <>
      {/* Hero image */}
      <section className="relative">
        <div className="relative h-[55vh] min-h-[360px] max-h-[640px] overflow-hidden bg-navy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={dest.title}
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent"
          />
          <div className="absolute inset-0 flex items-end">
            <div className="container-narrow pb-10 md:pb-14 text-sand">
              <p className="inline-flex items-center rounded-full bg-sand/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                {regionLabel}
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-4xl md:text-6xl font-semibold text-sand leading-[1.05] text-balance">
                {dest.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-mist leading-relaxed">
                {dest.summary}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb + body */}
      <nav className="container-narrow py-4 text-sm text-graphite" aria-label="Fil d'Ariane">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-ocean">Accueil</Link></li>
          <li aria-hidden>›</li>
          <li><Link href="/destinations" className="hover:text-ocean">Destinations</Link></li>
          <li aria-hidden>›</li>
          <li className="text-navy font-medium">{dest.title}</li>
        </ol>
      </nav>

      <section className="container-narrow pb-12">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12">
          <article className="prose-assirik max-w-none">
            <h2 className="font-display text-2xl font-semibold text-navy">
              À propos de cette destination
            </h2>
            <div className="mt-4 space-y-4 text-graphite leading-relaxed">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>

          <aside className="space-y-5">
            <div className="rounded-xl bg-sand border border-sand-deep p-6">
              <h3 className="font-display text-base font-semibold text-navy">
                En bref
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="Région" value={regionLabel} />
                <Row label="Pays" value={regionLabel.startsWith("Sénégal") || ["Dakar","Niayes","Petite-Côte","Casamance","Sénégal Oriental","Saint-Louis"].some(r => regionLabel.startsWith(r)) ? "Sénégal" : "International"} />
                <Row label="Type" value={regionLabel} />
                <Row
                  label="Formules"
                  value={`${dest.offers.length} ${dest.offers.length > 1 ? "offres publiées" : "offre publiée"}`}
                />
              </dl>
            </div>

            <div className="rounded-xl bg-ocean/5 border border-ocean/20 p-6">
              <h3 className="font-display text-base font-semibold text-navy">
                Besoin d&apos;un conseil ?
              </h3>
              <p className="mt-2 text-sm text-graphite leading-relaxed">
                Nos conseillers connaissent {dest.title} sur le terrain. Échangez en direct sur WhatsApp.
              </p>
              <a
                href={whatsappLink(`Bonjour Assirik Tours, j'aimerais des informations sur un voyage à ${dest.title}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-sand hover:bg-whatsapp-hover transition-colors"
              >
                Discuter sur WhatsApp
              </a>
              <Link
                href={`/contact?destination=${encodeURIComponent(dest.title)}`}
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-ocean hover:text-navy"
              >
                Ou demander un devis écrit →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Offers */}
      {dest.offers.length > 0 ? (
        <section className="container-narrow pb-20">
          <header className="flex items-end justify-between gap-4 mb-6">
            <h2 className="font-display text-2xl font-semibold text-navy">
              Offres & forfaits — {dest.title}
            </h2>
            <Link href="/offres" className="text-sm font-semibold text-ocean hover:text-navy">
              Toutes les offres →
            </Link>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dest.offers.map((o) => (
              <OfferCard
                key={o.id}
                slug={o.slug}
                title={o.title}
                summary={o.summary}
                kind={o.kind}
                priceFCFA={o.priceFCFA}
                durationDays={o.durationDays}
                destinationSlug={dest.slug}
                destinationTitle={dest.title}
                coverImageId={o.coverImageId}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {galleryImages.length > 0 ? (
        <section className="container-narrow pb-20">
          <h2 className="font-display text-2xl font-semibold text-navy mb-6">
            Galerie
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((src, i) => (
              <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sand-deep">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${dest.title} — photo ${i + 1}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="container-narrow pb-20">
          <h2 className="font-display text-2xl font-semibold text-navy mb-6">
            Galerie
          </h2>
          <p className="text-sm text-graphite">
            Les photos sont ajoutées par l&apos;équipe au fur et à mesure des reportages. Pour l&apos;instant, voyez nos albums
            <Link href="/galerie" className="ml-1 font-semibold text-ocean hover:text-navy">dans la galerie générale →</Link>
          </p>
        </section>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(destinationJsonLd({ name: dest.title, description: dest.summary, slug: dest.slug, imageId: dest.heroImageId ?? undefined })) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
          { name: "Accueil", url: "/" },
          { name: "Destinations", url: "/destinations" },
          { name: dest.title, url: `/destinations/${dest.slug}` },
        ])) }}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-sand-deep/60 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-graphite">{label}</dt>
      <dd className="text-sm text-navy font-medium text-right">{value}</dd>
    </div>
  );
}
