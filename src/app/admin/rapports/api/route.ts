import { NextRequest, NextResponse } from "next/server";
import { getReportData } from "@/lib/report-actions";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const filters = {
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      destinationId: searchParams.get("destinationId") ?? undefined,
      agentId: searchParams.get("agentId") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    };

    const { reservations } = await getReportData(filters);

    const serializable = reservations.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      offer: r.offer
        ? {
            ...r.offer,
            destination: r.offer.destination,
            createdAt: r.offer.createdAt.toISOString(),
            updatedAt: r.offer.updatedAt.toISOString(),
          }
        : null,
      destination: r.destination
        ? { ...r.destination, createdAt: r.destination.createdAt.toISOString(), updatedAt: r.destination.updatedAt.toISOString() }
        : null,
      client: { ...r.client, createdAt: r.client.createdAt.toISOString() },
      assignee: r.assignee ?? null,
    }));

    return NextResponse.json({ reservations: serializable });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    return new NextResponse(JSON.stringify({ error: message }), { status: 403 });
  }
}
