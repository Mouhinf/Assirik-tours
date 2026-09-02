import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { ReportsClient } from "@/components/admin/reports-client";

export default async function AdminReportsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "reports:read")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startYear = new Date(now.getFullYear(), 0, 1);

  const [reservations, destinations, agents] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        createdAt: { gte: startMonth },
      },
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        offer: { include: { destination: true } },
        destination: true,
        assignee: { select: { id: true, name: true } },
      },
    }),
    prisma.destination.findMany({
      where: { published: true },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.adminUser.findMany({
      where: { role: { in: ["AGENT", "SUPER_ADMIN"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalRevenue = reservations
    .filter((r) => r.status === "PAYEE")
    .reduce((s, r) => s + r.totalFCFA, 0);

  const canExport = can(session.role, "clients:export");

  return (
    <ReportsClient
      initialReservations={reservations as Parameters<typeof ReportsClient>[0]["initialReservations"]}
      destinations={destinations}
      agents={agents}
      canExport={canExport}
    />
  );
}
