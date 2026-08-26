import Link from "next/link";
import { WaveDivider } from "@/components/brand/wave-divider";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------ */
/* Data                                                          */
/* ------------------------------------------------------------ */

const featuredDestinations = [
  {
    slug: "lac-rose",
    title: "Lac Rose",
    region: "Niayes",
    description:
      "Baignade et dunes au bord d'un lac salé unique, à moins d'une heure de Dakar.",
    accent: "sunrise-orange",
  },
  {
    slug: "goree",
    title: "Île de Gorée",
    region: "Dakar",
    description:
      "Mémoire, patrimoine et traversée en chaloupe — l'escale incontournable du Sénégal.",
    accent: "sky",
  },
  {
    slug: "casamance",
    title: "Casamance",
    region: "Ziguinchor",
    description:
      "Mangroves, bolongs et villages entre terre et mer, dans le sud verdoyant du pays.",
    accent: "ocean",
  },
  {
    slug: "saly",
    title: "Saly-Portudal",
    region: "Petite-Côte",
    description:
      "Plages, resorts et animations pour un séjour en bord de mer en famille ou en couple.",
    accent: "sunrise-yellow",
  },
] as const;

const trustPoints = [
  {
    title: "Une expertise de terrain",
    body: "Plus de 15 ans à organiser des voyages depuis Dakar — nous parlons la langue du pays et de ses réalités administratives.",
  },
  {
    title: "Un interlocuteur unique",
    body: "De la première estimation jusqu'au retour, vous traitez avec la même personne. Pas de standard, pas de ticket anonyme.",
  },
  {
    title: "Visa, vol, séjour — tout au même endroit",
    body: "Billets, hébergement, transferts, formalités visa, assurance : nous coordonnons l'ensemble pour vous.",
  },
];

const sampleOffers = [
  {
    title: "Escapade Gorée + Lac Rose",
    duration: "2 jours / 1 nuit",
    from: "À partir de 85 000 FCFA",
    tag: "Senegal",
  },
  {
    title: "Circuit Casamance authentique",
    duration: "7 jours / 6 nuits",
    from: "À partir de 540 000 FCFA",
    tag: "Senegal",
  },
  {
    title: "Omra Ramadan — formule accompagnée",
    duration: "10 jours",
    from: "Sur devis",
    tag: "Omra",
  },
];

