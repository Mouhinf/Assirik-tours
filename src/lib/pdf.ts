/**
 * PDF generation - voucher de réservation + invoice.
 * Uses pdf-lib so we don't need a headless Chromium for simple layouts.
 *
 * French defaults, A4 portrait.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { siteConfig } from "@/lib/site-config";
import { formatFCFA } from "@/lib/utils";

const COLOR_NAVY = rgb(0.071, 0.251, 0.420); // #12406B
const COLOR_OCEAN = rgb(0.114, 0.435, 0.722); // #1D6FB8
const COLOR_ORANGE = rgb(0.961, 0.655, 0.231); // #F5A73B
const COLOR_GREY = rgb(0.290, 0.318, 0.349); // #4A5159
const COLOR_SAND = rgb(0.969, 0.961, 0.941); // #F7F5F0

type VoucherInput = {
  reference: string;
  clientName: string;
  clientEmail: string;
  offerTitle: string;
  destination: string;
  travelers: number;
  startDate?: Date | null;
  totalFCFA: number;
  status: string;
};

export async function generateVoucherPdf(input: VoucherInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Header band
  page.drawRectangle({ x: 0, y: 770, width: 595.28, height: 71.89, color: COLOR_NAVY });
  page.drawText("Assirik Tours", { font: fontBold, x: 40, y: 805, size: 22, color: rgb(1, 1, 1) });
  page.drawText("Voucher de réservation", { font, x: 40, y: 785, size: 11, color: COLOR_ORANGE });

  // Reference + status (right side)
  page.drawText(input.reference, { font: fontBold, x: 410, y: 805, size: 12, color: rgb(1, 1, 1) });
  page.drawText(`Statut : ${input.status}`, { font, x: 410, y: 785, size: 10, color: COLOR_ORANGE });

  let y = 730;
  drawLabelValue(page, font, fontBold, "Client", input.clientName, y); y -= 20;
  drawLabelValue(page, font, fontBold, "Email", input.clientEmail, y); y -= 20;
  drawLabelValue(page, font, fontBold, "Offre", input.offerTitle, y); y -= 20;
  drawLabelValue(page, font, fontBold, "Destination", input.destination, y); y -= 20;
  drawLabelValue(page, font, fontBold, "Voyageurs", String(input.travelers), y); y -= 20;
  if (input.startDate) {
    drawLabelValue(page, font, fontBold, "Départ", input.startDate.toLocaleDateString("fr-FR"), y);
    y -= 20;
  }
  y -= 10;

  // Total box
  page.drawRectangle({ x: 40, y: y - 36, width: 515.28, height: 40, color: COLOR_SAND, borderColor: COLOR_OCEAN, borderWidth: 1 });
  page.drawText("Montant total", { font, x: 56, y: y - 16, size: 10, color: COLOR_GREY });
  page.drawText(formatFCFA(input.totalFCFA), { font: fontBold, x: 56, y: y - 30, size: 16, color: COLOR_NAVY });
  page.drawText("Taxes incluses (sauf mention contraire).", { font, x: 380, y: y - 22, size: 9, color: COLOR_GREY });
  y -= 70;

  // Conditions / contact
  page.drawText("À présenter à l'enregistrement et à l'arrivée à l'hôtel.", { font, x: 40, y, size: 10, color: COLOR_GREY });
  y -= 18;
  page.drawText(`Contact : ${siteConfig.phones.landline} · ${siteConfig.email}`, { font, x: 40, y, size: 10, color: COLOR_GREY });
  y -= 18;
  page.drawText(`Adresse : ${siteConfig.address.line1}, ${siteConfig.address.line2}, ${siteConfig.address.city}`, { font, x: 40, y, size: 10, color: COLOR_GREY });

  // Footer
  page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 40, color: COLOR_NAVY });
  page.drawText(`${siteConfig.name} · ${siteConfig.tagline}`, { font, x: 40, y: 16, size: 9, color: COLOR_ORANGE });

  return await doc.save();
}

function drawLabelValue(page: PDFPage, font: PDFFont, bold: PDFFont, label: string, value: string, y: number) {
  page.drawText(label, { font, x: 40, y, size: 10, color: COLOR_GREY });
  page.drawText(value, { font: bold, x: 140, y, size: 11, color: COLOR_NAVY });
}
