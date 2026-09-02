"use client";

import { useState, useMemo } from "react";

type AuditLog = {
  id: string;
  userId: string | null;
  action: string;
  entity: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
};

type User = {
  id: string;
  name: string;
  email: string;
};

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Connexion",
  "auth.logout": "Déconnexion",
  "auth.failed": "Tentative échouée",
  "auth.2fa_enabled": "2FA activée",
  "destination.create": "Destination créée",
  "destination.update": "Destination modifiée",
  "destination.delete": "Destination supprimée",
  "destination.publish": "Destination publiée",
  "offer.create": "Offre créée",
  "offer.update": "Offre modifiée",
  "offer.delete": "Offre supprimée",
  "offer.publish": "Offre publiée",
  "reservation.create": "Réservation créée",
  "reservation.update": "Réservation modifiée",
  "reservation.delete": "Réservation supprimée",
  "visa.create": "Dossier visa créé",
  "visa.update": "Dossier visa mis à jour",
  "visa.delete": "Dossier visa supprimé",
  "visa.document_upload": "Pièce visa uploadée",
  "client.create": "Client créé",
  "client.update": "Client modifié",
  "client.export": "Export clients",
  "media.upload": "Média uploadé",
  "media.delete": "Média supprimé",
  "settings.update": "Paramètres modifiés",
  "flight.config.update": "Config billetterie modifiée",
  "service.create": "Service créé",
  "service.update": "Service modifié",
  "service.delete": "Service supprimé",
  "user.create": "Utilisateur créé",
  "user.update": "Utilisateur modifié",
  "user.delete": "Utilisateur supprimé",
  "testimonial.create": "Témoignage créé",
  "testimonial.update": "Témoignage modifié",
  "testimonial.delete": "Témoignage supprimé",
  "testimonial.approve.toggle": "Témoignage approuvé/refusé",
  "testimonial.reorder": "Témoignages réordonnés",
  "faq.create": "FAQ créée",
  "faq.update": "FAQ modifiée",
  "faq.delete": "FAQ supprimée",
  "faq.toggle": "FAQ activée/désactivée",
  "faq.reorder": "FAQ réordonnées",
  "gallery.create": "Photo ajoutée",
  "gallery.update": "Photo modifiée",
  "gallery.delete": "Photo supprimée",
  "gallery.toggle": "Photo activée/désactivée",
  "gallery.featured.toggle": "Photo mise en avant",
  "gallery.reorder": "Photos réordonnées",
  "blog.create": "Article créé",
  "blog.update": "Article modifié",
  "blog.publish": "Article publié",
  "blog.unpublish": "Article dépublié",
  "blog.delete": "Article supprimé",
  "blog.featured.toggle": "Article mis en avant",
  "blog.duplicate": "Article dupliqué",
  "page.create": "Page créée",
  "page.update": "Page modifiée",
  "page.delete": "Page supprimée",
  "flight.search": "Recherche vol",
  "flight.quote.request": "Demande devis vol",
  "flight.reservation.create": "Réservation vol créée",
  "communication.sent": "Communication envoyée",
  "communication.failed": "Communication échouée",
  "campaign.create": "Campagne créée",
  "campaign.send": "Campagne envoyée",
};

const MODULE_COLORS: Record<string, string> = {
  auth: "bg-graphite/15 text-graphite",
  destination: "bg-sunrise-yellow/20 text-sunrise-amber",
  offer: "bg-ocean/15 text-ocean",
  reservation: "bg-emerald-100 text-emerald-700",
  visa: "bg-purple-100 text-purple-700",
  client: "bg-sky/20 text-sky",
  media: "bg-pink-100 text-pink-700",
  settings: "bg-amber-100 text-amber-700",
  flight: "bg-cyan-100 text-cyan-700",
  service: "bg-indigo-100 text-indigo-700",
  testimonial: "bg-rose-100 text-rose-700",
  faq: "bg-teal-100 text-teal-700",
  gallery: "bg-orange-100 text-orange-700",
  blog: "bg-violet-100 text-violet-700",
  page: "bg-gray-100 text-gray-700",
  user: "bg-red-100 text-red-700",
  campaign: "bg-fuchsia-100 text-fuchsia-700",
  communication: "bg-fuchsia-100 text-fuchsia-700",
};

function moduleOf(action: string): string {
  return action.split(".")[0] ?? "other";
}

