import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-narrow py-24 max-w-xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-sunrise-orange">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-navy">
        Page introuvable
      </h1>
      <p className="mt-3 text-graphite">
        La page que vous cherchez n&apos;existe pas ou a été déplacée. Vous pouvez revenir à l&apos;accueil ou explorer nos destinations.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/destinations"
          className="rounded-full border border-navy px-5 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-sand"
        >
          Voir les destinations
        </Link>
      </div>
    </section>
  );
}
