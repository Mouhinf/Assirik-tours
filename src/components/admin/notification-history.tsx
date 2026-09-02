type Notification = {
  id: string;
  channel: string;
  templateId: string;
  toAddress: string | null;
  toName: string | null;
  subject: string | null;
  locale: string;
  status: string;
  provider: string | null;
  providerMessageId: string | null;
  errorMessage: string | null;
  createdAt: Date;
  sentAt: Date | null;
};

export function NotificationHistory({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-sand-deep bg-sand p-10 text-center">
        <p className="text-graphite">Aucun envoi pour le moment.</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-sand-deep bg-sand">
      <table className="w-full text-left text-sm">
        <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Canal</th>
            <th className="px-4 py-3">Template</th>
            <th className="px-4 py-3 hidden md:table-cell">Destinataire</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3 hidden lg:table-cell">Provider ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-deep">
          {notifications.map((n) => (
            <tr key={n.id}>
              <td className="px-4 py-3 align-top text-xs text-graphite">
                {new Date(n.createdAt).toLocaleString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-3 align-top">
                <ChannelBadge channel={n.channel} />
              </td>
              <td className="px-4 py-3 align-top font-mono text-xs text-navy">
                {n.templateId}
              </td>
              <td className="px-4 py-3 align-top text-xs text-graphite hidden md:table-cell">
                <p>{n.toName ?? <span className="text-silver">—</span>}</p>
                <p className="font-mono">{n.toAddress ?? ""}</p>
              </td>
              <td className="px-4 py-3 align-top">
                <StatusBadge status={n.status} error={n.errorMessage} />
              </td>
              <td className="px-4 py-3 align-top text-xs font-mono text-silver hidden lg:table-cell">
                {n.providerMessageId ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChannelBadge({ channel }: { channel: string }) {
  const colors: Record<string, string> = {
    email: "bg-sky/15 text-ocean",
    webhook: "bg-violet-100 text-violet-800",
    sms: "bg-sunrise-orange/20 text-sunrise-amber",
    whatsapp: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${colors[channel] ?? "bg-sand-deep text-graphite"}`}>
      {channel}
    </span>
  );
}

function StatusBadge({ status, error }: { status: string; error: string | null }) {
  if (status === "sent") {
    return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-emerald-800">sent</span>;
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center rounded-full bg-sunrise-coral/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-sunrise-coral" title={error ?? undefined}>
        failed
      </span>
    );
  }
  return <span className="inline-flex items-center rounded-full bg-sand-deep px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-graphite">{status}</span>;
}
