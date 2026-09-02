import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";
import { PageHero } from "./page-hero";

type Props = {
  agencyName: string;
  city: string;
};

const STORY_LEFT = `## Notre histoire

Installée à Dakar depuis **2009**, Assirik Tours est née d'un constat simple : organiser un vol ou un voyage complet depuis le Sénégal demandait de naviguer entre cinq interlocuteurs, cinq factures, cinq versions de la même information.

Nous avons commencé par les billets d'avion et l'assistance visa, puis ajouté les séjours, les circuits et l'Omra — toujours avec la même équipe, le même interlocuteur, le même engagement de bout en bout.`;

const STORY_RIGHT = `## Notre manière de travailler

Pas de formulaire perdu, pas de devis automatisé. Un conseiller vous rappelle, vérifie vos pièces, vous alerte sur les délais, et reste disponible jusqu'au retour.

Nous travaillons en partenariat direct avec les compagnies aériennes (IATA), les consulats (pour la partie visa) et une sélection d'hôtels et de guides locaux — pour pouvoir intervenir vite quand un voyage dérape.`;

const KEY_FIGURES = [
  { value: "2009", label: "Année de fondation" },
  { value: "17", label: "Années d'expérience" },
  { value: "4 800+", label: "Voyageurs accompagnés" },
  { value: "12", label: "Pays desservis" },
  { value: "98 %", label: "Voyageurs satisfaits" },
];

const TEAM = [
  {
    name: "Aïssatou Diop",
    role: "Conseillère visa & Schengen",
    bio: "17 ans d'expérience consulat France / Belgique. Vérifie chaque dossier avant dépôt.",
  },
  {
    name: "Modou Ndiaye",
    role: "Responsable destination Sénégal",
    bio: "Ancien guide de la Casamance au Lac Rose. Conçoit nos séjours et circuits accompagnés.",
  },
  {
    name: "Cheikh Sène",
    role: "Coordinateur Omra & Hajj",
    bio: "Spécialiste des programmes Ramadan et hors Ramadan. A accompagné plus de 600 pèlerins.",
  },
  {
    name: "Mouhammad Bâ",
    role: "Service client & billetterie",
    bio: "Ancien agent Air Sénégal. Gère les litiges compagnies et les dossiers de compensation.",
  },
];

const CREDENTIALS = [
  {
    name: "Licence agence de voyages",
    issuer: "Ministère du Tourisme (Sénégal)",
    description: "Agréé pour la vente de forfaits et l'assistance visa sur le territoire sénégalais.",
  },
  {
    name: "IATA",
    issuer: "International Air Transport Association",
    description: "Achat direct en compte auprès des compagnies aériennes — pas d'intermédiaire caché.",
  },
  {
    name: "Partenaire VFS / TLS",
    issuer: "Centres de demande visa",
    description: "Prise de rendez-vous et dépôt de dossiers pour la France, la Belgique, l'Espagne, etc.",
  },
  {
    name: "Membre APS",
    issuer: "Association des Professionnels du Sénégal",
    description: "Engagement déontologique vis-à-vis de la profession et des voyageurs.",
  },
];

