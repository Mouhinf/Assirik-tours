import { cn } from "@/lib/utils";

export function AdminTopbar({
  user,
  logoutAction,
}: {
  user: { name: string; email: string; role: string };
  logoutAction: () => Promise<void>;
}) {
  return (
    <header className="bg-sand border-b border-sand-deep sticky top-0 z-10">
      <div className="px-6 md:px-10 py-3.5 flex items-center justify-between gap-4">
        <div className="text-sm text-silver">
          Connecté en tant que{" "}
          <span className="font-medium text-navy">{user.email}</span>
          <span
            className={cn(
              "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider",
              user.role === "SUPER_ADMIN" && "bg-ocean/15 text-ocean",
              user.role === "AGENT" && "bg-sky/20 text-ocean",
              user.role === "COMPTABLE" && "bg-sunrise-orange/20 text-sunrise-coral",
            )}
          >
            {labelForRole(user.role)}
          </span>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center text-sm font-medium text-graphite transition-colors hover:text-navy"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </header>
  );
}

function labelForRole(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super admin";
    case "AGENT":
      return "Agent";
    case "COMPTABLE":
      return "Comptable";
    default:
      return role;
  }
}
