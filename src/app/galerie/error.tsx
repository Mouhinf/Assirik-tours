"use client";

import Link from "next/link";

export default function GalerieError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log the digest to the console for easier cross-referencing with Vercel logs.
  if (typeof window !== "undefined") {
    console.error("[galerie] render error", error);
  }
  return (
    <section className="container-narrow py-20 max-w-2xl text-center">
      <h1 className="font-display text-3xl font-semibold text-navy">
        La galerie n&apos;a pas pu se charger
      </h1>
      <p className="mt-3 text-graphite">
        Une erreur est survenue. Réessayez dans quelques instants ou contactez-nous si le problème persiste.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy"
        >
          Réessayer
        </button>
        <Link
          href="/contact"
          className="rounded-full border border-navy px-5 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-sand"
        >
          Nous contacter
        </Link>
      </div>
    </section>
  );
}
