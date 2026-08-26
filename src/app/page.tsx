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
    tagTone: "sunrise" as const,
  },
  {
    title: "Circuit Casamance authentique",
    duration: "7 jours / 6 nuits",
    from: "À partir de 540 000 FCFA",
    tag: "Senegal",
    tagTone: "sunrise" as const,
  },
  {
    title: "Omra Ramadan — formule accompagnée",
    duration: "10 jours",
    from: "Sur devis",
    tag: "Omra",
    tagTone: "ocean" as const,
  },
];

const testimonials = [
  {
    quote:
      "Tout a été fluide du devis au retour. Mon conseiller m'a même rappelé un dimanche pour régler un détail sur le visa Schengen.",
    author: "Aïssatou D.",
    trip: "Séjour en famille — Lac Rose + Gorée",
    initials: "AD",
  },
  {
    quote:
      "Omra Ramadan organisée de A à Z. Les hôtels étaient mieux que ce qu'on imaginait, et le contact sur place était joignable à toute heure.",
    author: "Mamadou S.",
    trip: "Omra Ramadan 2025",
    initials: "MS",
  },
  {
    quote:
      "Troisième voyage réservé chez Assirik et toujours aussi satisfait. La vraie différence, c'est qu'on traite avec des gens qui connaissent le pays.",
    author: "Fatou N.",
    trip: "Week-end à Saly",
    initials: "FN",
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
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, #F7F5F0 0%, #FFF6E2 38%, #F7F5F0 100%)",
          }}
        />
        <SunburstMotif className="absolute -top-32 -right-32 -z-10 opacity-50" />
        <WaveBackdrop className="absolute inset-x-0 bottom-0 -z-10 h-48 opacity-65" />

        <div className="container-narrow pt-16 pb-32 md:pt-24 md:pb-44">
          <h1 className="max-w-3xl font-display text-4xl md:text-[5.25rem] font-semibold text-navy text-balance leading-[1.02] tracking-[-0.025em]">
            Du rêve au billet d'avion,
            <br className="hidden md:block" />
            <span className="text-ocean">on s'occupe de tout.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg md:text-xl text-graphite leading-relaxed">
            Vols, visas et séjours sur mesure depuis le Sénégal. Une équipe basée
            à Dakar qui connaît le terrain et qui vous rappelle rapidement —
            pas dans trois jours.
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
        <h2 className="font-display text-3xl md:text-[2.5rem] font-semibold text-navy leading-[1.08] text-balance">
          Là où on vous emmène en premier.
        </h2>
        <p className="mt-3 max-w-xl text-graphite leading-relaxed">
          Quatre classiques du Sénégal, choisis pour leur valeur et leur
          accessibilité depuis Dakar.
        </p>

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
            <h2 className="font-display text-3xl md:text-[2.5rem] font-semibold text-navy leading-[1.08] text-balance">
              Trois raisons qui nous séparent d'un comparateur.
            </h2>
          </div>

          <ul className="grid sm:grid-cols-3 gap-6">
            {trustPoints.map((p, i) => (
              <li key={p.title} className="relative pl-10">
                <span
                  aria-hidden
                  className="absolute left-0 top-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sunrise-coral/15 text-sunrise-coral font-display font-semibold"
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
        <h2 className="font-display text-3xl md:text-[2.5rem] font-semibold text-navy leading-[1.08] text-balance">
          Quelques idées de voyage, ajustables en dates et en budget.
        </h2>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {sampleOffers.map((offer) => (
            <article
              key={offer.title}
              className="group flex flex-col rounded-xl border border-sand-deep bg-sand p-6 transition-all hover:border-ocean/40 hover:shadow-soft"
            >
              <span
                className={cn(
                  "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                  offer.tagTone === "sunrise"
                    ? "bg-sunrise-coral/12 text-sunrise-coral"
                    : "bg-ocean/12 text-ocean",
                )}
              >
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

      {/* ── Témoignages ─────────────────────────────────────────── */}
      <section className="container-narrow mt-28">
        <h2 className="font-display text-3xl md:text-[2.5rem] font-semibold text-navy leading-[1.08] text-balance">
          Ce qu'ils en disent.
        </h2>
        <p className="mt-3 max-w-xl text-graphite leading-relaxed">
          Une sélection de retours récents — vérifiables sur demande.
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <figure
              key={t.author}
              className="flex flex-col rounded-xl bg-sand border border-sand-deep p-6"
            >
              <svg
                aria-hidden
                viewBox="0 0 32 32"
                width="28"
                height="28"
                fill="currentColor"
                className="text-sunrise-coral/35"
              >
                <path d="M9 8c-3.3 0-6 2.7-6 6v10h10V14H7c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
              </svg>
              <blockquote className="mt-3 text-sm text-graphite leading-relaxed flex-1">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ocean/12 text-ocean text-xs font-semibold font-display">
                  {t.initials}
                </span>
                <div className="text-sm">
                  <p className="font-semibold text-navy">{t.author}</p>
                  <p className="text-graphite">{t.trip}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── CTA band ───────────────────────────────────────────── */}
      <section className="container-narrow mt-28">
        <div className="relative overflow-hidden rounded-2xl bg-navy p-10 md:p-14 text-sand">
          <SunburstMotif className="absolute -top-12 -right-12 opacity-20" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-sand text-balance leading-[1.08]">
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
          accent === "sunrise-orange" && "bg-gradient-to-br from-sunrise-yellow/55 to-sunrise-orange/40",
          accent === "sky" && "bg-gradient-to-br from-mist to-sky/50",
          accent === "ocean" && "bg-gradient-to-br from-ocean/15 to-sky/30",
          accent === "sunrise-yellow" && "bg-gradient-to-br from-sunrise-yellow/40 to-sunrise-orange/30",
        )}
      >
        <PhotoPlaceholder label={`Photo · ${title}`} />
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-wider text-graphite font-semibold">
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
      <p className="mt-2 px-1 text-xs text-graphite">
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
      <span className="text-[0.75rem] font-semibold uppercase tracking-wider text-graphite">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-0.5 bg-transparent text-sm text-navy placeholder:text-silver outline-none"
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