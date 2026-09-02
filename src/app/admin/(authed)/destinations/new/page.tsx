import { DestinationForm } from "@/components/admin/destination-form";
import { getActiveRegions } from "@/lib/regions";

export default async function NewDestinationPage() {
  const regions = await getActiveRegions();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Nouvelle destination
        </h1>
        <p className="mt-1 text-graphite">
          Renseignez les informations de base. Vous pourrez ajouter des photos
          depuis la médiathèque.
        </p>
      </header>

      <DestinationForm
        mode="create"
        regions={regions.map((r) => ({
          id: r.id,
          labelFr: r.labelFr,
          legacyEnumKeys: r.legacyEnumKeys,
        }))}
      />
    </div>
  );
}