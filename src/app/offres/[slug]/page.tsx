import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveImage, FALLBACK_BY_SLUG } from "@/lib/photos";
import { OFFER_KIND_LABELS_FR, REGION_LABELS_FR } from "@/lib/regions";
import { formatFCFA } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const offer = await prisma.offer.findUnique({
    where: { slug },
    include: { destination: true },
  });
  if (!offer) return { title: "Offre introuvable" };
  const image = resolveImage(offer.coverImageId, FALLBACK_BY_SLUG[offer.destination.slug] ?? "/photos/destinations/dakar.jpg", {
    width: 1200, height: 630, crop: "fill",
  });
  return {
    title: offer.title,
    description: offer.summary,
    alternates: { canonical: `/offres/${slug}` },
    openGraph: {
      title: `${offer.title} · Assirik Tours`,
      description: offer.summary,
      url: `/offres/${slug}`,
      images: [{ url: image, width: 1200, height: 630, alt: offer.title }],
    },
  };
}

export default async function OfferDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const offer = await prisma.offer.findUnique({
    where: { slug },
    include: { destination: true },
  });
  if (!offer) notFound();

  const heroImage = resolveImage(offer.coverImageId, FALLBACK_BY_SLUG[offer.destination.slug] ?? "/photos/destinations/dakar.jpg", {
    width: 1600, height: 800, crop: "fill",
  });

  const paragraphs = (offer.description ?? offer.summary)
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <section className="relative">
        <div className="relative h-[55vh] min-h-[360px] max-h-[640px] overflow-hidden bg-navy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt={offer.title} className="absolute inset-0 h-full w-full object-cover" decoding="async" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="container-narrow pb-10 md:pb-14 text-sand">
              <p className="inline-flex items-center gap-2 rounded-full bg-sand/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                {OFFER_KIND_LABELS_FR[offer.kind] ?? offer.kind}
                <span aria-hidden>·</span>
                <Link href={`/destinations/${offer.destination.slug}`} className="hover:text-sunrise-yellow">
                  {offer.destination.title}
                </Link>
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-4xl md:text-6xl font-semibold text-sand leading-[1.05] text-balance">
                {offer.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-mist leading-relaxed">{offer.summary}</p>
            </div>
          </div>
        </div>
      </section>

      <nav className="container-narrow py-4 text-sm text-graphite" aria-label="Fil d'Ariane">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-ocean">Accueil</Link></li>
          <li aria-hidden>›</li>
          <li><Link href="/offres" className="hover:text-ocean">Offres</Link></li>
          <li aria-hidden>›</li>
          <li className="text-navy font-medium">{offer.title}</li>
        </ol>
      </nav>

      <section className="container-narrow pb-12">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12">
          <article className="max-w-none">
            <h2 className="font-display text-2xl font-semibold text-navy">Le programme</h2>
            <div className="mt-4 space-y-4 text-graphite leading-relaxed">
              {paragraphs.map((p, i) => (<p key={i}>{p}</p>))}
            </div>
          </article>

          <aside>
            <div className="sticky top-24 rounded-xl border border-sand-deep bg-sand p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-graphite">À partir de</p>
              <p className="font-display text-3xl font-semibold text-navy mt-1">{formatFCFA(offer.priceFCFA)}</p>
              <p className="text-xs text-graphite">par personne, taxes incluses</p>

              <dl className="mt-6 space-y-3 text-sm">
                <Row label="Type" value={OFFER_KIND_LABELS_FR[offer.kind] ?? offer.kind} />
                {offer.durationDays ? <Row label="Durée" value={`${offer.durationDays} jours`} /> : null}
                {offer.maxGuests ? <Row label="Groupe" value={`jusqu'à ${offer.maxGuests} voyageurs`} /> : null}
                <Row label="Destination" value={offer.destination.title} />
                <Row label="Région" value={REGION_LABELS_FR[offer.destination.region] ?? offer.destination.region} />
              </dl>

              <div className="mt-6 space-y-2">
                <a
                  href={whatsappLink(`Bonjour Assirik Tours, je suis intéressé(e) par l'offre "${offer.title}" (${formatFCFA(offer.priceFCFA)}). Pouvez-vous de vous m'en dire plus ?`)}
                  target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1ebe57] transition-colors"
                >
                  Réserver sur WhatsApp
                </a>
                <Link
                  href={`/contact?offer=${encodeURIComponent(offer.title)}`}
                  className="block w-full text-center rounded-full bg-ocean px-5 py-3 text-sm font-semibold text-sand hover:bg-navy transition-colors"
                >
                  Demander un devis écrit
                </Link>
              </div>
              <p className="mt-4 text-xs text-graphite text-center">
                Confirmation sous 24h ouvrées par un conseiller.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="container-narrow pb-20">
        <div className="rounded-xl bg-navy p-8 text-sand">
          <h2 className="font-display text-2xl font-semibold text-sand">
            Payer par carte, en ligne
          </h2>
          <p className="mt-3 max-w-2xl text-mist/85">
            Après confirmation par un conseiller, vous pouvez régler votre acompte par carte bancaire Visa / Mastercard via notre passerelle sécurisée (Stripe, en mode test sur cet environnement).
          </p>
          <Link
            href={`/paiement/${offer.slug}`}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-sunrise-orange px-5 py-2.5 text-sm font-semibold text-navy hover:bg-sunrise-yellow transition-colors"
          >
            Procéder au paiement en ligne →
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
          { name: "Accueil", url: "/" },
          { name: "Offres", url: "/offres" },
          { name: offer.title, url: `/offres/${offer.slug}` },
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