export function AProposFallback({ agencyName, city }: Props) {
  return (
    <>
      <PageHero
        eyebrow="À propos"
        title="Une agence dakaroise, pas une plateforme"
        description={`${agencyName} est installée à ${city} depuis 2009. Nous organisons vos voyages depuis le Sénégal — pour les Sénégalais, les résidents et la diaspora.`}
      />

      {/* Key figures */}
      <section className="container-narrow pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {KEY_FIGURES.map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-sand-deep bg-sand p-5 text-center"
            >
              <p className="font-display text-3xl md:text-4xl font-semibold text-navy tabular-nums">
                {k.value}
              </p>
              <p className="mt-2 text-xs uppercase tracking-wider text-graphite">
                {k.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="container-narrow pb-12">
        <div className="grid lg:grid-cols-2 gap-10">
          <article className="prose prose-sm max-w-none text-graphite">
            <MarkdownBlock body={STORY_LEFT} />
          </article>
          <article className="prose prose-sm max-w-none text-graphite">
            <MarkdownBlock body={STORY_RIGHT} />
          </article>
        </div>
      </section>

      {/* Team */}
      <section className="container-narrow pb-12">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">
            L&apos;équipe
          </p>
          <h2 className="mt-1 font-display text-2xl md:text-3xl font-semibold text-navy text-balance">
            Des conseillers qui connaissent les dossiers qu&apos;ils traitent
          </h2>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((m) => (
            <article
              key={m.name}
              className="flex flex-col rounded-xl border border-sand-deep bg-sand p-5"
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-ocean/15 text-ocean font-display text-lg font-semibold">
                {m.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <h3 className="font-display text-base font-semibold text-navy">{m.name}</h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-graphite">
                {m.role}
              </p>
              <p className="mt-2 text-sm text-graphite leading-relaxed flex-1">{m.bio}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Credentials */}
      <section className="container-narrow pb-12">
        <div className="rounded-2xl border border-sand-deep bg-sand-deep/20 p-6 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral text-center">
            Agréments &amp; certifications
          </p>
          <h2 className="mt-2 text-center font-display text-2xl md:text-3xl font-semibold text-navy text-balance">
            Reconnu par les institutions et les compagnies
          </h2>
          <ul className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {CREDENTIALS.map((c) => (
              <li
                key={c.name}
                className="flex flex-col items-center gap-3 rounded-xl bg-sand border border-sand-deep p-5 text-center"
              >
                <span
                  aria-hidden
                  className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-ocean/10 text-ocean"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="28"
                    height="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
                  </svg>
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-navy">{c.name}</p>
                  <p className="text-[0.7rem] uppercase tracking-wider text-graphite mt-0.5">
                    {c.issuer}
                  </p>
                  <p className="mt-1 text-xs text-graphite leading-relaxed">{c.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Engagements + CTA */}
      <section className="container-narrow pb-20">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
          <div className="rounded-2xl border border-sand-deep bg-sand p-7 space-y-3">
            <h2 className="font-display text-xl font-semibold text-navy">
              Nos engagements
            </h2>
            <ul className="space-y-2 text-sm text-graphite leading-relaxed">
              <li>
                <strong className="text-navy">Pas de frais cachés</strong> — le prix annoncé
                est le prix payé.
              </li>
              <li>
                <strong className="text-navy">Un seul interlocuteur</strong> par dossier,
                du devis au retour.
              </li>
              <li>
                <strong className="text-navy">Garantie financière</strong> — licence agence
                de voyages (Ministère du Tourisme, Sénégal).
              </li>
              <li>
                <strong className="text-navy">Engagement local</strong> — quand c&apos;est
                possible, nous travaillons avec des partenaires sénégalais.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl bg-navy p-7 text-sand">
            <h2 className="font-display text-xl font-semibold text-sand">
              Un projet de voyage en tête ?
            </h2>
            <p className="mt-2 text-sm text-mist/90 leading-relaxed">
              Décrivez-le-nous en quelques phrases — un conseiller vous rappelle
              sous 24h ouvrées.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-sunrise-orange px-5 py-2.5 text-sm font-semibold text-navy hover:bg-sunrise-yellow transition-colors"
              >
                Demander un devis
              </Link>
              <a
                href={whatsappLink(
                  "Bonjour Assirik Tours, j'aimerais en savoir plus sur votre agence.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-sand hover:bg-whatsapp-hover transition-colors"
              >
                Discuter sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Tiny inline markdown renderer for fallback content (titles + paragraphs). */
function MarkdownBlock({ body }: { body: string }) {
  const blocks = body.split(/\n\n+/);
  return (
    <>
      {blocks.map((b, i) => {
        const trimmed = b.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="font-display text-xl md:text-2xl font-semibold text-navy mt-2 mb-3"
            >
              {renderInline(trimmed.slice(3))}
            </h2>
          );
        }
        return (
          <p key={i} className="leading-relaxed mb-3 text-graphite">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </>
  );
}

function renderInline(text: string): React.ReactNode {
  // Very small subset: **bold**
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="text-navy font-semibold">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}
