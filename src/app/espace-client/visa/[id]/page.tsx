import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getClientSession } from "@/lib/client-auth";
import { ClientHeader } from "@/components/client/header";
import { VisaDocUploader } from "@/components/client/visa-doc-uploader";
import { deliveryUrl } from "@/lib/cloudinary-url";

export default async function ClientVisaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getClientSession();
  if (!session) redirect("/espace-client");

  const dossier = await prisma.visaDossier.findUnique({
    where: { id },
  });
  const client = dossier ? await prisma.client.findUnique({ where: { id: dossier.clientId } }) : null;
  if (!dossier || dossier.clientAccountId !== session.sub) notFound();

  const docs = Array.isArray(dossier.documents) ? (dossier.documents as Array<Record<string, string>>) : [];

  return (
    <>
      <ClientHeader firstName={session.firstName} email={session.email} />
      <section className="container-narrow py-12 max-w-3xl space-y-8">
        <Link href="/espace-client/dashboard" className="text-sm text-ocean hover:text-navy">
          ← Tableau de bord
        </Link>
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">{dossier.reference}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Dossier visa {dossier.destination}
            {dossier.visaType ? <span className="text-graphite font-normal text-2xl"> · {dossier.visaType}</span> : null}
          </h1>
          <p className="mt-2 text-graphite">
            Référence client : <span className="font-mono">{dossier.clientId}</span>
          </p>
          {dossier.deadline ? (
            <p className="mt-1 text-sm text-graphite">
              Échéance consulat : <span className="font-semibold text-navy">{new Date(dossier.deadline).toLocaleDateString("fr-FR")}</span>
            </p>
          ) : null}
        </header>

        <section className="rounded-xl border border-sand-deep bg-sand p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-navy">Pièces à fournir</h2>
          <p className="text-sm text-graphite">
            Pour chaque pièce, cliquez sur <em>Uploader</em> et sélectionnez le scan ou la photo (PDF, JPG, PNG — max 10 MB).
          </p>
          <ul className="mt-4 space-y-3">
            {docs.map((d, i) => (
              <li key={i} className="rounded-lg border border-sand-deep bg-sand-deep/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-navy">{d.name}</span>
                  <span className={`text-xs ${d.status === "uploaded" ? "text-emerald-700" : "text-sunrise-coral"}`}>
                    {d.status === "uploaded" ? "✓ Téléversé" : "○ À fournir"}
                  </span>
                </div>
                {d.status === "uploaded" && d.cloudinaryId ? (
                  <a
                    href={deliveryUrl(d.cloudinaryId, { width: 800, height: 600, crop: "limit" })}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-ocean hover:underline"
                  >
                    Voir le fichier
                  </a>
                ) : null}
                <VisaDocUploader id={dossier.id} docName={d.name} />
              </li>
            ))}
          </ul>
        </section>

        {dossier.notes ? (
          <section className="rounded-xl bg-sand-deep/30 p-6">
            <h2 className="font-display text-base font-semibold text-navy">Note de votre conseiller</h2>
            <p className="mt-2 text-sm text-graphite leading-relaxed whitespace-pre-wrap">{dossier.notes}</p>
          </section>
        ) : null}
      </section>
    </>
  );
}
