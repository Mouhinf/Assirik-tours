import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getClientSession } from "@/lib/client-auth";
import { formatFCFA } from "@/lib/utils";
import { ClientHeader } from "@/components/client/header";

const RES_STATUS_LABELS: Record<string, string> = {
  NOUVELLE: "Nouvelle",
  EN_COURS: "En cours",
  CONFIRMEE: "Confirmée",
  PAYEE: "Payée",
  ANNULEE: "Annulée",
  TERMINEE: "Terminée",
};
const RES_STATUS_COLORS: Record<string, string> = {
  NOUVELLE: "bg-sunrise-orange/15 text-sunrise-coral",
  EN_COURS: "bg-sky/20 text-ocean",
  CONFIRMEE: "bg-ocean/15 text-ocean",
  PAYEE: "bg-emerald-100 text-emerald-700",
  ANNULEE: "bg-silver/15 text-graphite",
  TERMINEE: "bg-graphite/10 text-graphite",
};
const VISA_STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  DOCUMENTS_MANQUANTS: "Documents manquants",
  EN_TRAITEMENT: "En traitement",
  ACCEPTE: "Accepté",
  REFUSE: "Refusé",
};

export default async function ClientDashboardPage() {
  const session = await getClientSession();
  if (!session) redirect("/espace-client");

  const account = await prisma.clientAccount.findUnique({
    where: { id: session.sub },
    include: {
      reservations: { include: { offer: { include: { destination: true } } }, orderBy: { createdAt: "desc" } },
      visaDossiers: { orderBy: { updatedAt: "desc" } },
    },
  });

  return (
    <>
      <ClientHeader
        firstName={session.firstName}
        email={session.email}
      />

      <section className="container-narrow py-12 space-y-10">
        <header>
          <h1 className="font-display text-3xl font-semibold text-navy">Bonjour {session.firstName}</h1>
          <p className="mt-1 text-graphite">
            Voici vos réservations et vos dossiers visa en cours.
          </p>
        </header>

        <section>
          <h2 className="font-display text-2xl font-semibold text-navy mb-4">Vos réservations</h2>
          {account?.reservations.length === 0 ? (
            <p className="rounded-xl border border-sand-deep bg-sand p-6 text-sm text-graphite">
              Aucune réservation active.
            </p>
          ) : (
            <ul className="space-y-3">
              {account?.reservations.map((r) => (
                <li key={r.id} className="rounded-xl border border-sand-deep bg-sand p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-graphite">{r.reference}</p>
                      <p className="mt-1 font-display text-lg font-semibold text-navy">{r.offer?.title ?? "Demande sur mesure"}</p>
                      <p className="text-sm text-graphite">{r.offer?.destination.title ?? "—"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-lg font-semibold text-ocean">{formatFCFA(r.totalFCFA)}</p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${RES_STATUS_COLORS[r.status] ?? ""}`}>
                        {RES_STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <a
                      href={`/espace-client/reservations/${r.id}/voucher.pdf`}
                      className="inline-flex items-center rounded-full border border-sand-deep px-3 py-1 font-semibold text-navy hover:border-ocean hover:text-ocean transition-colors"
                    >
                      Télécharger le voucher
                    </a>
                    <Link
                      href="/contact"
                      className="inline-flex items-center rounded-full border border-sand-deep px-3 py-1 font-semibold text-graphite hover:text-navy transition-colors"
                    >
                      Contacter un conseiller
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-navy mb-4">Vos dossiers visa</h2>
          {account?.visaDossiers.length === 0 ? (
            <p className="rounded-xl border border-sand-deep bg-sand p-6 text-sm text-graphite">
              Aucun dossier visa actif.
            </p>
          ) : (
            <ul className="space-y-3">
              {account?.visaDossiers.map((d) => {
                const docs = Array.isArray(d.documents) ? (d.documents as Array<Record<string, string>>) : [];
                const total = docs.length;
                const uploaded = docs.filter((doc) => doc.status === "uploaded").length;
                return (
                  <li key={d.id} className="rounded-xl border border-sand-deep bg-sand p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-graphite">{d.reference}</p>
                        <p className="mt-1 font-display text-lg font-semibold text-navy">{d.destination}{d.visaType ? ` · ${d.visaType}` : ""}</p>
                        <p className="text-sm text-graphite">{uploaded}/{total} pièces transmises</p>
                      </div>
                      <span className="rounded-full bg-ocean/10 text-ocean px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider">
                        {VISA_STATUS_LABELS[d.status] ?? d.status}
                      </span>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/espace-client/visa/${d.id}`}
                        className="inline-flex items-center rounded-full bg-ocean px-4 py-2 text-xs font-semibold text-sand hover:bg-navy transition-colors"
                      >
                        Voir le dossier & uploader mes pièces →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </section>
    </>
  );
}
