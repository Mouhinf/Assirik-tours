import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminCommunicationsPage() {
  const clientCount = await prisma.client.count();
  const recentReservations = await prisma.reservation.findMany({
    where: { status: { in: ["NOUVELLE", "EN_COURS"] } },
    include: { client: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">Communications</h1>
        <p className="mt-1 text-graphite">Newsletters, SMS, WhatsApp et notifications transactionnelles.</p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile title="Newsletter" desc="Envoi en masse à la base clients (email)." status="Phase 2" />
        <Tile title="WhatsApp en masse" desc="Broadcast via WhatsApp Business API." status="Phase 2" />
        <Tile title="SMS en masse" desc="Confirmation, rappel, paiement." status="Phase 2" />
        <Tile title="Confirmations auto" desc="Email envoyé à chaque réservation créée." status="Activée" on />
      </div>

      <section className="rounded-xl bg-sand border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">Relances prioritaires</h2>
        <p className="mt-2 text-sm text-graphite">
          {recentReservations.length} réservation{recentReservations.length > 1 ? "s" : ""} en attente de traitement.
        </p>
        <ul className="mt-4 space-y-2">
          {recentReservations.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 rounded-lg bg-sand-deep/30 px-4 py-2.5 text-sm">
              <span className="font-mono text-xs text-navy">{r.reference}</span>
              <span className="text-graphite">{r.client.firstName} {r.client.lastName}</span>
              <a
                href={`https://wa.me/${r.client.phone?.replace(/\D/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold text-whatsapp hover:underline"
              >
                Relancer sur WhatsApp →
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-sand border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">Templates email & SMS</h2>
        <p className="mt-2 text-sm text-graphite">
          Modèles de messages prêts à l&apos;envoi (Phase 2 : éditeur dans l&apos;admin).
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>· <span className="font-semibold text-navy">Confirmation de réservation</span> — référence, montant, prochaines étapes</li>
          <li>· <span className="font-semibold text-navy">Rappel paiement</span> — J+3 après devis</li>
          <li>· <span className="font-semibold text-navy">Documents visa manquants</span> — lien vers l&apos;espace client</li>
          <li>· <span className="font-semibold text-navy">Rappel départ</span> — J-7 avant le voyage</li>
          <li>· <span className="font-semibold text-navy">Bienvenue client</span> — premier achat + lien espace</li>
        </ul>
      </section>
    </div>
  );
}

function Tile({ title, desc, status, on }: { title: string; desc: string; status: string; on?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${on ? "bg-emerald-50 border-emerald-200" : "bg-sand border-sand-deep"}`}>
      <h3 className="font-display text-base font-semibold text-navy">{title}</h3>
      <p className="mt-2 text-sm text-graphite">{desc}</p>
      <p className={`mt-3 text-xs font-semibold ${on ? "text-emerald-700" : "text-silver"}`}>{status}</p>
    </div>
  );
}
