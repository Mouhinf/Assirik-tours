/**
 * Mock flight provider — returns realistic-looking offers without hitting
 * any external API. Used when no real provider is configured (the default
 * in dev / preview environments). Marked clearly in the UI as "Données
 * simulées" so the admin doesn't think it's live data.
 */
import type { FlightProvider } from "./provider";
import type {
  FlightOfferResult,
  FlightProviderInfo,
  FlightSearchInput,
  CabinClass,
} from "./types";

const CABIN_MULT: Record<CabinClass, number> = {
  ECONOMY: 1,
  PREMIUM_ECONOMY: 1.5,
  BUSINESS: 2.8,
  FIRST: 4.5,
};

function deterministicSeed(input: FlightSearchInput): number {
  const key = `${input.origin}-${input.destination}-${input.departDate.toISOString().slice(0, 10)}`;
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function priceFor(
  input: FlightSearchInput,
  baseFCFA: number,
  hours: number,
  stops: number,
): number {
  const cabinMult = CABIN_MULT[input.cabinClass];
  const perKm = 75; // rough XOF/km average for African routes
  const durationFactor = 1 + (hours - 5) * 0.04;
  const stopPenalty = 1 + stops * 0.08;
  const passengerMult = Math.max(1, input.passengers);
  const base = baseFCFA * cabinMult * durationFactor * stopPenalty;
  const noise = 0.92 + ((Math.sin(baseFCFA) + 1) / 2) * 0.18;
  return Math.round((base * noise * passengerMult) / 1000) * 1000;
}

function makeOffers(input: FlightSearchInput): FlightOfferResult[] {
  const seed = deterministicSeed(input);
  const carriers = [
    { code: "AF", name: "Air France" },
    { code: "TK", name: "Turkish Airlines" },
    { code: "ET", name: "Ethiopian Airlines" },
    { code: "KQ", name: "Kenya Airways" },
    { code: "AT", name: "Royal Air Maroc" },
    { code: "HC", name: "Air Senegal" },
  ];

  const baseDepart = new Date(input.departDate);
  baseDepart.setHours(8, 0, 0, 0);
  const offers: FlightOfferResult[] = [];
  const baseFCFA = 320_000;

  for (let i = 0; i < 8; i++) {
    const carrier = carriers[(seed + i * 7) % carriers.length];
    const stops = i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2;
    const hoursOut = 4 + ((seed >> (i * 2)) % 7) + stops * 1.5;
    const durationMinutes = Math.round(hoursOut * 60);
    const depart = new Date(baseDepart.getTime() + i * 90 * 60 * 1000);
    const arrive = new Date(depart.getTime() + durationMinutes * 60 * 1000);

    const outbound = {
      totalDurationMinutes: durationMinutes,
      stopCount: stops,
      segments: [
        {
          carrier: carrier.code,
          carrierName: carrier.name,
          flightNumber: `${carrier.code}${100 + ((seed + i * 13) % 800)}`,
          departAt: depart.toISOString(),
          arriveAt: arrive.toISOString(),
          origin: input.origin,
          destination: input.destination,
          durationMinutes,
        },
        ...(stops > 0
          ? [
              {
                carrier: carriers[(seed + i * 11) % carriers.length].code,
                carrierName: carriers[(seed + i * 11) % carriers.length].name,
                flightNumber: `${carriers[(seed + i * 11) % carriers.length].code}${200 + ((seed + i * 17) % 800)}`,
                departAt: new Date(depart.getTime() + 3 * 3600 * 1000).toISOString(),
                arriveAt: new Date(depart.getTime() + 5 * 3600 * 1000).toISOString(),
                origin: input.destination,
                destination: input.destination,
                durationMinutes: 120,
              },
            ]
          : []),
      ],
    };

    let inbound;
    if (input.returnDate) {
      const baseReturn = new Date(input.returnDate);
      baseReturn.setHours(14, 30, 0, 0);
      const returnStops = (stops + 1) % 3;
      const retHours = hoursOut + 0.5;
      const retDur = Math.round(retHours * 60);
      inbound = {
        totalDurationMinutes: retDur,
        stopCount: returnStops,
        segments: [
          {
            carrier: carrier.code,
            carrierName: carrier.name,
            flightNumber: `${carrier.code}${300 + ((seed + i * 19) % 800)}`,
            departAt: baseReturn.toISOString(),
            arriveAt: new Date(baseReturn.getTime() + retDur * 60 * 1000).toISOString(),
            origin: input.destination,
            destination: input.origin,
            durationMinutes: retDur,
          },
        ],
      };
    }

    offers.push({
      providerOfferId: `mock-${input.origin}-${input.destination}-${i}`,
      provider: "mock",
      priceAmount: priceFor(input, baseFCFA, hoursOut, stops),
      priceCurrency: input.currency ?? "XOF",
      outbound,
      inbound,
      passengers: input.passengers,
      cabinClass: input.cabinClass,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
  }

  return offers.sort((a, b) => a.priceAmount - b.priceAmount);
}

export const mockProvider: FlightProvider = {
  name: "mock",
  info(): FlightProviderInfo {
    return { name: "mock", configured: true };
  },
  async searchFlights(input: FlightSearchInput): Promise<FlightOfferResult[]> {
    return makeOffers(input);
  },
};
