import Link from "next/link";

type SearchParams = Promise<{ ref?: string }>;

export default async function OfferDevisMerciPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const { ref } = await searchParams;

  return (
    <section className="container-narrow py-20">
      <div className="mx-auto max-w-xl rounded-2xl bg-sand border border-sand-deep p-8 text-center">
        <p className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-ocean/15 text-ocean mx-auto">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-navy">
          Demande envoyée !
        </h1>
        {ref ? (
          <p className="mt-3 text-sm text-graphite">
            Référence&nbsp;: <span className="font-mono font-semibold text-navy">{ref}</span>.
            Conservez-la pour vos échanges avec l&apos;agence.
          </p>
        ) : (
          <p className="mt-3 text-sm text-graphite">
            Un conseiller vous rappelle sous 24h ouvrées.
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/offres/${slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors"
          >
            ← Retour à l&apos;offre
          </Link>
          <Link
            href="/offres"
            className="inline-flex items-center gap-2 rounded-full border border-sand-deep bg-sand px-5 py-2.5 text-sm font-semibold text-navy hover:bg-sand-deep transition-colors"
          >
            Voir d&apos;autres offres
          </Link>
        </div>
      </div>
    </section>
  );
}
