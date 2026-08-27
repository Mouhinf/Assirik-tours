"use client";

import { useState, useTransition } from "react";
import { begin2FASetup, confirm2FASetup, disable2FA } from "@/lib/auth-actions";

export function TwoFactorCard({ enabled }: { enabled: boolean }) {
  const [setup, setSetup] = useState<{ otpauthUrl: string; secret: string } | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (enabled) {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
        <p className="text-sm text-emerald-900 font-semibold">
          Authentification à deux facteurs activée
        </p>
        <p className="mt-1 text-sm text-emerald-800/85">
          Vous devez saisir un code à 6 chiffres à chaque connexion.
        </p>
        <button
          type="button"
          onClick={() => start(async () => { await disable2FA(); setSuccess("2FA désactivée."); setSetup(null); })}
          className="mt-3 inline-flex items-center rounded-full border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 transition-colors"
        >
          Désactiver la 2FA
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-sand-deep/30 border border-sand-deep p-4">
      <p className="text-sm font-semibold text-navy">Activer la 2FA (recommandé pour super-admin)</p>
      {!setup ? (
        <>
          <p className="mt-1 text-sm text-graphite">
            Une couche de sécurité supplémentaire : à chaque connexion, un code généré par votre application
            d&apos;authentification sera requis.
          </p>
          <button
            type="button"
            onClick={() => start(async () => { setError(null); setSuccess(null); const r = await begin2FASetup(); setSetup({ otpauthUrl: r.otpauthUrl, secret: r.secret }); })}
            className="mt-3 inline-flex items-center rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy transition-colors"
          >
            Démarrer la configuration
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-graphite">
            1. Ouvrez Google Authenticator / 1Password / Authy. 2. Ajoutez un compte avec cette clé :
          </p>
          <pre className="mt-2 select-all rounded-md bg-navy text-sand px-3 py-2 text-xs font-mono break-all">
            {setup.secret}
          </pre>
          <p className="mt-3 text-sm text-graphite">
            Ou collez cette URL : <span className="font-mono break-all">{setup.otpauthUrl}</span>
          </p>
          <label className="mt-3 block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1">
              3. Saisissez le code à 6 chiffres affiché
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
              className="w-32 rounded-lg border border-sand-deep bg-sand px-3 py-2 text-center font-mono tracking-widest text-navy"
            />
          </label>
          {error ? <p className="mt-2 text-sm text-sunrise-coral">{error}</p> : null}
          {success ? <p className="mt-2 text-sm text-emerald-700">{success}</p> : null}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={pending || token.length !== 6}
              onClick={() => start(async () => {
                setError(null); setSuccess(null);
                const r = await confirm2FASetup(token);
                if (!r.ok) { setError(r.error ?? "Erreur"); return; }
                setSuccess("2FA activée. Reconnectez-vous pour la tester.");
                setSetup(null);
                setToken("");
              })}
              className="inline-flex items-center rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-50"
            >
              {pending ? "Vérification…" : "Valider"}
            </button>
            <button
              type="button"
              onClick={() => { setSetup(null); setToken(""); setError(null); }}
              className="inline-flex items-center rounded-full border border-sand-deep px-4 py-2 text-sm font-semibold text-graphite hover:text-navy transition-colors"
            >
              Annuler
            </button>
          </div>
        </>
      )}
    </div>
  );
}
