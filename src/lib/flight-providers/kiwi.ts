/**
 * Kiwi.com Tequila API v2 — search-only integration.
 *
 * Docs: https://tequila.kiwi.com/portal/docs
 * Auth: header `apikey: <KIWI_API_KEY>`
 * Endpoint: GET https://api.tequila.kiwi.com/v2/search
 */
import type { FlightProvider } from "./provider";
import type {
  FlightOfferResult,
  FlightProviderInfo,
  FlightSearchInput,
  FlightLeg,
  FlightSegment,
  CabinClass,
} from "./types";

const KIWI_ENDPOINT = "https://api.tequila.kiwi.com/v2/search";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function cabinToKiwi(cabin: CabinClass): string {
  switch (cabin) {
    case "ECONOMY":
      return "M";
    case "PREMIUM_ECONOMY":
      return "W";
    case "BUSINESS":
      return "C";
    case "FIRST":
      return "F";
  }
}

function kiwiToCabin(s: string | undefined): CabinClass {
  switch (s) {
    case "M":
      return "ECONOMY";
    case "W":
      return "PREMIUM_ECONOMY";
    case "C":
      return "BUSINESS";
    case "F":
      return "FIRST";
    default:
      return "ECONOMY";
  }
}

type KiwiSegment = {
  carrier?: string;
  operating_carrier?: string;
  operating_carrier_name?: string;
  carrier_name?: string;
  flight_no?: number;
  departure?: { scheduled?: string; airport_code?: string };
  arrival?: { scheduled?: string; airport_code?: string };
  duration?: number;
};

type KiwiRoute = {
  airline?: string;
  airline_code?: string;
  a_from?: string;
  a_to?: string;
  bags?: { hand?: number; hold?: number };
  cityCodeFrom?: string;
  cityCodeTo?: string;
  d_time?: number;
  d_time_str?: string;
  a_time?: number;
  a_time_str?: string;
  duration?: number;
  fly_duration?: string;
  return_duration?: number;
  segments?: KiwiSegment[][];
  price?: number;
  currency?: string;
  expires_at?: string;
  deep_link?: string;
  selected_cabin?: string;
};

function buildLeg(route: KiwiRoute): FlightLeg {
  const segs: KiwiSegment[][] = Array.isArray(route.segments) ? route.segments : [];
  const flat: KiwiSegment[] = segs.flat().filter(Boolean);
  const segments: FlightSegment[] = flat.map((s) => ({
    carrier: s.operating_carrier ?? s.carrier ?? route.airline_code ?? "",
    carrierName:
      s.operating_carrier_name ?? s.carrier_name ?? route.airline,
    flightNumber:
      s.flight_no != null
        ? `${s.operating_carrier ?? s.carrier ?? route.airline_code ?? ""}${s.flight_no}`
        : undefined,
    departAt:
      s.departure?.scheduled ??
      (route.d_time != null ? new Date(route.d_time * 1000).toISOString() : ""),
    arriveAt:
      s.arrival?.scheduled ??
      (route.a_time != null ? new Date(route.a_time * 1000).toISOString() : ""),
    origin: s.departure?.airport_code ?? route.cityCodeFrom ?? route.a_from ?? "",
    destination: s.arrival?.airport_code ?? route.cityCodeTo ?? route.a_to ?? "",
    durationMinutes:
      typeof s.duration === "number" ? Math.round(s.duration / 60) : 0,
  }));

  const totalDurationMinutes =
    typeof route.duration === "number"
      ? Math.round(route.duration / 60)
      : segments.reduce((acc, s) => acc + s.durationMinutes, 0);

  return {
    segments,
    totalDurationMinutes,
    stopCount: Math.max(0, segs.length - 1),
  };
}

export const kiwiProvider: FlightProvider = {
  name: "kiwi",

  info(): FlightProviderInfo {
    return {
      name: "kiwi",
      configured: Boolean(process.env.KIWI_API_KEY),
    };
  },

  async searchFlights(input: FlightSearchInput): Promise<FlightOfferResult[]> {
    const apiKey = process.env.KIWI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "KIWI_API_KEY is not configured. Add it to .env.local or set FLIGHT_PROVIDER=mock.",
      );
    }

    const params = new URLSearchParams({
      fly_from: input.origin,
      fly_to: input.destination,
      date_from: isoDate(input.departDate),
      date_to: isoDate(input.departDate),
      adults: String(input.passengers),
      selected_cabins: cabinToKiwi(input.cabinClass),
      curr: input.currency ?? "XOF",
      locale: "fr",
      limit: "20",
      sort: "price",
      one_for_city: "0",
      max_stopovers: "2",
      partner: "assirik-tours",
    });

    if (input.returnDate) {
      params.set("return_from", isoDate(input.returnDate));
      params.set("return_to", isoDate(input.returnDate));
      params.set("flight_type", "round");
    } else {
      params.set("flight_type", "oneway");
    }

    const res = await fetch(`${KIWI_ENDPOINT}?${params.toString()}`, {
      method: "GET",
      headers: { apikey: apiKey },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Kiwi API error ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as { data?: KiwiRoute[] };
    const data = Array.isArray(json.data) ? json.data : [];

    return data.map((route, idx): FlightOfferResult => {
      const outbound = buildLeg(route);
      const price = typeof route.price === "number" ? route.price : 0;
      const expires =
        route.expires_at && !Number.isNaN(Date.parse(route.expires_at))
          ? new Date(route.expires_at)
          : new Date(Date.now() + 30 * 60 * 1000);

      return {
        providerOfferId: `kiwi-${idx}-${route.airline_code ?? "x"}`,
        provider: "kiwi",
        priceAmount: price,
        priceCurrency: route.currency ?? input.currency ?? "EUR",
        outbound,
        inbound: undefined,
        passengers: input.passengers,
        cabinClass: kiwiToCabin(route.selected_cabin),
        expiresAt: expires,
        bookingUrl: route.deep_link,
      };
    });
  },
};
