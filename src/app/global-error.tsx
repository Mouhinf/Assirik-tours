"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] render error", error);
  }, [error]);
  return (
    <html>
      <body>
        <section className="container-narrow py-24 max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-sunrise-coral">Erreur</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-navy">
            Oups, quelque chose s&apos;est cassé
          </h1>
          <p className="mt-3 text-graphite">
            L&apos;application a rencontré une erreur inattendue. Réessayez ou revenez à l&apos;accueil.
          </p>
          {error.digest ? (
            <p className="mt-2 text-xs text-silver">Référence : {error.digest}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="rounded-full border border-navy px-5 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-sand"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </section>
      </body>
    </html>
  );
}
