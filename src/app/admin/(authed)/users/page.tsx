import { prisma } from "@/lib/prisma";
import { ROLE_LABELS_FR, type AdminRole } from "@/lib/rbac";

export default async function AdminUsersPage() {
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">Utilisateurs internes</h1>
        <p className="mt-1 text-graphite">{users.length} compte{users.length > 1 ? "s" : ""}. Création via <code className="font-mono bg-sand-deep/60 px-1 py-0.5 rounded">pnpm admin:create</code>.</p>
      </header>

      <section className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Nom</th>
              <th className="text-left px-4 py-3 font-semibold">Email</th>
              <th className="text-left px-4 py-3 font-semibold">Rôle</th>
              <th className="text-left px-4 py-3 font-semibold">2FA</th>
              <th className="text-left px-4 py-3 font-semibold">Dernière connexion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-deep">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-navy">{u.name}</td>
                <td className="px-4 py-3 text-graphite">{u.email}</td>
                <td className="px-4 py-3"><RoleBadge role={u.role as AdminRole} /></td>
                <td className="px-4 py-3">{u.twoFactorEnabled ? <span className="text-emerald-700 text-xs font-semibold">Activée</span> : <span className="text-silver text-xs">Désactivée</span>}</td>
                <td className="px-4 py-3 text-graphite">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("fr-FR") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl bg-sand border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">Matrice des permissions</h2>
        <p className="mt-2 text-sm text-graphite">
          Le système RBAC attribue à chaque rôle un ensemble d&apos;actions. <strong>Super-admin</strong> dispose de toutes les permissions. <strong>Agent commercial</strong> gère les réservations, destinations et offres. <strong>Comptable</strong> a un accès en lecture sur les surfaces financières.
        </p>
        <p className="mt-3 text-xs text-graphite">
          Code source : <code className="font-mono bg-sand-deep/60 px-1 py-0.5 rounded">src/lib/rbac.ts</code>
        </p>
      </section>
    </div>
  );
}

function RoleBadge({ role }: { role: AdminRole }) {
  const colors: Record<AdminRole, string> = {
    SUPER_ADMIN: "bg-sunrise-orange/15 text-sunrise-coral",
    AGENT: "bg-ocean/15 text-ocean",
    COMPTABLE: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors[role]}`}>
      {ROLE_LABELS_FR[role]}
    </span>
  );
}
