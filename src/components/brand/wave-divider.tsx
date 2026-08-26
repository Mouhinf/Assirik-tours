/**
 * Reusable horizontal wave divider — visual signature from the logo.
 * Use between sections to echo the brand motif without clipart vibes.
 */
export function WaveDivider({
  flip = false,
  fillClassName = "text-sand-deep",
  className,
}: {
  flip?: boolean;
  fillClassName?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden
      className={`block w-full h-12 md:h-16 ${className ?? ""}`}
      style={{ transform: flip ? "scaleY(-1)" : undefined }}
    >
      <path
        d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
        fill="currentColor"
        className={fillClassName}
      />
    </svg>
  );
}