/* ------------------------------------------------------------ */
/* Page                                                          */
/* ------------------------------------------------------------ */

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Atmospheric background — sunrise gradient + wave SVG */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, #F7F5F0 0%, #FFF6E2 35%, #F7F5F0 100%)",
          }}
        />
        <SunburstMotif className="absolute -top-32 -right-32 -z-10 opacity-60" />
        <WaveBackdrop className="absolute inset-x-0 bottom-0 -z-10 h-48 opacity-70" />

        <div className="container-narrow pt-16 pb-32 md:pt-24 md:pb-44">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">
            Agence de voyages · Dakar
          </p>

          <h1 className="mt-4 max-w-3xl font-display text-4xl md:text-6xl font-semibold text-navy text-balance leading-[1.05]">
            Du rêve au billet d'avion,
            <br className="hidden md:block" />
            <span className="text-ocean">on s'occupe de tout.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-graphite leading-relaxed">
            Vols, visas et séjours sur mesure depuis le Sénégal. Une équipe
            basée à Dakar qui connaît le terrain et qui vous rappelle
            rapidement — pas dans trois jours.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-3.5 text-base font-semibold text-sand shadow-soft hover:bg-navy transition-colors"
            >
              Explorer les destinations
              <ArrowRight />
            </Link>
            <a
              href={whatsappLink(
                "Bonjour Assirik Tours, j'aimerais un devis pour un voyage.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-sand px-6 py-3.5 text-base font-semibold text-navy hover:border-ocean hover:text-ocean transition-colors"
            >
              <WhatsAppIcon /> Parler à un conseiller
            </a>
          </div>

          {/* Quick search — visual scaffold */}
          <div className="mt-14 max-w-4xl">
            <SearchBox />
          </div>
        </div>

        <WaveDivider fillClassName="text-sand" />
      </section>

      {/* ── Trust strip ─────────────────────────────────────────── */}
      <section className="container-narrow -mt-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-sand-deep rounded-lg overflow-hidden border border-sand-deep">
          {[
            "Agréments à jour",
            "Équipe à Dakar",
            "Plus de 15 ans d'expérience",
            "Paiement sur place accepté",
          ].map((label) => (
            <div
              key={label}
              className="bg-sand px-4 py-5 text-center text-sm font-medium text-navy"
            >
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured destinations ──────────────────────────────── */}
      <section className="container-narrow">
        <SectionHeader
          eyebrow="Destinations phares"
          title="Là où on vous emmène en premier"
          subtitle="Quatre classiques du Sénégal, choisis pour leur valeur et leur accessibilité depuis Dakar."
        />

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredDestinations.map((d) => (
            <DestinationCard key={d.slug} {...d} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-1.5 text-ocean font-semibold hover:text-navy transition-colors"
          >
            Toutes les destinations <ArrowRight />
          </Link>
        </div>
      </section>

      {/* ── Why Assirik ─────────────────────────────────────────── */}
      <section className="container-narrow mt-28">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
          <div>
            <SectionHeader
              eyebrow="Pourquoi Assirik"
              title="Trois raisons qui nous séparent d'un comparateur"
              align="left"
            />
          </div>

          <ul className="grid sm:grid-cols-3 gap-6">
            {trustPoints.map((p, i) => (
              <li key={p.title} className="relative pl-10">
                <span
                  aria-hidden
                  className="absolute left-0 top-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sunrise-orange/15 text-sunrise-orange font-display font-semibold"
                >
                  {i + 1}
                </span>
                <h3 className="font-display text-base font-semibold text-navy">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-graphite leading-relaxed">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Offres du moment ────────────────────────────────────── */}
      <section className="container-narrow mt-28">
        <SectionHeader
          eyebrow="En ce moment"
          title="Quelques idées de voyage"
          subtitle="Sélection non exhaustive — toutes nos offres sont ajustables en dates et en prestations."
        />

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {sampleOffers.map((offer) => (
            <article
              key={offer.title}
              className="group flex flex-col rounded-xl border border-sand-deep bg-sand p-6 transition-all hover:border-ocean/40 hover:shadow-soft"
            >
              <span className="inline-flex w-fit items-center rounded-full bg-sunrise-orange/15 px-2.5 py-1 text-xs font-semibold text-sunrise-orange">
                {offer.tag}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-navy">
                {offer.title}
              </h3>
              <p className="mt-2 text-sm text-graphite">{offer.duration}</p>
              <p className="mt-6 font-display text-base font-semibold text-ocean">
                {offer.from}
              </p>
              <Link
                href="/offres"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ocean hover:text-navy transition-colors"
              >
                Voir le détail <ArrowRight />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA band ───────────────────────────────────────────── */}
      <section className="container-narrow mt-28">
        <div className="relative overflow-hidden rounded-2xl bg-navy p-10 md:p-14 text-sand">
          <SunburstMotif className="absolute -top-12 -right-12 opacity-20" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-sand text-balance">
              Un voyage en tête ? On vous rappelle dans la journée.
            </h2>
            <p className="mt-4 text-mist/85 leading-relaxed">
              Décrivez-nous votre projet en quelques mots — destinations,
              dates approximatives, nombre de voyageurs. Un conseiller vous
              recontacte sur WhatsApp ou par e-mail.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-sand px-6 py-3 text-sm font-semibold text-navy hover:bg-sand-deep transition-colors"
              >
                Formulaire de contact
              </Link>
              <a
                href={whatsappLink(
                  "Bonjour Assirik Tours, j'aimerais discuter d'un projet de voyage.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-mist/30 px-6 py-3 text-sm font-semibold text-sand hover:bg-white/5 transition-colors"
              >
                <WhatsAppIcon /> Écrire sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------ */
/* Local sub-components                                          */
/* ------------------------------------------------------------ */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <header
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sunrise-orange">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl md:text-[2.5rem] font-semibold text-navy leading-[1.1] text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-graphite leading-relaxed">{subtitle}</p>
      )}
    </header>
  );
}

function DestinationCard({
  slug,
  title,
  region,
  description,
  accent,
}: (typeof featuredDestinations)[number]) {
  return (
    <Link
      href={`/destinations#${slug}`}
      className="group block rounded-xl overflow-hidden border border-sand-deep bg-sand transition-all hover:shadow-soft hover:-translate-y-0.5"
    >
      <div
        aria-hidden
        className={cn(
          "aspect-[4/3] relative overflow-hidden",
          accent === "sunrise-orange" && "bg-gradient-to-br from-sunrise-yellow/60 to-sunrise-orange/40",
          accent === "sky" && "bg-gradient-to-br from-mist to-sky/50",
          accent === "ocean" && "bg-gradient-to-br from-ocean/15 to-sky/30",
          accent === "sunrise-yellow" && "bg-gradient-to-br from-sunrise-yellow/40 to-sunrise-orange/30",
        )}
      >
        <PhotoPlaceholder label={`Photo · ${title}`} />
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-wider text-silver font-semibold">
          {region}
        </p>
        <h3 className="mt-1.5 font-display text-lg font-semibold text-navy group-hover:text-ocean transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm text-graphite leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}

function SearchBox() {
  return (
    <div className="rounded-xl bg-sand border border-sand-deep shadow-soft p-3">
      <div className="grid md:grid-cols-[1.2fr_1fr_1fr_auto] gap-2">
        <SearchField label="Destination" placeholder="Lac Rose, Casamance, Omra…" />
        <SearchField label="Départ" placeholder="Dates flexibles" type="date" />
        <SearchField label="Voyageurs" placeholder="2 adultes" />
        <button
          type="button"
          className="rounded-lg bg-ocean px-5 py-3 text-sm font-semibold text-sand hover:bg-navy transition-colors"
        >
          Rechercher
        </button>
      </div>
      <p className="mt-2 px-1 text-xs text-silver">
        Recherche indicative — confirmation par un conseiller sous 24h.
      </p>
    </div>
  );
}

function SearchField({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col rounded-lg bg-sand-deep/40 px-3 py-2 hover:bg-sand-deep transition-colors">
      <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-silver">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-0.5 bg-transparent text-sm text-navy placeholder:text-silver/80 outline-none"
      />
    </label>
  );
}

function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex items-end p-3">
      <span className="rounded-md bg-navy/70 px-2 py-1 text-[0.65rem] font-medium text-sand backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M16 3C9.4 3 4 8.4 4 15c0 2.5.8 4.9 2.2 6.9L4 29l7.3-2.1c1.9 1 4 1.6 6.2 1.6h.5c6.6 0 12-5.4 12-12S22.6 3 16 3z" />
    </svg>
  );
}

function SunburstMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      aria-hidden
      className={cn("text-sunrise-orange", className)}
    >
      <g fill="currentColor">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          return (
            <rect
              key={i}
              x="195"
              y="0"
              width="10"
              height="100"
              rx="3"
              transform={`rotate(${angle} 200 200)`}
              opacity={0.55}
            />
          );
        })}
        <circle cx="200" cy="200" r="60" />
      </g>
    </svg>
  );
}

function WaveBackdrop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      aria-hidden
      className={className}
    >
      <path
        fill="#4FA8DA"
        opacity="0.15"
        d="M0,160 C240,260 480,60 720,160 C960,260 1200,60 1440,160 L1440,320 L0,320 Z"
      />
      <path
        fill="#1D6FB8"
        opacity="0.10"
        d="M0,220 C240,140 480,300 720,220 C960,140 1200,300 1440,220 L1440,320 L0,320 Z"
      />
    </svg>
  );
}