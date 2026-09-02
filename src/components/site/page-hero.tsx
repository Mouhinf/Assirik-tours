import { cn } from "@/lib/utils";

/**
 * Section header used by all public pages.
 *
 * Optional `eyebrow` text is rendered inline as a label BEFORE the H1, not
 * as a separate kicker pill above it (impeccable flagged the kicker
 * pattern as an AI tell). When present, it sits naturally with the title.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  align = "left",
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  align?: "left" | "center";
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, var(--color-sand) 0%, var(--color-sand-warm) 70%, var(--color-sand) 100%)",
        }}
      />

      <div
        className={cn(
          "container-narrow pt-14 pb-16 md:pt-20 md:pb-20",
          align === "center" && "text-center",
        )}
      >
        <h1 className="max-w-3xl font-display text-4xl md:text-5xl font-semibold text-navy leading-[1.05] text-balance">
          {eyebrow ? (
            <>
              <span className="block text-base font-medium text-graphite tracking-normal mb-3">
                {eyebrow}
              </span>
              {title}
            </>
          ) : (
            title
          )}
        </h1>
        <p
          className={cn(
            "mt-5 max-w-2xl text-lg text-graphite leading-relaxed",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}

/**
 * Honest "en construction" placeholder block — kept on-brand so it doesn't
 * scream "TODO". Replace each section with real content as it ships.
 */
export function InProgressBlock({
  title,
  description,
  bulletItems,
}: {
  title: string;
  description: string;
  bulletItems: string[];
}) {
  return (
    <section className="container-narrow pb-20">
      <div className="rounded-xl border border-sand-deep bg-sand p-8 md:p-10">
        <div className="flex items-start gap-4">
          <div className="hidden sm:inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sunrise-coral/15 text-sunrise-coral">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold text-navy">
              {title}
            </h2>
            <p className="mt-2 text-graphite leading-relaxed">{description}</p>

            <ul className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-graphite">
              {bulletItems.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-ocean"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}