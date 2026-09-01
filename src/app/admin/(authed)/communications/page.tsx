import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getProvidersStatus } from "@/lib/communications";
import { TEMPLATES } from "@/lib/communications/templates";
import { TestSendForm } from "@/components/admin/test-send-form";
import { CampaignList } from "@/components/admin/campaign-list";
import { NotificationHistory } from "@/components/admin/notification-history";
import { can } from "@/lib/rbac";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminCommunicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    return <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">Session expirée.</p>;
  }
  if (!can(session.role, "communications:read")) {
    return <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">Accès refusé.</p>;
  }

  const sp = await searchParams;
  const tab = sp.tab === "campaigns" ? "campaigns" : sp.tab === "history" ? "history" : "templates";

  const [campaigns, recentNotifications] = await Promise.all([
    prisma.newsletterCampaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { author: { select: { email: true } } },
    }),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const providers = getProvidersStatus();
  const canBroadcast = can(session.role, "communications:broadcast");
  const canWrite = can(session.role, "communications:write");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">Communications</h1>
        <p className="mt-1 text-graphite">
          Email transactionnel, SMS et WhatsApp — providers : Resend, Twilio, WhatsApp Cloud.
        </p>
      </header>

      <section className="grid sm:grid-cols-3 gap-3">
        <ProviderTile label="Email" provider={providers.email.provider} configured={providers.email.configured} />
        <ProviderTile label="SMS" provider={providers.sms.provider} configured={providers.sms.configured} />
        <ProviderTile label="WhatsApp" provider={providers.whatsapp.provider} configured={providers.whatsapp.configured} />
      </section>

      <nav className="flex gap-1 border-b border-sand-deep">
        <TabLink current={tab} value="templates" label="Templates" />
        <TabLink current={tab} value="campaigns" label="Campagnes newsletter" />
        <TabLink current={tab} value="history" label="Historique" />
      </nav>

      {tab === "templates" ? (
        <section className="space-y-6">
          <p className="text-sm text-graphite">
            {TEMPLATES.length} templates transactionnels (FR + EN).
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {TEMPLATES.map((t) => (
              <article key={t.id} className="rounded-xl border border-sand-deep bg-sand p-4">
                <header className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-semibold text-navy font-mono">
                      {t.id}
                    </h3>
                    <p className="mt-1 text-xs text-graphite">{t.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {t.channels.map((c) => (
                      <span key={c} className="rounded-full bg-sand-deep px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-navy">
                        {c}
                      </span>
                    ))}
                  </div>
                </header>
                {t.variables.length > 0 ? (
                  <p className="mt-3 text-[0.7rem] text-silver">
                    Variables : <span className="font-mono text-graphite">{t.variables.map((v) => `{{${v}}}`).join(" ")}</span>
                  </p>
                ) : null}
              </article>
            ))}
          </div>

          {canWrite ? <TestSendForm templates={TEMPLATES.map((t) => ({ id: t.id, channels: t.channels }))} /> : null}
        </section>
      ) : null}

      {tab === "campaigns" ? (
        <CampaignList campaigns={campaigns} canBroadcast={canBroadcast} />
      ) : null}

      {tab === "history" ? (
        <NotificationHistory notifications={recentNotifications} />
      ) : null}
    </div>
  );
}

function ProviderTile({ label, provider, configured }: { label: string; provider: string; configured: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${configured ? "bg-emerald-50 border-emerald-200" : "bg-sand border-sand-deep"}`}>
      <p className="font-display text-xs font-semibold uppercase tracking-wider text-graphite">{label}</p>
      <p className="mt-2 font-mono text-sm text-navy">{provider}</p>
      <p className={`mt-1 text-xs font-semibold ${configured ? "text-emerald-700" : "text-silver"}`}>
        {configured ? "✓ Configuré" : "⚠ Non configuré (mode noop)"}
      </p>
    </div>
  );
}

function TabLink({ current, value, label }: { current: string; value: string; label: string }) {
  const active = current === value;
  return (
    <Link
      href={`/admin/communications?tab=${value}`}
      className={`-mb-px rounded-t-lg border border-b-0 px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "border-sand-deep bg-sand text-navy" : "border-transparent text-graphite hover:text-navy"
      }`}
    >
      {label}
    </Link>
  );
}
