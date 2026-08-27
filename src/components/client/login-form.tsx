"use client";

import { useActionState } from "react";
import { loginClientAction, type ClientAuthState } from "@/lib/client-auth-actions";

export function ClientLoginForm() {
  const [state, formAction, isPending] = useActionState<ClientAuthState, FormData>(
    loginClientAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-sand-deep bg-sand-deep/40 px-3 py-2.5 text-sm text-navy placeholder:text-silver focus:border-ocean focus:bg-sand outline-none"
        />
      </label>

      {state?.stage !== "needs_password" ? (
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">Mot de passe</span>
          <input
            name="password"
            type="password"
            required={state?.stage !== "needs_password" as never}
            autoComplete="current-password"
            className="w-full rounded-lg border border-sand-deep bg-sand-deep/40 px-3 py-2.5 text-sm text-navy placeholder:text-silver focus:border-ocean focus:bg-sand outline-none"
          />
        </label>
      ) : null}

      {state && "error" in state && state.error ? (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-3 py-2 text-sm text-sunrise-coral">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-ocean px-5 py-3 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
      >
        {isPending ? "Connexion…" : "Se connecter"}
      </button>

      <p className="text-xs text-graphite text-center">
        Mot de passe oublié ? <a href="/contact" className="text-ocean hover:underline">Demandez-en un nouveau</a>.
      </p>
    </form>
  );
}
