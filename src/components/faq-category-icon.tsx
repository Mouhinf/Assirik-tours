import type { FaqCategory } from "@/lib/validators/faq";

/** One quiet, consistent icon family shared by the public and admin FAQ. */
export function FaqCategoryIcon({
  category,
  size = 18,
  className,
}: {
  category: FaqCategory;
  size?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (category) {
    case "payment":
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 10h19" />
          <path d="M7 15h3" />
        </svg>
      );
    case "visa":
      return (
        <svg {...common}>
          <path d="M6 2.5h9l3 3V21.5H6z" />
          <path d="M15 2.5v4h3" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M8.5 17h7" />
        </svg>
      );
    case "flight":
      return (
        <svg {...common}>
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-4.5z" />
        </svg>
      );
    case "omra":
      return (
        <svg {...common}>
          <path d="M4 20h16" />
          <path d="M6.5 20V10h11v10" />
          <path d="M9.5 20v-4h5v4" />
          <path d="M8.5 10a3.5 3.5 0 017 0" />
          <path d="M12 4V2.5" />
        </svg>
      );
    case "services":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
          <path d="M3 12h18" />
          <path d="M10 12v2h4v-2" />
        </svg>
      );
    case "general":
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.6 9a2.5 2.5 0 014.9.7c0 1.8-2.5 2-2.5 3.8" />
          <path d="M12 17h.01" />
        </svg>
      );
  }
}
