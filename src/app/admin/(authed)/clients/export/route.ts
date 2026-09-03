import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-actions";

/**
 * GET /admin/clients/export?q=...
 *
 * Streams a CSV of the matching clients (same filter as the index page).
 * Requires `clients:export` permission.
 */
export async function GET(req: Request) {
  await requirePermission("clients:export");

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

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
    include: { reservations: { select: { status: true, totalFCFA: true } } },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Prénom",
    "Nom",
    "Email",
    "Téléphone",
    "Nb réservations",
    "CA payé (FCFA)",
    "Créé le",
  ];

  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const rows = clients.map((c) => {
    const paid = c.reservations
      .filter((r) => r.status === "PAYEE")
      .reduce((s, r) => s + r.totalFCFA, 0);
    return [
      c.firstName,
      c.lastName,
      c.email,
      c.phone ?? "",
      c.reservations.length,
      paid,
      c.createdAt.toISOString().slice(0, 10),
    ]
      .map(escape)
      .join(",");
  });

  const csv = ["\uFEFF" + headers.join(","), ...rows].join("\n");
  const filename = `clients-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
