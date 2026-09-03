import Link from "next/link";
import { RegionForm } from "@/components/admin/region-form";
import { requirePagePermission } from "@/lib/page-permissions";

export default async function NewRegionPage() {
  await requirePagePermission("destinations:write");
  return (
    <div className="space-y-6">
      <header>
        <p>
          <Link
            href="/admin/destinations/regions"
            className="text-sm font-semibold text-ocean hover:text-navy"
          >
            ← Toutes les régions
          </Link>
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-navy">
          Nouvelle région
        </h1>
        <p className="mt-1 text-graphite">
          Une région créée ici apparaît immédiatement dans le filtre du site public
          et dans le formulaire d&apos;édition des destinations.
        </p>
      </header>

      <RegionForm mode="create" />
    </div>
  );
}
