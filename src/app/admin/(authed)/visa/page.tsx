import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VisaStatusForm } from "@/components/admin/visa-status-form";
import { VisaCreateCard } from "@/components/admin/visa-create-card";

const STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  DOCUMENTS_MANQUANTS: "Documents manquants",
  EN_TRAITEMENT: "En traitement",
  ACCEPTE: "Accepté",
  REFUSE: "Refusé",
};
const STATUS_COLORS: Record<string, string> = {
  BROUILLON: "bg-silver/15 text-graphite",
  DOCUMENTS_MANQUANTS: "bg-sunrise-orange/15 text-sunrise-coral",
  EN_TRAITEMENT: "bg-sky/20 text-ocean",
  ACCEPTE: "bg-emerald-100 text-emerald-700",
  REFUSE: "bg-rose-100 text-rose-700",
};

export default async function AdminVisaPage() {
  const dossiers = await prisma.visaDossier.findMany({
    orderBy: { updatedAt: "desc" },
  });
  const clientIds = Array.from(new Set(dossiers.map((d) => d.clientId)));
  const clients = await prisma.client.findMany({ where: { id: { in: clientIds } } });
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const counts = dossiers.reduce<Record<string, number>>((acc, d) => {
    acc[d.status] = (acc[d.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">Dossiers visa</h1>
          <p className="mt-1 text-graphite">Suivi des formalités visa — pièces requises, RDV consulat, statut.</p>
        </div>
        <div className="flex gap-2 text-xs">
          {Object.entries(counts).map(([k, v]) => (
            <span key={k} className={`rounded-full px-2 py-0.5 ${STATUS_COLORS[k] ?? ""}`}>
              {STATUS_LABELS[k] ?? k}: {v}
            </span>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        <VisaCreateCard />

        <section className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
          {dossiers.length === 0 ? (
            <p className="p-8 text-center text-sm text-graphite">
              Aucun dossier visa pour l&apos;instant.
            </p>
          ) : (
            <ul className="divide-y divide-sand-deep">
              {dossiers.map((d) => {
                const docs = Array.isArray(d.documents) ? (d.documents as Array<Record<string, string>>) : [];
                const uploaded = docs.filter((doc) => doc.status === "uploaded").length;
                return (
                  <li key={d.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy">
                          {d.reference} · {d.destination}
                          {d.visaType ? <span className="ml-2 text-xs text-graphite">{d.visaType}</span> : null}
                        </p>
                        <p className="text-xs text-graphite truncate">
                          {(clientMap.get(d.clientId)?.firstName ?? '')} {(clientMap.get(d.clientId)?.lastName ?? '')} · {(clientMap.get(d.clientId)?.email ?? '')}
                          {(clientMap.get(d.clientId)?.phone ?? '') ? ` · ${(clientMap.get(d.clientId)?.phone ?? '')}` : ""}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[d.status] ?? ""}`}>
                        {STATUS_LABELS[d.status] ?? d.status}
                      </span>
                    </div>

                    {docs.length > 0 ? (
                      <div className="text-xs">
                        <p className="text-graphite">
                          Pièces : <span className="font-semibold text-navy">{uploaded}/{docs.length}</span> transmises
                        </p>
                        <ul className="mt-2 space-y-1">
                          {docs.map((doc, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span aria-hidden className={doc.status === "uploaded" ? "text-emerald-600" : "text-sunrise-coral"}>
                                {doc.status === "uploaded" ? "✓" : "○"}
                              </span>
                              <span className="text-graphite">{doc.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <VisaStatusForm id={d.id} current={d.status} />

                    {d.deadline ? (
                      <p className="text-xs text-graphite">
                        Échéance consulat : <span className="font-semibold text-navy">{new Date(d.deadline).toLocaleDateString("fr-FR")}</span>
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
