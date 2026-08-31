import { TestimonialForm } from "@/components/admin/testimonial-form";

export default function NewTestimonialPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Nouveau témoignage
        </h1>
        <p className="mt-1 text-graphite">
          Renseignez les informations du voyageur. Vous pourrez prévisualiser la carte avant publication.
        </p>
      </header>

      <TestimonialForm mode="create" />
    </div>
  );
}
