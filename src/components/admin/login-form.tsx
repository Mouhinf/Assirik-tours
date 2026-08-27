"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/auth-actions";

export function LoginForm({
  redirectTo,
  initialError,
}: {
  redirectTo: string;
  initialError?: string;
}) {
  const [state, formAction, isPending] = useActionState<LoginState | null, FormData>(
    loginAction,
    null,
  );

  const stage = state?.stage ?? "credentials";

  return (
    <form action={formAction} className="space-y-4">
      {stage !== "twofactor" ? (
        <>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full rounded-lg border border-sand-deep bg-sand-deep/40 px-3 py-2.5 text-sm text-navy placeholder:text-silver focus:border-ocean focus:bg-sand outline-none"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Mot de passe
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-sand-deep bg-sand-deep/40 px-3 py-2.5 text-sm text-navy placeholder:text-silver focus:border-ocean focus:bg-sand outline-none"
            />
          </label>
        </>
      ) : (
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
            Code 2FA (6 chiffres)
          </span>
          <input
            name="token"
            type="text"
            required
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            autoFocus
            autoComplete="one-time-code"
            className="w-full rounded-lg border border-sand-deep bg-sand-deep/40 px-3 py-2.5 text-base font-mono text-navy tracking-widest focus:border-ocean focus:bg-sand outline-none"
            placeholder="••••••"
          />
          <p className="mt-2 text-xs text-graphite">
            Ouvrez votre application d&apos;authentification (Google Authenticator, 1Password, Authy).
          </p>
        </label>
      )}

      <input type="hidden" name="redirect" value={redirectTo} />

      {state && "error" in state && state.error ? (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-3 py-2 text-sm text-sunrise-coral">
          {state.error}
        </p>
      ) : initialError ? (
        <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-3 py-2 text-sm text-sunrise-coral">
          {initialError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-ocean px-5 py-3 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
      >
        {isPending ? "Connexion…" : stage === "twofactor" ? "Vérifier le code" : "Se connecter"}
      </button>
    </form>
  );
}
