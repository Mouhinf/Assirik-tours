import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requirePermission, requireAdmin } from "@/lib/auth-actions";
import { can } from "@/lib/rbac";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; export?: string }>;
}) {
  await requireAdmin();
  const session = await requirePermission("clients:read");
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";

  const clients = await prisma.client.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { reservations: { select: { id: true, status: true, totalFCFA: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Segmentation basique
  const totalRevenue = clients.reduce(
    (acc, c) => acc + c.reservations.filter((r) => r.status === "PAYEE").reduce((s, r) => s + r.totalFCFA, 0),
    0,
  );

  const canExport = can(session.role, "clients:export");

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">Clients (CRM)</h1>
          <p className="mt-1 text-graphite">{clients.length} contact{clients.length > 1 ? "s" : ""} · CA cumulé encaissé : {totalRevenue.toLocaleString("fr-FR")} FCFA</p>
        </div>
        {canExport ? (
          <Link
            href={`/admin/clients/export${q ? `?q=${encodeURIComponent(q)}` : ""}`}
            className="inline-flex items-center gap-2 rounded-full border border-sand-deep px-4 py-2 text-sm font-semibold text-navy hover:border-ocean hover:text-ocean transition-colors"
            prefetch={false}
          >
            Exporter en CSV
          </Link>
        ) : null}
      </header>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par nom, email ou téléphone…"
          className="flex-1 rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-sm text-navy placeholder:text-silver"
        />
        <button type="submit" className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy transition-colors">
          Filtrer
        </button>
      </form>

      <section className="rounded-xl bg-sand border border-sand-deep overflow-hidden">
        {clients.length === 0 ? (
          <p className="p-8 text-center text-sm text-graphite">Aucun client.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand-deep/40 text-xs uppercase tracking-wider text-graphite">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Nom</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Téléphone</th>
                <th className="text-right px-4 py-3 font-semibold">Réservations</th>
                <th className="text-right px-4 py-3 font-semibold">CA payé</th>
                <th className="text-left px-4 py-3 font-semibold">Créé le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-deep">
              {clients.map((c) => {
                const paid = c.reservations.filter((r) => r.status === "PAYEE").reduce((s, r) => s + r.totalFCFA, 0);
                return (
                  <tr key={c.id} className="hover:bg-sand-deep/30">
                    <td className="px-4 py-3 font-medium text-navy">{c.firstName} {c.lastName}</td>
                    <td className="px-4 py-3 text-graphite">{c.email}</td>
                    <td className="px-4 py-3 text-graphite">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-right text-graphite">{c.reservations.length}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ocean">{paid.toLocaleString("fr-FR")} F</td>
                    <td className="px-4 py-3 text-graphite">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
