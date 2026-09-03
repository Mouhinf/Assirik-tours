import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireActiveClientSession } from "@/lib/client-auth";
import { formatFCFA } from "@/lib/utils";
import { ReservationStatusLabel, RequestStatusLabel } from "@/components/admin/reservation-status-label";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
  title: "Détail de votre réservation",
  robots: { index: false, follow: false },
};

export default async function ClientReservationDetail({ params }: { params: Params }) {
  const session = await requireActiveClientSession();
  if (!session) return null;
  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      client: true,
      offer: { include: { destination: true } },
      destination: true,
    },
  });

  if (!reservation || reservation.clientAccountId !== session.sub) notFound();

  const downloadHref = `/espace-client/reservations/${reservation.id}/voucher.pdf`;

  return (
    <section className="container-narrow py-12 max-w-3xl">
      <Link
        href="/espace-client/dashboard"
        className="text-sm text-ocean hover:text-navy"
      >
        ← Mon espace
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-navy text-balance">
        Réservation {reservation.reference}
      </h1>
      <p className="mt-2 text-graphite">
        Détail de votre dossier. Pour toute question, contactez votre conseiller via WhatsApp en
        précisant la référence ci-dessus.
      </p>

      <dl className="mt-8 rounded-xl border border-sand-deep bg-sand divide-y divide-sand-deep text-sm">
        <Row label="Référence" value={reservation.reference} />
        <Row label="Statut paiement" value={<ReservationStatusLabel status={reservation.status} />} />
        <Row label="Suivi commercial" value={<RequestStatusLabel status={reservation.processingStatus} />} />
        <Row
          label="Destination"
          value={reservation.destination?.title ?? reservation.offer?.destination.title ?? "—"}
        />
        <Row
          label="Offre"
          value={reservation.offer?.title ?? (reservation.subject ?? "—")}
        />
        <Row
          label="Date de départ"
          value={
            reservation.startDate
              ? new Date(reservation.startDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "À confirmer"
          }
        />
        <Row label="Voyageurs" value={String(reservation.travelers)} />
        <Row label="Montant" value={formatFCFA(reservation.totalFCFA)} />
        <Row
          label="Créée le"
          value={new Date(reservation.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        />
      </dl>

      {reservation.notes ? (
        <section className="mt-6 rounded-xl border border-sand-deep bg-sand p-5">
          <h2 className="font-display text-base font-semibold text-navy">Notes internes</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-graphite leading-relaxed">
            {reservation.notes}
          </p>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={downloadHref}
          className="inline-flex items-center rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy"
        >
          Télécharger le voucher PDF
        </Link>
        <Link
          href="/espace-client/dashboard"
          className="inline-flex items-center rounded-full border border-navy px-5 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-sand"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wider text-graphite">{label}</dt>
      <dd className="text-right text-navy">{value}</dd>
    </div>
  );
}
