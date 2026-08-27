import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { TwoFactorCard } from "@/components/admin/two-factor-card";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { ROLE_LABELS_FR, type AdminRole } from "@/lib/rbac";
import { getSiteSettings } from "@/lib/site-settings";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const adminUser = await prisma.adminUser.findUnique({
    where: { id: session.sub },
    
  });
  const userCount = await prisma.adminUser.count();
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">Paramètres</h1>
        <p className="mt-1 text-graphite">Votre compte et les informations de l&apos;agence.</p>
      </header>

      {/* Compte */}
      <section className="rounded-xl bg-sand border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">Mon compte</h2>
        <dl className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
          <Row label="Email" value={session.email} />
          <Row label="Rôle" value={ROLE_LABELS_FR[session.role as AdminRole] ?? session.role} />
          <Row label="2FA" value={adminUser?.twoFactorEnabled ? "Activée" : "Désactivée"} />
          <Row label="Dernière connexion" value={adminUser?.lastLoginAt ? new Date(adminUser.lastLoginAt).toLocaleString("fr-FR") : "—"} />
        </dl>
        <div className="mt-6">
          <TwoFactorCard enabled={!!adminUser?.twoFactorEnabled} />
        </div>
      </section>

      {/* Agence — éditable */}
      <section className="rounded-xl bg-sand border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">Identité agence</h2>
        <p className="mt-2 text-sm text-graphite">
          Ces informations sont affichées sur le site public (footer, contact, WhatsApp).
        </p>
        <div className="mt-4">
          <SiteSettingsForm initial={settings} />
        </div>
      </section>

      {/* Statique fallback (variables code-only) */}
      <section className="rounded-xl bg-sand border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">Constantes techniques</h2>
        <p className="mt-2 text-sm text-graphite">
          Certaines constantes restent dans <code className="font-mono bg-sand-deep/60 px-1 py-0.5 rounded">src/lib/site-config.ts</code> (nom, slug, navigation, taxonomy).
        </p>
        <dl className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
          <Row label="Nom" value={siteConfig.name} />
          <Row label="URL canonique" value={siteConfig.url} />
        </dl>
      </section>

      {/* Utilisateurs */}
      <section className="rounded-xl bg-sand border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">Utilisateurs internes</h2>
        <p className="mt-2 text-sm text-graphite">
          {userCount} compte{userCount > 1 ? "s" : ""} actif{userCount > 1 ? "s" : ""}.
        </p>
        <p className="mt-2 text-sm text-graphite">
          Création via <code className="font-mono bg-sand-deep/60 px-1 py-0.5 rounded">pnpm admin:create</code> ou via la page <a href="/admin/users" className="text-ocean hover:underline">Utilisateurs</a>.
        </p>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-graphite">{label}</dt>
      <dd className="mt-1 text-navy font-medium">{value}</dd>
    </div>
  );
}