export function AuditLogClient({
  initialLogs,
  users,
}: {
  initialLogs: AuditLog[];
  users: User[];
}) {
  const [filterAction, setFilterAction] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterEntity, setFilterEntity] = useState<string>("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const userMap = useMemo(() => {
    const m = new Map<string, User>();
    for (const u of users) m.set(u.id, u);
    return m;
  }, [users]);

  const uniqueActions = useMemo(() => {
    const seen = new Set<string>();
    for (const l of initialLogs) {
      if (!seen.has(l.action)) {
        seen.add(l.action);
      }
    }
    return Array.from(seen).sort();
  }, [initialLogs]);

  const filtered = useMemo(() => {
    return initialLogs.filter((l) => {
      if (filterAction && l.action !== filterAction) return false;
      if (filterUser && l.userId !== filterUser) return false;
      if (filterEntity && !l.entity?.toLowerCase().includes(filterEntity.toLowerCase())) return false;
      return true;
    });
  }, [initialLogs, filterAction, filterUser, filterEntity]);

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">Journal d&apos;audit</h1>
        <p className="mt-1 text-graphite">
          Toutes les actions sensibles du back-office — qui a modifié quoi, quand.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
            Action
          </span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="min-h-10 rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
          >
            <option value="">Toutes</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>
                {ACTION_LABELS[a] ?? a}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
            Utilisateur
          </span>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="min-h-10 rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
          >
            <option value="">Tous</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </label>
        <label className="block flex-1 min-w-[160px]">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
            Cible (ID)
          </span>
          <input
            type="search"
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            placeholder="ID de l'entité…"
            className="min-h-10 w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
          />
        </label>
        {(filterAction || filterUser || filterEntity) && (
          <button
            onClick={() => { setFilterAction(""); setFilterUser(""); setFilterEntity(""); }}
            className="inline-flex min-h-10 items-center rounded-md border border-sand-deep px-4 py-2 text-sm font-semibold text-graphite hover:text-navy"
          >
            Réinitialiser
          </button>
        )}
        <p className="self-end pb-2 text-xs text-silver">
          {filtered.length} entrée{filtered.length > 1 ? "s" : ""}
        </p>
      </div>

      <section className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-graphite">
            Aucune entrée pour ces filtres.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold w-8"></th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-left px-4 py-3 font-semibold">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-semibold">Action</th>
                  <th className="text-left px-4 py-3 font-semibold">Cible</th>
                  <th className="text-left px-4 py-3 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-deep">
                {filtered.map((l) => {
                  const user = l.userId ? userMap.get(l.userId) : null;
                  const mod = moduleOf(l.action);
                  const isExpanded = expanded === l.id;
                  const hasMeta = l.metadata && Object.keys(l.metadata).length > 0;

                  return (
                    <>
                      <tr
                        key={l.id}
                        className="hover:bg-sand-deep/20 cursor-pointer"
                        onClick={() => hasMeta ? toggleExpand(l.id) : undefined}
                      >
                        <td className="px-4 py-3 text-center">
                          {hasMeta ? (
                            <span className="inline-flex h-4 w-4 items-center justify-center text-graphite">
                              {isExpanded ? "▼" : "▶"}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-xs text-graphite whitespace-nowrap">
                          {new Date(l.createdAt).toLocaleString("fr-FR")}
                        </td>
                        <td className="px-4 py-3">
                          {user ? (
                            <div>
                              <p className="font-medium text-navy text-xs">{user.name}</p>
                              <p className="text-[0.65rem] text-silver">{user.email}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-silver italic">Système</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-md px-2 py-0.5 text-xs font-semibold ${MODULE_COLORS[mod] ?? "bg-sand-deep text-graphite"}`}
                            >
                              {ACTION_LABELS[l.action] ?? l.action}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-graphite">
                          {l.entity ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-silver">{l.ip ?? "—"}</td>
                      </tr>
                      {isExpanded && l.metadata && (
                        <tr key={`${l.id}-meta`} className="bg-sand-deep/10">
                          <td colSpan={6} className="px-8 py-3">
                            <details open className="text-xs">
                              <summary className="font-semibold text-graphite cursor-pointer mb-1">
                                Détails de l&apos;action
                              </summary>
                              <pre className="mt-1 rounded-md bg-navy/5 p-3 text-[0.7rem] overflow-x-auto text-graphite font-mono">
                                {JSON.stringify(l.metadata, null, 2)}
                              </pre>
                            </details>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
