import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { setPasswordAction } from "@/lib/client-auth-actions";

type SP = Promise<{ token?: string }>;

export const metadata: Metadata = {
  title: "Définir votre mot de passe",
  robots: { index: false, follow: false },
};

export default async function SetPasswordPage({ searchParams }: { searchParams: SP }) {
  const { token } = await searchParams;
  let account: { email: string } | null = null;
  if (token) {
    try {
      account = await prisma.clientAccount.findFirst({
        where: { verifyToken: token },
        select: { email: true },
      });
    } catch {
      account = null;
    }
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    const t = String(formData.get("token") ?? "");
    const p1 = String(formData.get("password") ?? "");
    const p2 = String(formData.get("password2") ?? "");
    if (!t) {
      return; // form-level guard
    }
    if (p1 !== p2) {
      return;
    }
    const result = await setPasswordAction(t, p1);
    if (result.ok) {
      const { redirect } = await import("next/navigation");
      redirect("/espace-client?password=set");
    }
  }

  return (
    <section className="container-narrow py-16 max-w-md">
      <Link href="/espace-client" className="text-sm text-ocean hover:text-navy">
        ← Connexion
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-navy">Définir votre mot de passe</h1>
      <p className="mt-2 text-sm text-graphite leading-relaxed">
        Choisissez un mot de passe d&apos;au moins 10 caractères, contenant au moins une lettre et un chiffre.
        Le lien est valable 24 heures après son émission par l&apos;agence.
      </p>

      {token && account ? (
        <form action={handleSubmit} className="mt-6 space-y-3">
          <input type="hidden" name="token" value={token} />
          <p className="text-xs text-graphite">Compte : <span className="font-semibold text-navy">{account.email}</span></p>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-graphite">Nouveau mot de passe</span>
            <input
              name="password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-graphite">Confirmer</span>
            <input
              name="password2"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-sm text-navy"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand hover:bg-navy"
          >
            Enregistrer mon mot de passe
          </button>
        </form>
      ) : (
        <div className="mt-6 rounded-xl border border-sand-deep bg-sand p-5 text-sm text-graphite">
          Lien invalide ou expiré. Demandez à l&apos;agence de vous en renvoyer un.
        </div>
      )}
    </section>
  );
}
