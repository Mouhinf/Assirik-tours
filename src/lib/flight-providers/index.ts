/**
 * Provider factory — selects the active provider based on `FLIGHT_PROVIDER`.
 *
 * Precedence:
 *   1. If `FLIGHT_PROVIDER=kiwi` AND `KIWI_API_KEY` is set → Kiwi
 *   2. If `FLIGHT_PROVIDER` is unset AND `KIWI_API_KEY` is set → Kiwi (auto)
 *   3. Otherwise → mock (deterministic, offline)
 *
 * The mock is ALWAYS available as a fallback so the UI works in dev/preview
 * without external credentials.
 */
import "server-only";
import type { FlightProvider } from "./provider";
import { mockProvider } from "./mock";
import { kiwiProvider } from "./kiwi";

let _provider: FlightProvider | null = null;

export function getFlightProvider(): FlightProvider {
  if (_provider) return _provider;
  const explicit = (process.env.FLIGHT_PROVIDER ?? "").toLowerCase();
  const hasKiwi = Boolean(process.env.KIWI_API_KEY);

  if ((explicit === "kiwi" || (!explicit && hasKiwi)) && hasKiwi) {
    _provider = kiwiProvider;
  } else {
    _provider = mockProvider;
  }
  return _provider;
}

export function getActiveProviderName(): string {
  return getFlightProvider().name;
}

export function isUsingMockProvider(): boolean {
  return getFlightProvider().name === "mock";
}


/**
 * Read-only diagnostic for the admin /billetterie page. Surfaces which
 * providers are *configured* (env vars present) vs *available* (also known
 * by the factory) without exposing secret values.
 *
 * Extend the `candidates` map when a new provider is added so the admin
 * panel picks it up automatically.
 */
export type ProviderCandidate = {
  key: string; // value to set FLIGHT_PROVIDER to
  name: string; // human-readable
  envVars: string[]; // required/optional env vars that flip "configured"
  description: string;
};

export const PROVIDER_CANDIDATES: ProviderCandidate[] = [
  {
    key: "mock",
    name: "Mock (données simulées)",
    envVars: [],
    description:
      "Provider de développement. Toujours disponible. Tarifs et trajets générés localement — ne pas utiliser en production.",
  },
  {
    key: "kiwi",
    name: "Kiwi.com (Tequila API)",
    envVars: ["KIWI_API_KEY"],
    description:
      "Recherche réelle multi-compagnies. Nécessite un compte Tequila + facturation séparée Kiwi.",
  },
];

export type ProviderStatus = {
  active: {
    key: string;
    name: string;
    configured: boolean;
  };
  /** Provider selection comes from FLIGHT_PROVIDER (read from env). */
  envVar: { name: string; value: string };
  candidates: Array<ProviderCandidate & { configured: boolean }>;
};

function readEnvBool(name: string) {
  const v = (process.env[name] ?? "").trim();
  return v.length > 0;
}

export function getProviderStatus(): ProviderStatus {
  const explicit = (process.env.FLIGHT_PROVIDER ?? "").trim().toLowerCase();
  const activeName = getFlightProvider().name;
  return {
    active: {
      key: activeName,
      name:
        PROVIDER_CANDIDATES.find((c) => c.key === activeName)?.name ?? activeName,
      configured: activeName !== "mock" || Boolean(explicit === "mock"),
    },
    envVar: { name: "FLIGHT_PROVIDER", value: explicit || "(unset → auto)" },
    candidates: PROVIDER_CANDIDATES.map((c) => ({
      ...c,
      configured: c.envVars.every((env) => readEnvBool(env)),
    })),
  };
}

