"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createCampaignAction,
  sendCampaignAction,
} from "@/lib/communications-actions";

type Campaign = {
  id: string;
  subjectFr: string;
  subjectEn: string;
  bodyFr: string;
  bodyEn: string;
  audience: string;
  status: string;
  recipients: number;
  sent: number;
  failed: number;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  author: { email: string };
};

type Props = { campaigns: Campaign[]; canBroadcast: boolean };

export function CampaignList({ campaigns, canBroadcast }: Props) {
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    subjectFr: "",
    subjectEn: "",
    bodyFr: "",
    bodyEn: "",
    audience: "all" as "all" | "vip" | "tag" | "manual",
    audienceList: "",
  });
  const router = useRouter();

  function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const list =
      form.audience === "manual"
        ? form.audienceList.split(/[\s,;]+/).filter(Boolean)
        : undefined;
    startTransition(async () => {
      const res = await createCampaignAction({
        subjectFr: form.subjectFr,
        subjectEn: form.subjectEn,
        bodyFr: form.bodyFr,
        bodyEn: form.bodyEn,
        audience: form.audience,
        audienceList: list,
      });
      if ("error" in res && typeof res.error === "string") {
        setError(res.error);
        return;
      }
      setCreating(false);
      setForm({ subjectFr: "", subjectEn: "", bodyFr: "", bodyEn: "", audience: "all", audienceList: "" });
      router.refresh();
    });
  }

  function sendCampaign(id: string) {
    if (!confirm("Envoyer la campagne à tous les destinataires ?")) return;
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const res = await sendCampaignAction(id);
      if ("error" in res) {
        setError(res.error ?? "Erreur");
      }
      setPendingId(null);
      router.refresh();
    });
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <p className="text-sm text-graphite">
          {campaigns.length} campagne{campaigns.length > 1 ? "s" : ""}.
        </p>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="inline-flex min-h-11 items-center rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy"
        >
          {creating ? "Annuler" : "+ Nouvelle campagne"}
        </button>
      </header>

      {error ? (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">{error}</p>
      ) : null}

      {creating ? (
        <form onSubmit={createCampaign} className="rounded-xl border border-sand-deep bg-sand p-5 space-y-3">
          <h3 className="font-display text-base font-semibold text-navy">Nouvelle campagne</h3>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">Sujet (FR)</span>
              <input
                type="text"
                value={form.subjectFr}
                onChange={(e) => setForm((f) => ({ ...f, subjectFr: e.target.value }))}
                required
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2 text-sm text-navy"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">Sujet (EN)</span>
              <input
                type="text"
                value={form.subjectEn}
                onChange={(e) => setForm((f) => ({ ...f, subjectEn: e.target.value }))}
                required
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2 text-sm text-navy"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">Corps (FR)</span>
            <textarea
              value={form.bodyFr}
              onChange={(e) => setForm((f) => ({ ...f, bodyFr: e.target.value }))}
              required
              rows={4}
              className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2 text-sm text-navy"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">Corps (EN)</span>
            <textarea
              value={form.bodyEn}
              onChange={(e) => setForm((f) => ({ ...f, bodyEn: e.target.value }))}
              required
              rows={4}
              className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2 text-sm text-navy"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">Audience</span>
            <select
              value={form.audience}
              onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as typeof f.audience }))}
              className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2 text-sm text-navy"
            >
              <option value="all">Tous les clients (avec email)</option>
              <option value="tag">Par tag</option>
              <option value="manual">Liste manuelle</option>
            </select>
          </label>

          {form.audience === "manual" ? (
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Emails (un par ligne, séparés par virgules ou espaces)
              </span>
              <textarea
                value={form.audienceList}
                onChange={(e) => setForm((f) => ({ ...f, audienceList: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-sand-deep bg-sand px-3 py-2 text-sm text-navy"
              />
            </label>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="inline-flex min-h-11 items-center rounded-full bg-sand-deep px-4 py-2 text-sm font-semibold text-graphite hover:text-navy"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-11 items-center rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-sand hover:bg-navy disabled:opacity-60"
            >
              {pending ? "Création…" : "Enregistrer le brouillon"}
            </button>
          </div>
        </form>
      ) : null}

      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-sand-deep bg-sand p-10 text-center">
          <p className="text-graphite">Aucune campagne pour le moment.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-sand-deep bg-sand">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="px-4 py-3">Sujet</th>
                <th className="px-4 py-3 hidden md:table-cell">Audience</th>
                <th className="px-4 py-3 hidden lg:table-cell">Auteur</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 hidden md:table-cell">Destinataires</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-navy">{c.subjectFr}</p>
                    <p className="text-xs text-silver">{c.subjectEn}</p>
                  </td>
                  <td className="px-4 py-3 align-top hidden md:table-cell text-xs text-graphite">
                    {c.audience}
                    {c.audience === "manual" && c.recipients > 0 ? ` (${c.recipients})` : null}
                  </td>
                  <td className="px-4 py-3 align-top hidden lg:table-cell text-xs text-graphite">
                    {c.author.email}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${
                        c.status === "sent"
                          ? "bg-emerald-100 text-emerald-800"
                          : c.status === "sending"
                            ? "bg-sky/15 text-ocean"
                            : "bg-sand-deep text-graphite"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top tabular-nums text-xs">
                    {c.sent + c.failed > 0 ? (
                      <>
                        <span className="text-emerald-700">{c.sent}</span> ·{" "}
                        <span className="text-sunrise-coral">{c.failed}</span>
                      </>
                    ) : (
                      <span className="text-silver">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {c.status === "draft" || c.status === "scheduled" ? (
                      canBroadcast ? (
                        <button
                          type="button"
                          onClick={() => sendCampaign(c.id)}
                          disabled={pendingId === c.id}
                          className="inline-flex min-h-11 items-center rounded-full bg-ocean px-3 py-1.5 text-xs font-semibold text-sand hover:bg-navy disabled:opacity-60"
                        >
                          {pendingId === c.id ? "Envoi…" : "Envoyer"}
                        </button>
                      ) : (
                        <span className="text-xs text-silver">Réservé SUPER_ADMIN</span>
                      )
                    ) : (
                      <span className="text-xs text-silver">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
