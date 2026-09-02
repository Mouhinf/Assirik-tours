"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateReservationAssigneeAction,
  updateRequestStatusAction,
  type UpdateReservationState,
} from "@/lib/reservation-actions";
import type { RequestStatus } from "@prisma/client";

type Agent = { id: string; name: string; email: string; role: "SUPER_ADMIN" | "AGENT" | "COMPTABLE" };

const STATUS_LABEL: Record<RequestStatus, string> = {
  NOUVEAU: "Nouveau",
  EN_COURS: "En cours",
  TRAITE: "Traité",
};

const STATUS_COLOR: Record<RequestStatus, string> = {
  NOUVEAU: "bg-sunrise-orange/15 text-sunrise-coral",
  EN_COURS: "bg-sky/20 text-ocean",
  TRAITE: "bg-emerald-100 text-emerald-700",
};

export function ReservationRowActions({
  id,
  currentProcessingStatus,
  currentAssigneeId,
  agents,
}: {
  id: string;
  currentProcessingStatus: RequestStatus;
  currentAssigneeId: string | null;
  agents: Agent[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState(currentProcessingStatus);
  const [selectedAssignee, setSelectedAssignee] = useState(currentAssigneeId ?? "");

  function run(action: "status" | "assignee", value: string) {
    setError(null);
    const previousStatus = selectedStatus;
    const previousAssignee = selectedAssignee;
    if (action === "status") setSelectedStatus(value as RequestStatus);
    else setSelectedAssignee(value);

    const fd = new FormData();
    fd.append("id", id);
    if (action === "status") fd.append("processingStatus", value);
    else fd.append("assigneeId", value);
    startTransition(async () => {
      try {
        const res: UpdateReservationState =
          action === "status"
            ? await updateRequestStatusAction(null, fd)
            : await updateReservationAssigneeAction(null, fd);
        if (res && !res.ok) {
          if (action === "status") setSelectedStatus(previousStatus);
          else setSelectedAssignee(previousAssignee);
          setError(res.error);
          return;
        }
        router.refresh();
      } catch {
        if (action === "status") setSelectedStatus(previousStatus);
        else setSelectedAssignee(previousAssignee);
        setError("La mise à jour a échoué. Réessayez.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5 min-w-[180px]">
      <label className="block">
        <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-wider text-graphite">
          Traitement
        </span>
        <select
          aria-label="Statut de traitement"
          value={selectedStatus}
          disabled={pending}
          onChange={(e) => run("status", e.target.value)}
          className={`min-h-11 w-full rounded-md border-0 px-2 py-2 text-[0.65rem] font-semibold uppercase tracking-wider focus:ring-2 focus:ring-ocean ${STATUS_COLOR[selectedStatus]}`}
        >
          {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-wider text-graphite">
          Agent assigné
        </span>
        <select
          aria-label="Agent assigné"
          value={selectedAssignee}
          disabled={pending}
          onChange={(e) => run("assignee", e.target.value)}
          className="min-h-11 w-full rounded-md border border-sand-deep bg-sand px-2 py-2 text-xs text-navy focus:ring-2 focus:ring-ocean"
        >
          <option value="">— Non assigné —</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
              {a.role === "SUPER_ADMIN" ? " ★" : ""}
            </option>
          ))}
        </select>
      </label>
      <p
        role={error ? "alert" : "status"}
        aria-live="polite"
        className={`min-h-4 text-[0.65rem] ${error ? "text-sunrise-coral" : "text-silver"}`}
      >
        {error ?? (pending ? "Mise à jour…" : "")}
      </p>
    </div>
  );
}
