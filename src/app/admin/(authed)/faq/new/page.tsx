import { FaqForm } from "@/components/admin/faq-form";

export default function NewFaqPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Nouvelle question FAQ
        </h1>
        <p className="mt-1 text-graphite">
          Saisissez la question et la réponse (Markdown léger accepté).
          L&apos;aperçu à droite rend le résultat en temps réel.
        </p>
      </header>

      <FaqForm mode="create" />
    </div>
  );
}
