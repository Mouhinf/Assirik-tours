import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Brand logo. Uses the high-resolution PNG from `public/icon-512.png` so the
 * mark stays pixel-perfect across all surfaces (favicon, header, footer,
 * back-office). The wordmark "Assirik Tours" is rendered as text (Sora)
 * next to the mark so the two can be themed independently.
 *
 * `tone="light"` (default) — for use on light backgrounds (sand).
 * `tone="dark"` — for use on dark backgrounds (footer navy). In dark mode
 *   the wordmark text is recolored to keep contrast.
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
      <span
        aria-hidden
        className="relative inline-block shrink-0 transition-transform group-hover:scale-[1.02]"
        style={{ width: 40, height: 40 }}
      >
        <Image
          src="/icon-512.png"
          alt=""
          fill
          sizes="40px"
          priority
          className="object-contain"
        />
      </span>

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
