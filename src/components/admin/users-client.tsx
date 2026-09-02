"use client";

import { useState } from "react";
import { UserFormDialog, DeleteUserButton } from "@/components/admin/user-form";
import type { AdminRole } from "@/lib/rbac";

type User = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  twoFactorEnabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

const ROLE_LABELS_FR: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super-admin",
  AGENT: "Agent commercial",
  COMPTABLE: "Comptable",
};

const PERMISSIONS: { permission: string; label: string }[] = [
  { permission: "destinations:write", label: "Destinations (écriture)" },
  { permission: "offers:write", label: "Offres (écriture)" },
  { permission: "reservations:write", label: "Réservations (écriture)" },
  { permission: "clients:write", label: "Clients (écriture)" },
  { permission: "clients:export", label: "Export clients" },
  { permission: "visa:write", label: "Visa (écriture)" },
  { permission: "payments:read", label: "Paiements (lecture)" },
  { permission: "media:write", label: "Médias (écriture)" },
  { permission: "users:write", label: "Utilisateurs (admin)" },
  { permission: "audit:read", label: "Journal d'audit" },
  { permission: "blog:publish", label: "Blog (publication)" },
  { permission: "settings:write", label: "Paramètres (écriture)" },
];

const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: PERMISSIONS.map((p) => p.permission),
  AGENT: [
    "destinations:write", "offers:write", "reservations:write",
    "clients:write", "visa:write", "media:write", "blog:publish",
  ],
  COMPTABLE: [
    "clients:read", "clients:export", "payments:read",
    "reservations:read", "audit:read",
  ],
};

export function AdminUsersClient({
  users,
  currentUserId,
  canManage,
}: {
  users: User[];
  currentUserId: string;
  canManage: boolean;
}) {
  const [dialogUser, setDialogUser] = useState<User | undefined>(undefined);

  function openCreate() {
    setDialogUser({} as User);
  }

  function openEdit(user: User) {
    setDialogUser(user);
  }

  function closeDialog() {
    setDialogUser(undefined);
  }

  return (
    <>
      <div className="space-y-6">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-navy">
              Utilisateurs internes
            </h1>
            <p className="mt-1 text-graphite">
              {users.length} compte{users.length > 1 ? "s" : ""}.{" "}
              {canManage ? "Gérez les accès de l&apos;équipe." : "Vue lecture seule."}
            </p>
          </div>
          {canManage && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-full bg-ocean px-4 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Nouvel utilisateur
            </button>
          )}
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
                {canManage && <th className="text-right px-4 py-3 font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-sand-deep/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-ocean/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-ocean">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-navy">
                          {u.name}
                          {u.id === currentUserId && (
                            <span className="ml-2 text-[0.65rem] text-silver">(vous)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-graphite">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3">
                    {u.twoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        Activée
                      </span>
                    ) : (
                      <span className="text-silver text-xs">Désactivée</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-graphite text-xs">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString("fr-FR")
                      : "—"}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          onClick={() => openEdit(u)}
                          className="text-xs text-ocean hover:text-navy font-semibold transition-colors"
                        >
                          Modifier
                        </button>
                        {u.id !== currentUserId && (
                          <DeleteUserButton id={u.id} name={u.name} />
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Permissions matrix */}
        <section className="rounded-xl bg-sand border border-sand-deep p-6">
          <h2 className="font-display text-base font-semibold text-navy">
            Matrice des permissions par rôle
          </h2>
          <p className="mt-2 text-sm text-graphite">
            Chaque rôle dispose d&apos;un ensemble fixe de permissions. Les permissions
            s&apos;appliquent à tous les utilisateurs du rôle.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-sand-deep">
                  <th className="text-left py-2 pr-4 font-semibold text-graphite uppercase tracking-wider">
                    Permission
                  </th>
                  {(["SUPER_ADMIN", "AGENT", "COMPTABLE"] as AdminRole[]).map((r) => (
                    <th key={r} className="text-center px-4 py-2 font-semibold text-graphite uppercase tracking-wider">
                      {ROLE_LABELS_FR[r]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-deep">
                {PERMISSIONS.map((p) => (
                  <tr key={p.permission}>
                    <td className="py-2.5 pr-4 text-navy">{p.label}</td>
                    {(["SUPER_ADMIN", "AGENT", "COMPTABLE"] as AdminRole[]).map((r) => (
                      <td key={r} className="text-center py-2.5 px-4">
                        {ROLE_PERMISSIONS[r].includes(p.permission) ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sand-deep">
                            <span className="h-1 w-1 rounded-full bg-silver" />
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {dialogUser !== undefined && (
        <UserFormDialog
          user={dialogUser.id ? dialogUser : undefined}
          onClose={closeDialog}
        />
      )}
    </>
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
