import { NextRequest, NextResponse } from "next/server";
import { exportReportCSV } from "@/lib/report-actions";

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

    const csv = await exportReportCSV(filters);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rapport-assirik-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    return new NextResponse(JSON.stringify({ error: message }), { status: 403 });
  }
}
