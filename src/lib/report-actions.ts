"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export type ReportFilters = {
  from?: string;
  to?: string;
  destinationId?: string;
  agentId?: string;
  status?: string;
};

export async function getReportData(filters: ReportFilters) {
  const session = await getSession();
  if (!session) throw new Error("Non autorisé.");
  if (!can(session.role, "reports:read")) throw new Error("Accès refusé.");

  const from = filters.from ? new Date(filters.from) : undefined;
  const to = filters.to ? new Date(filters.to + "T23:59:59") : undefined;

  const where = {
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
    ...(filters.destinationId ? { destinationId: filters.destinationId } : {}),
    ...(filters.agentId ? { assigneeId: filters.agentId } : {}),
    ...(filters.status ? { status: filters.status as import("@prisma/client").ReservationStatus } : {}),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reservationList = await prisma.reservation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      offer: { include: { destination: true } },
      destination: true,
      assignee: { select: { id: true, name: true } },
    },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any[];

  const [reservations, destinations, agents] = await Promise.all([
    Promise.resolve(reservationList),
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

  return { reservations, destinations, agents };
}

export async function exportReportCSV(filters: ReportFilters): Promise<string> {
  const { reservations } = await getReportData(filters);

  const headers = [
    "Référence",
    "Date",
    "Client",
    "Email",
    "Téléphone",
    "Source",
    "Statut traitement",
    "Statut paiement",
    "Destination",
    "Offre",
    "Assigné à",
    "Voyageurs",
    "Montant (FCFA)",
    "Notes",
  ];

  const rows = reservations.map((r) => [
    r.reference,
    new Date(r.createdAt).toLocaleDateString("fr-FR"),
    `${r.client.firstName} ${r.client.lastName}`,
    r.client.email,
    r.client.phone,
    r.source,
    r.processingStatus,
    r.status,
    r.destination?.title ?? r.offer?.destination?.title ?? "",
    r.offer?.title ?? "",
    r.assignee?.name ?? "",
    String(r.travelers),
    String(r.totalFCFA),
    (r.notes ?? "").replace(/\n/g, " "),
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const escaped = String(cell).replace(/"/g, '""');
          return /[;,\n"]/.test(escaped) ? `"${escaped}"` : escaped;
        })
        .join(";"),
    ),
  ].join("\n");

  const BOM = "\uFEFF";
  return BOM + csvContent;
}
