import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Inline SVG logo — derived from the brief description (rising sun, skyline, wave).
 * Renders crisply at any size, no extra HTTP request, no FOUT.
 */
export function BrandLogo({
  className,
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "mark";
}) {
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
            <stop offset="0%" stopColor="#FFCE54" />
            <stop offset="100%" stopColor="#F5A73B" />
          </linearGradient>
          <linearGradient id="ass-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1D6FB8" />
            <stop offset="100%" stopColor="#4FA8DA" />
          </linearGradient>
        </defs>
        {/* Rising sun */}
        <circle cx="20" cy="18" r="7" fill="url(#ass-sun)" />
        {/* Skyline — stepped buildings (left to right) */}
        <rect x="6" y="22" width="4" height="9" fill="#1D6FB8" />
        <rect x="11" y="19" width="4" height="12" fill="#12406B" />
        <rect x="16" y="16" width="4" height="15" fill="#1D6FB8" />
        <rect x="21" y="20" width="4" height="11" fill="#12406B" />
        <rect x="26" y="23" width="4" height="8" fill="#1D6FB8" />
        <rect x="31" y="25" width="3" height="6" fill="#12406B" />
        {/* Wave */}
        <path
          d="M2 34 Q 10 30, 20 34 T 38 34"
          fill="none"
          stroke="url(#ass-wave)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>

      {variant === "full" && (
        <span className="font-display text-[1.05rem] font-semibold tracking-tight text-navy leading-none">
          Assirik<span className="text-ocean"> Tours</span>
        </span>
      )}
    </Link>
  );
}