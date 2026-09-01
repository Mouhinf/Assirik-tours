import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export default async function AdminFlightSearchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "flight:read")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const search = await prisma.flightSearch.findUnique({
    where: { id },
    include: { offers: { orderBy: { priceAmount: "asc" } } },
  });
  if (!search) notFound();

  const oOut = (o: unknown) =>
    o as unknown as {
      totalDurationMinutes: number;
      stopCount: number;
      segments: Array<{
        carrier: string;
        carrierName?: string;
        departAt: string;
        arriveAt: string;
        origin: string;
        destination: string;
      }>;
    };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p>
          <Link href="/admin/billetterie" className="text-sm font-semibold text-ocean hover:text-navy">
            ← Toutes les recherches
          </Link>
        </p>
        <h1 className="font-display text-3xl font-semibold text-navy">
          {search.origin} → {search.destination}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-graphite">
          <span>{search.passengers} passager(s)</span>
          <span>· {search.cabinClass}</span>
          <span>· provider <code className="font-mono text-xs">{search.provider}</code></span>
          <span>· {new Date(search.createdAt).toLocaleString("fr-FR")}</span>
        </div>
      </header>

      {/* Contact card */}
      {search.quoteName ? (
        <section className="rounded-xl border border-sand-deep bg-sand p-5 space-y-2">
          <h2 className="font-display text-base font-semibold text-navy">Demande de devis reçue</h2>
          <p className="text-sm">
            <strong>{search.quoteName}</strong>
            {search.quotePhone ? ` · ${search.quotePhone}` : ""}
            {search.userEmail ? ` · ${search.userEmail}` : ""}
          </p>
          {search.quoteMessage ? (
            <p className="rounded-lg bg-sand-deep/30 p-3 text-sm text-graphite">
              « {search.quoteMessage} »
            </p>
          ) : null}
          <p className="text-xs text-silver">
            Cette demande a été enregistrée dans l&apos;audit log (action <code>flight.quote.request</code>).
            Contactez le client sous 24h ouvrées.
          </p>
        </section>
      ) : null}

      {/* Offers */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-navy">
          {search.offers.length} offre(s) retournée(s)
        </h2>
        <ol className="space-y-3">
          {search.offers.map((o) => {
            const out = oOut(o.outbound);
            const firstSeg = out.segments[0];
            const lastSeg = out.segments[out.segments.length - 1];
            return (
              <li key={o.id} className="rounded-xl border border-sand-deep bg-sand p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy">
                      {firstSeg?.carrierName ?? firstSeg?.carrier}{" "}
                      <span className="font-mono text-xs text-graphite">
                        ({firstSeg?.carrier})
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-graphite">
                      <span className="font-mono font-semibold text-navy">{firstSeg?.origin}</span>{" "}
                      {new Date(firstSeg?.departAt).toLocaleString("fr-FR")} →{" "}
                      <span className="font-mono font-semibold text-navy">{lastSeg?.destination}</span>{" "}
                      {new Date(lastSeg?.arriveAt).toLocaleString("fr-FR")}
                    </p>
                    <p className="mt-1 text-xs text-graphite">
                      {Math.floor(out.totalDurationMinutes / 60)}h{String(out.totalDurationMinutes % 60).padStart(2, "0")} ·{" "}
                      {out.stopCount === 0 ? "Direct" : `${out.stopCount} escale(s)`}
                    </p>
                    {o.bookingUrl ? (
                      <p className="mt-2">
                        <a
                          href={o.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-ocean hover:text-navy break-all"
                        >
                          Lien provider ↗
                        </a>
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-semibold text-navy">
                      {new Intl.NumberFormat("fr-FR").format(Number(o.priceAmount))} {o.priceCurrency}
                    </p>
                    <p className="mt-1 text-xs text-silver">
                      Expire le {new Date(o.expiresAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
