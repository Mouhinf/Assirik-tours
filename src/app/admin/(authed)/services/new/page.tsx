import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { ServiceForm } from "@/components/admin/service-form";

export default async function NewServicePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "services:write")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }
  return (
    <div className="space-y-6">
      <header>
        <p>
          <Link href="/admin/services" className="text-sm font-semibold text-ocean hover:text-navy">
            ← Tous les services
          </Link>
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
          Nouveau service
        </h1>
        <p className="mt-1 text-graphite">
          Créez une prestation (assistance visa, hôtel, transfert…) pour qu&apos;elle
          apparaisse sur la page publique <code className="font-mono">/services</code>.
        </p>
      </header>
      <ServiceForm mode="create" />
    </div>
  );
}
