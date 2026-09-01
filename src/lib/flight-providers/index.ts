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
