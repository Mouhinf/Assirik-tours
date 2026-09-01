/**
 * Shared types for the flight provider abstraction.
 *
 * Public-facing shape — providers (Kiwi, Amadeus, Duffel, mock) must map
 * their internal responses into this contract.
 */

export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export type FlightSearchInput = {
  origin: string; // IATA code, e.g. "DSS"
  destination: string; // IATA code, e.g. "CDG"
  departDate: Date;
  returnDate?: Date;
  passengers: number; // 1-9
  cabinClass: CabinClass;
  /** Currency code — defaults to "XOF" (FCFA) for the Senegal market. */
  currency?: string;
};

export type FlightSegment = {
  /** Carrier IATA code (e.g. "AF") */
  carrier: string;
  carrierName?: string;
  flightNumber?: string;
  /** ISO datetime at departure airport */
  departAt: string;
  /** ISO datetime at arrival airport */
  arriveAt: string;
  origin: string; // IATA
  destination: string; // IATA
  durationMinutes: number;
};

export type FlightLeg = {
  segments: FlightSegment[];
  /** Total leg duration in minutes (incl. layovers) */
  totalDurationMinutes: number;
  stopCount: number;
};

export type FlightOfferResult = {
  /** Provider's own identifier — used for the bookingUrl. */
  providerOfferId: string;
  provider: string;
  priceAmount: number;
  priceCurrency: string;
  outbound: FlightLeg;
  inbound?: FlightLeg;
  passengers: number;
  cabinClass: CabinClass;
  expiresAt: Date;
  bookingUrl?: string;
};

export type FlightProviderInfo = {
  name: string;
  configured: boolean;
};
