import Link from "next/link";
import { logoutClientAction } from "@/lib/client-auth-actions";

export function ClientHeader({ firstName, email }: { firstName: string; email: string }) {
  return (
    <header className="border-b border-sand-deep bg-sand/90 backdrop-blur">
      <div className="container-narrow py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sunrise-coral">Espace client</p>
          <p className="text-sm text-navy font-medium">{firstName} · {email}</p>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/espace-client/dashboard" className="text-graphite hover:text-navy">Tableau de bord</Link>
          <form action={logoutClientAction}>
            <button type="submit" className="rounded-full border border-sand-deep px-4 py-1.5 text-xs font-semibold text-graphite hover:text-navy transition-colors">
              Se déconnecter
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
