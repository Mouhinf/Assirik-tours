import Link from "next/link";

/**
 * Tiny URL-builder preserved across pages so pagination is consistent.
 * Server-only — emits <Link> tags, no client JS needed.
 */
export function buildHref(base: string, params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const q = sp.toString();
  return q ? `${base}?${q}` : base;
}

/**
 * Pure-server pagination control. Renders at most 5 numeric links plus
 * "previous" / "next" anchors. Accessible labels in French (page locale).
 */
export function LinkPagination({
  basePath,
  page,
  totalPages,
  extraParams = {},
}: {
  basePath: string;
  page: number;
  totalPages: number;
  extraParams?: Record<string, string | number | undefined>;
}) {
  if (totalPages <= 1) return null;

  const prev = buildHref(basePath, { ...extraParams, page: Math.max(1, page - 1) });
  const next = buildHref(basePath, { ...extraParams, page: Math.min(totalPages, page + 1) });

  // Build a small window of page numbers around the current page.
  const span = 2;
  const start = Math.max(1, page - span);
  const end = Math.min(totalPages, page + span);
  const numbers: number[] = [];
  for (let i = start; i <= end; i++) numbers.push(i);

  function cell(p: number, label: React.ReactNode, opts?: { current?: boolean }) {
    const href = buildHref(basePath, { ...extraParams, page: p });
    return (
      <Link
        key={`${p}-${label}`}
        href={href}
        aria-current={opts?.current ? "page" : undefined}
        className={
          "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-semibold transition-colors " +
          (opts?.current
            ? "bg-ocean text-sand"
            : "border border-sand-deep bg-sand text-graphite hover:text-navy")
        }
      >
        {label}
      </Link>
    );
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={prev}
          className="inline-flex h-9 items-center justify-center rounded-md border border-sand-deep bg-sand px-3 text-sm font-semibold text-graphite hover:text-navy"
        >
          ← Précédent
        </Link>
      ) : null}

      {start > 1
        ? [
            cell(1, "1"),
            <span key="gap-start" className="px-1 text-graphite" aria-hidden>
              …
            </span>,
          ]
        : null}

      {numbers.map((p) => cell(p, p, { current: p === page }))}

      {end < totalPages
        ? [
            <span key="gap-end" className="px-1 text-graphite" aria-hidden>
              …
            </span>,
            cell(totalPages, totalPages),
          ]
        : null}

      {page < totalPages ? (
        <Link
          href={next}
          className="inline-flex h-9 items-center justify-center rounded-md border border-sand-deep bg-sand px-3 text-sm font-semibold text-graphite hover:text-navy"
        >
          Suivant →
        </Link>
      ) : null}
    </nav>
  );
}
