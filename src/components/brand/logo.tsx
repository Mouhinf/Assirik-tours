import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Brand logo. Uses the high-resolution PNG from `public/logo-mark.png` so
 * the mark stays pixel-perfect across all surfaces (favicon, header,
 * footer, back-office). The wordmark "Assirik Tours" is rendered as text
 * (Sora) next to the mark so the two can be themed independently.
 *
 * The mark is framed in a sand-coloured rounded square so it stays legible
 * against the sand header background. The frame disappears when the logo
 * sits on a transparent / dark surface (footer, admin sidebar): pass
 * `withFrame={false}` for those surfaces.
 *
 * `tone="light"` (default) — for use on light backgrounds (sand header).
 * `tone="dark"` — for use on dark backgrounds (navy footer, admin sidebar).
 */
export function BrandLogo({
  className,
  variant = "full",
  tone = "light",
  withFrame = true,
}: {
  className?: string;
  variant?: "full" | "mark";
  tone?: "light" | "dark";
  withFrame?: boolean;
}) {
  const isDark = tone === "dark";
  const wordmarkClass = isDark ? "text-sand" : "text-navy";
  const wordmarkAccentClass = isDark ? "text-sunrise-yellow" : "text-ocean";
  const frameClass = withFrame
    ? "rounded-md bg-sand-deep ring-1 ring-sand-deep/70 shadow-sm"
    : "bg-transparent";

  const MARK_SIZE = 40;

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2 focus-visible:ring-offset-sand rounded-md",
        className,
      )}
      aria-label={`${siteConfig.name} — accueil`}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex shrink-0 items-center justify-center transition-transform group-hover:scale-[1.03]",
          frameClass,
        )}
        style={{ width: MARK_SIZE, height: MARK_SIZE }}
      >
        <Image
          src="/logo-mark.png"
          alt=""
          width={MARK_SIZE - 6}
          height={MARK_SIZE - 6}
          sizes="40px"
          priority
          className="block"
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
