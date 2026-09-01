"use client";

import { useMemo, useState, useTransition } from "react";
import { testSendAction } from "@/lib/communications-actions";
import type { Channel } from "@/lib/communications";

type Props = {
  templates: Array<{ id: string; channels: Channel[] }>;
};

const CHANNEL_LABELS: Record<Channel, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

export function TestSendForm({ templates }: Props) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const availableChannels = useMemo(
    () => templates.find((t) => t.id === templateId)?.channels ?? [],
    [templateId, templates],
  );
  const [channel, setChannel] = useState<Channel>(availableChannels[0] ?? "email");
  const [to, setTo] = useState("");
  const [varsText, setVarsText] = useState("{}");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onTemplateChange(id: string) {
    setTemplateId(id);
    const chans = templates.find((t) => t.id === id)?.channels ?? [];
    if (!chans.includes(channel)) setChannel(chans[0] ?? "email");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    let parsedVars: Record<string, string> = {};
    try {
      parsedVars = JSON.parse(varsText);
    } catch {
      setError("Variables : JSON invalide.");
      return;
    }
    startTransition(async () => {
      const res = await testSendAction({
        templateId,
        channel,
        to,
        locale: "fr",
        vars: parsedVars,
      });
      if (res.ok) {
        setResult(`Envoyé via ${res.provider} (id: ${res.providerMessageId ?? "—"}).`);
      } else {
        setError(res.error ?? "Erreur inconnue");
      }
    });
  }

  const channelValid = availableChannels.includes(channel);

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-sand-deep bg-sand p-5 space-y-4"
    >
      <h2 className="font-display text-base font-semibold text-navy">Tester un envoi</h2>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">Template</span>
          <select
            value={templateId}
            onChange={(e) => onTemplateChange(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2 text-sm text-navy"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.id}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">Canal</span>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
            disabled={!channelValid}
            className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2 text-sm text-navy disabled:opacity-50"
          >
            {availableChannels.map((c) => (
              <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
            {channel === "email" ? "Email destinataire" : "Téléphone (E.164)"}
          </span>
          <input
            type={channel === "email" ? "email" : "tel"}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
            placeholder={channel === "email" ? "vous@exemple.com" : "+221775495314"}
            className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2 text-sm text-navy"
          />
        </label>
      </div>

      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
          Variables (JSON)
        </span>
        <textarea
          value={varsText}
          onChange={(e) => setVarsText(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2 font-mono text-xs text-navy"
        />
      </label>

      {error ? (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">{error}</p>
      ) : null}
      {result ? (
        <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">{result}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !channelValid}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-sand hover:bg-navy disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Tester l'envoi"}
      </button>
    </form>
  );
}
