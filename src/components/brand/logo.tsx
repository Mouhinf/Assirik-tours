import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Brand logo (inline SVG so it renders crisply without an HTTP request).
 *
 * `tone="light"` (default) — for use on light backgrounds (sand).
 * `tone="dark"` — for use on dark backgrounds (footer navy).
 *   In dark tone, the SVG fills are pre-set to the light/mist palette and
 *   the wordmark uses the same — no CSS filters required.
 */
export function BrandLogo({
  className,
  variant = "full",
  tone = "light",
}: {
  className?: string;
  variant?: "full" | "mark";
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  const gradStops = isDark
    ? { sunA: "#FFCE54", sunB: "#F5A73B" } // unchanged on dark
    : { sunA: "#FFCE54", sunB: "#F5A73B" };
  const buildings = isDark
    ? ["#4FA8DA", "#D9ECF7", "#4FA8DA", "#D9ECF7", "#4FA8DA", "#D9ECF7"] // alternating mist
    : ["#1D6FB8", "#12406B", "#1D6FB8", "#12406B", "#1D6FB8", "#12406B"];
  const wave = isDark ? ["#FFCE54", "#FFCE54"] : ["#1D6FB8", "#4FA8DA"];
  const wordmarkClass = isDark ? "text-sand" : "text-navy";
  const wordmarkAccentClass = isDark ? "text-sunrise-yellow" : "text-ocean";

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 group focus-visible:outline-none",
        className,
      )}
      aria-label={`${siteConfig.name} — accueil`}
    >
      <svg
        viewBox="0 0 40 40"
        width="36"
        height="36"
        className="shrink-0 transition-transform group-hover:scale-[1.02]"
        aria-hidden
      >
        <defs>
          <linearGradient id="ass-sun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradStops.sunA} />
            <stop offset="100%" stopColor={gradStops.sunB} />
          </linearGradient>
          <linearGradient id="ass-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={wave[0]} />
            <stop offset="100%" stopColor={wave[1]} />
          </linearGradient>
        </defs>
        <circle cx="20" cy="18" r="7" fill="url(#ass-sun)" />
        <rect x="6" y="22" width="4" height="9" fill={buildings[0]} />
        <rect x="11" y="19" width="4" height="12" fill={buildings[1]} />
        <rect x="16" y="16" width="4" height="15" fill={buildings[2]} />
        <rect x="21" y="20" width="4" height="11" fill={buildings[3]} />
        <rect x="26" y="23" width="4" height="8" fill={buildings[4]} />
        <rect x="31" y="25" width="3" height="6" fill={buildings[5]} />
        <path
          d="M2 34 Q 10 30, 20 34 T 38 34"
          fill="none"
          stroke="url(#ass-wave)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>

      {variant === "full" && (
        <span
          className={cn(
            "font-display text-[1.05rem] font-semibold tracking-tight leading-none",
            wordmarkClass,
          )}
        >
          Assirik<span className={wordmarkAccentClass}> Tours</span>
        </span>
      )}
    </Link>
  );
}