import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { BrandLogo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Connexion · Admin Assirik Tours",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <BrandLogo variant="mark" />
        </div>

        <div className="rounded-2xl border border-sand-deep bg-sand p-8 shadow-soft">
          <h1 className="font-display text-2xl font-semibold text-navy">
            Connexion admin
          </h1>
          <p className="mt-2 text-sm text-graphite">
            Réservé à l'équipe Assirik Tours.
          </p>

          <div className="mt-6">
            <LoginForm
              redirectTo={sp.redirect ?? "/admin"}
              initialError={sp.error}
            />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-silver">
          Première connexion ? Créez le premier admin via{" "}
          <code className="font-mono bg-sand-deep/60 px-1 py-0.5 rounded">
            pnpm tsx scripts/create-admin.ts
          </code>
        </p>
      </div>
    </div>
  );
}