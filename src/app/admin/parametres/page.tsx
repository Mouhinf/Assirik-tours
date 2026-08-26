import { siteConfig } from "@/lib/site-config";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Paramètres
        </h1>
        <p className="mt-1 text-graphite">
          Informations de l'agence — affichées sur le site public. Modifiables
          dans <code className="font-mono bg-sand-deep/60 px-1 py-0.5 rounded">src/lib/site-config.ts</code>.
        </p>
      </header>

      <section className="rounded-xl bg-sand border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">
          Identité
        </h2>
        <dl className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
          <Row label="Nom" value={siteConfig.name} />
          <Row label="Tagline" value={siteConfig.tagline} />
        </dl>
      </section>

      <section className="rounded-xl bg-sand border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">
          Contact
        </h2>
        <dl className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
          <Row label="Email" value={siteConfig.email} />
          <Row label="Téléphone fixe" value={siteConfig.phones.landline} />
          <Row label="WhatsApp" value={siteConfig.phones.whatsapp} />
          <Row
            label="Adresse"
            value={`${siteConfig.address.line1}, ${siteConfig.address.line2}, ${siteConfig.address.city}`}
          />
        </dl>
      </section>

      <section className="rounded-xl bg-sand border border-sand-deep p-6">
        <h2 className="font-display text-base font-semibold text-navy">
          Variables d'environnement (à configurer sur Vercel)
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          <EnvRow name="NEXT_PUBLIC_SITE_URL" desc="URL du site en production" />
          <EnvRow name="DATABASE_URL" desc="Connexion PostgreSQL (Neon)" />
          <EnvRow name="CLOUDINARY_CLOUD_NAME" desc="Cloud name Cloudinary" />
          <EnvRow name="CLOUDINARY_API_KEY" desc="API key Cloudinary" />
          <EnvRow name="CLOUDINARY_API_SECRET" desc="API secret Cloudinary" />
          <EnvRow
            name="AUTH_SECRET"
            desc="Clé de signature JWT (openssl rand -hex 32)"
          />
          <EnvRow name="NEXT_PUBLIC_WHATSAPP_NUMBER" desc="Numéro WhatsApp sans +" />
        </ul>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-silver">
        {label}
      </dt>
      <dd className="mt-1 text-navy">{value}</dd>
    </div>
  );
}

function EnvRow({ name, desc }: { name: string; desc: string }) {
  return (
    <li className="flex items-start gap-3 rounded-lg bg-sand-deep/30 px-3 py-2">
      <code className="font-mono text-xs text-ocean shrink-0">{name}</code>
      <span className="text-xs text-graphite">{desc}</span>
    </li>
  );
}