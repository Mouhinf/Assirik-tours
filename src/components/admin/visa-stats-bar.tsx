export function VisaStatsBar({
  total,
  counts,
}: {
  total: number;
  counts: Record<string, number>;
}) {
  const inFlight = (counts["EN_TRAITEMENT"] ?? 0) + (counts["DOCUMENTS_MANQUANTS"] ?? 0);
  const accepted = counts["ACCEPTE"] ?? 0;
  const refused = counts["REFUSE"] ?? 0;
  const overdue = counts["EN_TRAITEMENT"] ?? 0; // also used by overdue alert below

  // Build alerts: "documents manquants > 5" or "refus > 0"
  const alerts: { tone: "warn" | "danger"; label: string }[] = [];
  if ((counts["DOCUMENTS_MANQUANTS"] ?? 0) >= 3) {
    alerts.push({
      tone: "warn",
      label: `${counts["DOCUMENTS_MANQUANTS"]} dossier(s) en attente de pièces`,
    });
  }
  if ((counts["REFUSE"] ?? 0) > 0) {
    alerts.push({
      tone: "danger",
      label: `${counts["REFUSE"]} refus récent(s) — vérifier appel/conseiller`,
    });
  }

  return (
    <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Dossiers actifs" value={total} sub={`${inFlight} en cours`} />
      <StatCard label="Documents manquants" value={counts["DOCUMENTS_MANQUANTS"] ?? 0} sub="à relancer client" tone="warn" />
      <StatCard label="Acceptés" value={accepted} sub={`${refused} refus`} tone="positive" />
      <StatCard
        label="En traitement"
        value={overdue}
        sub="au consulat / centre VFS"
        tone="info"
      />
      {alerts.length > 0 ? (
        <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-2">
          {alerts.map((a) => (
            <span
              key={a.label}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                a.tone === "danger"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-sunrise-orange/15 text-sunrise-coral"
              }`}
            >
              <span aria-hidden>{a.tone === "danger" ? "⚠" : "⏰"}</span>
              {a.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: number;
  sub: string;
  tone?: "neutral" | "warn" | "info" | "positive";
}) {
  const toneCls: Record<string, string> = {
    neutral: "border-sand-deep bg-sand",
    warn: "border-sunrise-orange/30 bg-sunrise-orange/5",
    info: "border-ocean/30 bg-ocean/5",
    positive: "border-emerald-200 bg-emerald-50",
  };
  return (
    <div className={`rounded-xl border p-4 ${toneCls[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-graphite">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold text-navy tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-silver">{sub}</p>
    </div>
  );
}
