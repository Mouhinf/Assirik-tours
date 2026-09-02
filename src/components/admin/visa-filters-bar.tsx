import Link from "next/link";

export function VisaFiltersBar({
  activeStatus,
  search,
  statusOrder,
  statusLabels,
  statusColors,
  counts,
}: {
  activeStatus: string | null;
  search: string;
  statusOrder: string[];
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
  counts: Record<string, number>;
}) {
  // Build href preserving the search filter
  function hrefFor(status: string | null): string {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    const qs = params.toString();
    return qs ? `/admin/visa?${qs}` : "/admin/visa";
  }

  return (
    <section className="rounded-xl border border-sand-deep bg-sand p-4 space-y-3">
      <form method="get" action="/admin/visa" className="flex flex-wrap items-center gap-2">
        {activeStatus ? <input type="hidden" name="status" value={activeStatus} /> : null}
        <label className="flex-1 min-w-[220px]">
          <span className="sr-only">Rechercher un client</span>
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Rechercher (nom, email, référence, destination)…"
            className="w-full rounded-lg border border-sand-deep bg-sand-deep/30 px-3 py-2 text-sm text-navy placeholder:text-silver focus:border-ocean focus:bg-sand outline-none transition-colors"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-ocean px-4 py-2 text-xs font-semibold text-sand hover:bg-navy transition-colors"
        >
          Filtrer
        </button>
        {search || activeStatus ? (
          <Link
            href="/admin/visa"
            className="rounded-lg border border-sand-deep px-3 py-2 text-xs font-semibold text-graphite hover:text-navy transition-colors"
          >
            Réinitialiser
          </Link>
        ) : null}
      </form>

      <nav aria-label="Filtrer par statut" className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-silver">
          Statut
        </span>
        <Link
          href={hrefFor(null)}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeStatus === null
              ? "bg-navy text-sand"
              : "bg-sand-deep text-navy hover:bg-ocean hover:text-sand"
          }`}
        >
          Tous
        </Link>
        {statusOrder.map((s) => (
          <Link
            key={s}
            href={hrefFor(s)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeStatus === s
                ? "bg-navy text-sand"
                : `${statusColors[s] ?? "bg-sand-deep text-graphite"} hover:opacity-80`
            }`}
          >
            {statusLabels[s] ?? s}
            <span className="text-[0.6rem] opacity-70">({counts[s] ?? 0})</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
