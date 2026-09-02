"use client";

import { useState, useTransition } from "react";
import { formatFCFA } from "@/lib/utils";

type Reservation = {
  id: string;
  reference: string;
  source: string;
  processingStatus: string;
  status: string;
  travelers: number;
  totalFCFA: number;
  notes: string | null;
  createdAt: Date;
  client: { firstName: string; lastName: string; email: string; phone: string };
  offer: { title: string; destination: { title: string } } | null;
  destination: { title: string } | null;
  assignee: { id: string; name: string } | null;
};

type Destination = { id: string; title: string };
type Agent = { id: string; name: string };

const STATUS_LABELS: Record<string, string> = {
  NOUVELLE: "Nouvelle",
  EN_COURS: "En cours",
  CONFIRMEE: "Confirmée",
  PAYEE: "Payée",
  ANNULEE: "Annulée",
  TERMINEE: "Terminée",
};

const SOURCE_LABELS: Record<string, string> = {
  CONTACT: "Contact",
  DESTINATION: "Destination",
  OFFER: "Offre",
  FLIGHT: "Billetterie",
};

const PROCESSING_LABELS: Record<string, string> = {
  NOUVEAU: "Nouveau",
  EN_COURS: "En cours",
  TRAITE: "Traité",
};

const STATUS_COLORS: Record<string, string> = {
  NOUVELLE: "bg-sunrise-orange/15 text-sunrise-coral",
  EN_COURS: "bg-sky/20 text-ocean",
  CONFIRMEE: "bg-ocean/15 text-ocean",
  PAYEE: "bg-emerald-100 text-emerald-700",
  ANNULEE: "bg-silver/15 text-graphite",
  TERMINEE: "bg-graphite/10 text-graphite",
};

export function ReportsClient({
  initialReservations,
  destinations,
  agents,
  canExport,
}: {
  initialReservations: Reservation[];
  destinations: Destination[];
  agents: Agent[];
  canExport: boolean;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [status, setStatus] = useState("");
  const [reservations, setReservations] = useState(initialReservations);
  const [loading, startTransition] = useTransition();
  const [exportLoading, startExport] = useTransition();
  const [showTable, setShowTable] = useState(false);

  function applyFilters() {
    startTransition(async () => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (destinationId) params.set("destinationId", destinationId);
      if (agentId) params.set("agentId", agentId);
      if (status) params.set("status", status);

      const res = await fetch(`/admin/rapports/api?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations);
        setShowTable(true);
      }
    });
  }

  function handleExport() {
    startExport(async () => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (destinationId) params.set("destinationId", destinationId);
      if (agentId) params.set("agentId", agentId);
      if (status) params.set("status", status);

      const res = await fetch(`/admin/rapports/export?${params.toString()}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rapport-assirik-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  const totalRevenue = reservations
    .filter((r) => r.status === "PAYEE")
    .reduce((s, r) => s + r.totalFCFA, 0);

  const totalCount = reservations.length;
  const confirmedCount = reservations.filter(
    (r) => r.status === "PAYEE" || r.status === "CONFIRMEE" || r.status === "TERMINEE",
  ).length;
  const conversionRate = totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">Rapports</h1>
        <p className="mt-1 text-graphite">
          Filtrez et exportez les données de réservations.
        </p>
      </header>

      {/* Filters */}
      <div className="rounded-xl bg-sand border border-sand-deep p-5">
        <h2 className="font-display text-sm font-semibold text-navy uppercase tracking-wider mb-4">
          Filtres
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">Du</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">Au</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">Destination</span>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="w-full min-h-10 rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
            >
              <option value="">Toutes</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">Agent</span>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full min-h-10 rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
            >
              <option value="">Tous</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">Statut paiement</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full min-h-10 rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
            >
              <option value="">Tous</option>
              <option value="NOUVELLE">Nouvelle</option>
              <option value="EN_COURS">En cours</option>
              <option value="CONFIRMEE">Confirmée</option>
              <option value="PAYEE">Payée</option>
              <option value="ANNULEE">Annulée</option>
              <option value="TERMINEE">Terminée</option>
            </select>
          </label>
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              disabled={loading}
              className="flex-1 min-h-10 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-50"
            >
              {loading ? "Chargement…" : "Filtrer"}
            </button>
            {canExport && (
              <button
                onClick={handleExport}
                disabled={exportLoading || reservations.length === 0}
                className="min-h-10 min-w-10 rounded-md border border-ocean px-3 py-2 text-sm font-semibold text-ocean hover:bg-ocean/10 transition-colors disabled:opacity-50"
                title="Exporter en CSV"
              >
                {exportLoading ? (
                  <span className="animate-spin">↻</span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Réservations" value={String(totalCount)} />
        <Kpi label="CA encaissé (payée)" value={formatFCFA(totalRevenue)} accent="sunrise" />
        <Kpi label="Taux de conversion" value={`${conversionRate}%`} accent="ocean" />
        <Kpi
          label="Affichées"
          value={String(reservations.length)}
          sub={!showTable ? "(filtrez pour affiner)" : undefined}
        />
      </div>

      {/* Table */}
      {showTable && (
        <section className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Référence</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-left px-4 py-3 font-semibold">Client</th>
                  <th className="text-left px-4 py-3 font-semibold">Source</th>
                  <th className="text-left px-4 py-3 font-semibold">Traitement</th>
                  <th className="text-left px-4 py-3 font-semibold">Paiement</th>
                  <th className="text-left px-4 py-3 font-semibold">Destination</th>
                  <th className="text-left px-4 py-3 font-semibold">Agent</th>
                  <th className="text-right px-4 py-3 font-semibold">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-deep">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-sand-deep/20">
                    <td className="px-4 py-3 font-mono text-xs text-navy">{r.reference}</td>
                    <td className="px-4 py-3 text-xs text-graphite whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy text-xs">
                        {r.client.firstName} {r.client.lastName}
                      </p>
                      <p className="text-[0.65rem] text-silver">{r.client.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {SOURCE_LABELS[r.source] ?? r.source}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${
                        r.processingStatus === "NOUVEAU"
                          ? "bg-sunrise-orange/15 text-sunrise-coral"
                          : r.processingStatus === "EN_COURS"
                            ? "bg-sky/20 text-ocean"
                            : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {PROCESSING_LABELS[r.processingStatus] ?? r.processingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${STATUS_COLORS[r.status] ?? ""}`}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-graphite">
                      {r.destination?.title ?? r.offer?.destination?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-graphite">
                      {r.assignee?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ocean">
                      {formatFCFA(r.totalFCFA)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reservations.length === 0 && (
            <p className="p-8 text-center text-sm text-graphite">
              Aucune réservation pour ces filtres.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: string;
  accent?: "ocean" | "sunrise";
  sub?: string;
}) {
  const color = accent === "sunrise" ? "text-sunrise-coral" : accent === "ocean" ? "text-ocean" : "text-navy";
  return (
    <div className="rounded-xl bg-sand border border-sand-deep p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-graphite">{label}</p>
      <p className={`mt-3 font-display text-2xl font-semibold ${color}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-silver">{sub}</p>}
    </div>
  );
}
