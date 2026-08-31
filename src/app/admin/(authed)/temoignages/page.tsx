import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { AdminToggleApprovedButton } from "./toggle-approved-button";
import { AdminDeleteTestimonialButton } from "./delete-testimonial-button";
import { AdminReorderTestimonials } from "./reorder-testimonials";
import { deliveryUrl } from "@/lib/cloudinary-url";

export default async function AdminTestimonialsListPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    locale?: string;
    status?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const locale = sp.locale === "fr" || sp.locale === "en" ? sp.locale : undefined;
  const status = sp.status; // ""|"approved"|"pending"

  const session = await getSession();
  if (!session) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Session expirée.
      </p>
    );
  }

  // COMPTABLE has no business reading testimonials (private experience data).
  if (!can(session.role, "testimonials:read")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const where = {
    ...(locale ? { locale } : {}),
    ...(status === "approved" ? { approved: true } : {}),
    ...(status === "pending" ? { approved: false } : {}),
    ...(q
      ? {
          OR: [
            { author: { contains: q, mode: "insensitive" as const } },
            { city: { contains: q, mode: "insensitive" as const } },
            { content: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [testimonials, totalAll] = await Promise.all([
    prisma.testimonial.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.testimonial.count(),
  ]);

  const canDelete = can(session.role, "testimonials:delete");
  const canReorder = can(session.role, "testimonials:reorder");
  const canApprove = can(session.role, "testimonials:approve");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">Témoignages</h1>
          <p className="mt-1 text-graphite">
            {testimonials.length} affichés · {totalAll} au total en base.
          </p>
        </div>
        <Link
          href="/admin/temoignages/new"
          className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors"
        >
          + Nouveau témoignage
        </Link>
      </header>

      {/* Filtres */}
      <form className="rounded-xl border border-sand-deep bg-sand p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
            Recherche
          </span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Auteur, ville, contenu…"
            className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
            Langue
          </span>
          <select
            name="locale"
            defaultValue={locale ?? ""}
            className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
          >
            <option value="">Toutes</option>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
            Statut
          </span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy"
          >
            <option value="">Tous</option>
            <option value="approved">Approuvé</option>
            <option value="pending">En attente</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy transition-colors"
          >
            Filtrer
          </button>
          <Link
            href="/admin/temoignages"
            className="rounded-md border border-sand-deep px-4 py-2 text-sm font-semibold text-graphite hover:text-navy transition-colors"
          >
            Réinitialiser
          </Link>
        </div>
      </form>

      {/* Liste */}
      <div className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
        {testimonials.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-graphite">Aucun témoignage ne correspond.</p>
            <Link
              href="/admin/temoignages/new"
              className="mt-3 inline-block text-sm font-semibold text-ocean hover:text-navy"
            >
              Créer le premier →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Auteur</th>
                <th className="text-left px-4 py-3 font-semibold">Ville</th>
                <th className="text-left px-4 py-3 font-semibold">Note</th>
                <th className="text-left px-4 py-3 font-semibold">Langue</th>
                <th className="text-left px-4 py-3 font-semibold">Statut</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {testimonials.map((t) => {
                const avatarUrl = t.avatarId
                  ? deliveryUrl(t.avatarId, { width: 64, height: 64, crop: "fill" })
                  : null;
                return (
                  <tr key={t.id} className="hover:bg-sand-deep/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarUrl}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover border border-sand-deep shrink-0"
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="h-8 w-8 rounded-full bg-mist text-navy inline-flex items-center justify-center text-xs font-semibold shrink-0"
                          >
                            {(t.author?.charAt(0) ?? "A").toUpperCase()}
                            {(t.author?.split(/\s+/)[1]?.charAt(0) ?? "").toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-navy truncate">{t.author}</p>
                          <p className="text-xs text-silver truncate italic max-w-md">
                            {t.content.slice(0, 60)}…
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-graphite">{t.city ?? "—"}</td>
                    <td className="px-4 py-3 text-sunrise-orange" aria-label={`${t.rating} sur 5`}>
                      {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider " +
                          (t.locale === "en"
                            ? "bg-sky/15 text-ocean"
                            : "bg-ocean/15 text-navy")
                        }
                      >
                        {t.locale.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {t.approved ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-emerald-700">
                            Approuvé
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-silver/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-graphite">
                            En attente
                          </span>
                        )}
                        <span className="inline-flex rounded-full bg-sand-deep/40 px-2 py-0.5 text-[0.65rem] font-mono text-graphite">
                          #{t.order}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {canApprove ? (
                          <AdminToggleApprovedButton id={t.id} approved={t.approved} />
                        ) : null}
                        <Link
                          href={`/admin/temoignages/${t.id}`}
                          className="text-sm font-medium text-ocean hover:text-navy"
                        >
                          Éditer
                        </Link>
                        {canDelete ? <AdminDeleteTestimonialButton id={t.id} /> : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Réordonnement — visible seulement si autorisé et qu'il y a du contenu */}
      {canReorder && testimonials.length > 1 ? (
        <AdminReorderTestimonials
          items={testimonials.map((t) => ({
            id: t.id,
            label: `${t.author}${t.city ? ` · ${t.city}` : ""}`,
          }))}
        />
      ) : null}
    </div>
  );
}
