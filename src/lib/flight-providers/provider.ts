/**
 * Provider interface — every implementation must expose `searchFlights` and
 * a `info()` probe. A single provider is active at runtime, selected by
 * the `FLIGHT_PROVIDER` env var (default: "mock" if no credentials set).
 */
import type {
  FlightOfferResult,
  FlightProviderInfo,
  FlightSearchInput,
} from "./types";

export interface FlightProvider {
  readonly name: string;
  searchFlights(input: FlightSearchInput): Promise<FlightOfferResult[]>;
  info(): FlightProviderInfo;
}
