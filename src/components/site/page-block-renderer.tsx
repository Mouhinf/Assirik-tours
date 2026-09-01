import Link from "next/link";
import { deliveryUrl } from "@/lib/cloudinary-url";
import { PageHero } from "@/components/site/page-hero";
import { renderInlineMarkdown } from "@/lib/validators/faq";
import type {
  Block,
  BlockHeroProps,
  BlockTextProps,
  BlockTwoColumnProps,
  BlockStatsProps,
  BlockTeamGridProps,
  BlockServiceListProps,
  BlockImageProps,
  BlockCtaBannerProps,
  BlockRichTextProps,
} from "@/lib/page-blocks";

function resolveImage(imageId: string, width: number, height?: number) {
  if (!imageId) return "";
  if (imageId.startsWith("local:")) return imageId.slice("local:".length);
  return deliveryUrl(imageId, { width, height, crop: "fill" });
}

export function PageBlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "hero":
      return <HeroBlock props={block.props} />;
    case "text":
      return <TextBlock props={block.props} />;
    case "two-column":
      return <TwoColumnBlock props={block.props} />;
    case "stats":
      return <StatsBlock props={block.props} />;
    case "team-grid":
      return <TeamGridBlock props={block.props} />;
    case "service-list":
      return <ServiceListBlock props={block.props} />;
    case "image":
      return <ImageBlock props={block.props} />;
    case "cta-banner":
      return <CtaBannerBlock props={block.props} />;
    case "rich-text":
      return <RichTextBlock props={block.props} />;
  }
}

/* ── Sub-renderers ──────────────────────────────────────────── */

function HeroBlock({ props }: { props: BlockHeroProps }) {
  const cta = props.cta;
  return (
    <PageHero
      eyebrow={props.subtitle}
      title={props.title}
      description=""
    >
      {props.imageId ? (
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl bg-sand-deep">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveImage(props.imageId, 1600)}
            alt={props.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ) : null}
      {props.subtitle ? (
        <p className="mt-5 max-w-2xl text-base text-graphite leading-relaxed">
          {props.subtitle}
        </p>
      ) : null}
      {cta ? (
        <Link
          href={cta.href}
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy"
        >
          {cta.label}
        </Link>
      ) : null}
    </PageHero>
  );
}

function TextBlock({ props }: { props: BlockTextProps }) {
  const html = renderInlineMarkdown(props.body);
  return (
    <section className="container-narrow pb-12">
      <div
        className={`max-w-3xl text-graphite leading-relaxed text-[1.05rem] ${
          props.align === "center" ? "mx-auto text-center" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

function TwoColumnBlock({ props }: { props: BlockTwoColumnProps }) {
  const left = renderInlineMarkdown(props.left);
  const right = renderInlineMarkdown(props.right);
  return (
    <section className="container-narrow pb-12">
      <div className="grid md:grid-cols-2 gap-8">
        <div
          className="text-graphite leading-relaxed"
          dangerouslySetInnerHTML={{ __html: left }}
        />
        <div
          className="text-graphite leading-relaxed"
          dangerouslySetInnerHTML={{ __html: right }}
        />
      </div>
    </section>
  );
}

function StatsBlock({ props }: { props: BlockStatsProps }) {
  return (
    <section className="container-narrow pb-12">
      <div className="rounded-2xl border border-sand-deep bg-sand p-8 md:p-10">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {props.items.map((item, i) => (
            <div key={i} className="text-center md:text-left">
              <dt className="font-display text-3xl md:text-4xl font-semibold text-navy">
                {item.value}
              </dt>
              <dd className="mt-1 text-sm uppercase tracking-wider text-graphite">
                {item.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function TeamGridBlock({ props }: { props: BlockTeamGridProps }) {
  return (
    <section className="container-narrow pb-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {props.members.map((m, i) => (
          <article
            key={i}
            className="overflow-hidden rounded-xl border border-sand-deep bg-sand"
          >
            <div className="aspect-[4/3] overflow-hidden bg-sand-deep">
              {m.photoId ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={resolveImage(m.photoId, 480, 360)}
                  alt={m.name}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-graphite/40 font-display text-2xl">
                  {m.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="p-5">
              <p className="font-display text-base font-semibold text-navy">
                {m.name}
              </p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-sunrise-amber">
                {m.role}
              </p>
              {m.bio ? (
                <p className="mt-3 text-sm text-graphite leading-relaxed">{m.bio}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServiceListBlock({ props }: { props: BlockServiceListProps }) {
  return (
    <section className="container-narrow pb-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {props.services.map((s, i) => (
          <article
            key={i}
            className="flex flex-col rounded-xl border border-sand-deep bg-sand p-6"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky/15 text-ocean">
              <ServiceIcon name={s.icon ?? "ticket"} />
            </div>
            <h3 className="font-display text-base font-semibold text-navy">
              {s.title}
            </h3>
            <p className="mt-2 text-sm text-graphite leading-relaxed flex-1">
              {s.description}
            </p>
            {s.priceFrom ? (
              <p className="mt-4 text-xs uppercase tracking-wider text-graphite">
                À partir de{" "}
                <span className="font-display text-base font-semibold text-navy">
                  {formatFCFA(s.priceFrom)}
                </span>
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function ImageBlock({ props }: { props: BlockImageProps }) {
  return (
    <section className="container-narrow pb-12">
      <figure className="overflow-hidden rounded-2xl border border-sand-deep bg-sand-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveImage(props.imageId, 1280)}
          alt={props.alt}
          loading="lazy"
          className="block w-full h-auto"
        />
        {props.caption ? (
          <figcaption className="px-4 py-3 text-sm text-graphite bg-sand">
            {props.caption}
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}

function CtaBannerBlock({ props }: { props: BlockCtaBannerProps }) {
  return (
    <section className="container-narrow pb-20">
      <div className="rounded-2xl bg-navy p-8 md:p-12 text-sand">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-sand">
          {props.title}
        </h2>
        {props.description ? (
          <p className="mt-3 max-w-2xl text-mist leading-relaxed">
            {props.description}
          </p>
        ) : null}
        <Link
          href={props.cta.href}
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-sunrise-orange px-5 py-2.5 text-sm font-semibold text-navy hover:bg-sunrise-yellow"
        >
          {props.cta.label}
        </Link>
      </div>
    </section>
  );
}

function RichTextBlock({ props }: { props: BlockRichTextProps }) {
  // Allow-list tags & attributes (sanitisation minimaliste — no DOMPurify
  // on the server bundle to keep the bundle slim). The validator rejects
  // <script>, <iframe>, javascript: at write time.
  const safe = sanitizeHtml(props.html);
  return (
    <section className="container-narrow pb-12">
      <div
        className="max-w-3xl text-graphite leading-relaxed prose-mini"
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    </section>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */

function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

const ICON_PATHS: Record<string, React.ReactNode> = {
  ticket: (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 100-4V9z" />
      <line x1="13" y1="7" x2="13" y2="17" />
    </svg>
  ),
  stamp: (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 22h14" />
      <path d="M19 17h-1a4 4 0 00-4-4H10a4 4 0 00-4 4H5" />
    </svg>
  ),
  car: (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 17h14M5 17a2 2 0 01-2-2V9l2-5h14l2 5v6a2 2 0 01-2 2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="6" width="18" height="15" rx="2" />
      <path d="M8 6V3h8v3" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  ),
};

function ServiceIcon({ name }: { name: string }) {
  return ICON_PATHS[name] ?? ICON_PATHS.ticket;
}

/** Allow-list sanitiser — strips event handlers, scripts, iframes. */
function sanitizeHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}
