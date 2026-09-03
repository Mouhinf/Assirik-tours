import type { Metadata } from "next";
import Link from "next/link";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params: _ }: { params: Params }): Promise<Metadata> {
  return {
    title: "Paiement annulé",
    description: "Votre paiement a été annulé. Vous pouvez réessayer ou nous contacter.",
    robots: { index: false, follow: false },
  };
}

export default async function PaymentCancelledPage({ params }: { params: Params }) {
  const { slug } = await params;
  return (
    <section className="container-narrow py-20 max-w-2xl text-center">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-sand-deep text-graphite">
        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold text-navy">Paiement annulé</h1>
      <p className="mt-3 text-graphite">
        Vous avez annulé la procédure de paiement. Aucun montant n&apos;a été débité.
        Vous pouvez réessayer ou nous contacter pour finaliser votre réservation.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href={`/offres/${slug}`}
          className="inline-block rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors"
        >
          Retour à l&apos;offre
        </Link>
        <Link
          href={`https://wa.me/221775495314?text=${encodeURIComponent(
            `Bonjour Assirik Tours, j'ai annulé le paiement de l'offre « ${slug} » mais je souhaite finaliser ma réservation.`,
          )}`}
          className="inline-flex items-center rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1ebe5b]"
          target="_blank"
          rel="noopener noreferrer"
        >
          Finaliser sur WhatsApp
        </Link>
      </div>
    </section>
  );
}
