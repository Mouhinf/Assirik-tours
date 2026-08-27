import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientSession } from "@/lib/client-auth";
import { generateVoucherPdf } from "@/lib/pdf";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getClientSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { client: true, offer: { include: { destination: true } } },
  });
  if (!reservation) return new NextResponse("Not found", { status: 404 });
  if (reservation.clientAccountId !== session.sub) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const pdf = await generateVoucherPdf({
    reference: reservation.reference,
    clientName: `${reservation.client.firstName} ${reservation.client.lastName}`,
    clientEmail: reservation.client.email,
    offerTitle: reservation.offer?.title ?? "Demande sur mesure",
    destination: reservation.offer?.destination.title ?? "—",
    travelers: reservation.travelers,
    startDate: reservation.startDate,
    totalFCFA: reservation.totalFCFA,
    status: reservation.status,
  });

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="voucher-${reservation.reference}.pdf"`,
    },
  });
}
