import type { ReservationStatus, RequestStatus } from "@prisma/client";

const RES_LABELS: Record<ReservationStatus, { label: string; tone: string }> = {
  NOUVELLE: { label: "Nouvelle", tone: "bg-sand text-graphite" },
  EN_COURS: { label: "En cours", tone: "bg-mist text-ocean" },
  CONFIRMEE: { label: "Confirmée", tone: "bg-sky/30 text-ocean" },
  PAYEE: { label: "Payée", tone: "bg-emerald-100 text-emerald-800" },
  ANNULEE: { label: "Annulée", tone: "bg-sand-deep text-graphite line-through" },
  TERMINEE: { label: "Terminée", tone: "bg-mist text-navy" },
};

const REQ_LABELS: Record<RequestStatus, { label: string; tone: string }> = {
  NOUVEAU: { label: "Nouveau", tone: "bg-sunrise-orange/15 text-sunrise-coral" },
  EN_COURS: { label: "En cours", tone: "bg-mist text-ocean" },
  TRAITE: { label: "Traité", tone: "bg-emerald-100 text-emerald-800" },
};

export function ReservationStatusLabel({ status }: { status: ReservationStatus }) {
  const v = RES_LABELS[status] ?? RES_LABELS.NOUVELLE;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${v.tone}`}>
      {v.label}
    </span>
  );
}

export function RequestStatusLabel({ status }: { status: RequestStatus }) {
  const v = REQ_LABELS[status] ?? REQ_LABELS.NOUVEAU;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${v.tone}`}>
      {v.label}
    </span>
  );
}
