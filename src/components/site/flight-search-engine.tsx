"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { searchFlightsAction } from "@/lib/flight-actions";
import {
  POPULAR_AIRPORTS,
  searchAirports,
  type Airport,
} from "@/lib/flight-providers/airports";

type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

type Offer = {
  id: string;
  providerOfferId: string;
  priceAmount: number;
  priceCurrency: string;
  cabinClass: string;
  outbound: {
    totalDurationMinutes: number;
    stopCount: number;
    segments: Array<{
      carrier: string;
      carrierName?: string;
      flightNumber?: string;
      departAt: string;
      arriveAt: string;
      origin: string;
      destination: string;
      durationMinutes: number;
    }>;
  };
  inbound: null | {
    totalDurationMinutes: number;
    stopCount: number;
    segments: Array<{
      carrier: string;
      carrierName?: string;
      flightNumber?: string;
      departAt: string;
      arriveAt: string;
      origin: string;
      destination: string;
      durationMinutes: number;
    }>;
  };
  passengers: number;
  expiresAt: string;
  bookingUrl: string | null;
};

const CABIN_LABELS: Record<CabinClass, string> = {
  ECONOMY: "Économique",
  PREMIUM_ECONOMY: "Premium Économique",
  BUSINESS: "Business",
  FIRST: "Première",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatPrice(amount: number, currency: string): string {
  if (currency === "XOF") {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  }
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, "0")}`;
}

function formatDateTime(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function AirportInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState(() => {
    const found = POPULAR_AIRPORTS.find((a) => a.code === value);
    return found ? `${found.city} (${found.code})` : "";
  });
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchAirports(query), [query]);

  return (
    <div className="relative">
      <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
        {label}
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
        autoComplete="off"
      />
      {open && results.length > 0 ? (
        <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-sand-deep bg-sand shadow-lift">
          {results.map((a) => (
            <li key={a.code}>
              <button
                type="button"
                onMouseDown={() => {
                  onChange(a.code);
                  setQuery(`${a.city} (${a.code})`);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-sand-deep"
              >
                <span className="text-sm text-navy">
                  <span className="font-semibold">{a.city}</span>
                  <span className="ml-1 text-xs text-silver">{a.country}</span>
                </span>
                <span className="font-mono text-xs font-semibold text-ocean">{a.code}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function FlightSearchEngine() {
  const [origin, setOrigin] = useState("DSS");
  const [destination, setDestination] = useState("CDG");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [roundTrip, setRoundTrip] = useState(true);
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState<CabinClass>("ECONOMY");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [searchId, setSearchId] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isMock, setIsMock] = useState(false);
  const [sort, setSort] = useState<"price" | "duration" | "departure">("price");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await searchFlightsAction({
        origin,
        destination,
        departDate,
        returnDate: roundTrip ? returnDate : null,
        passengers,
        cabinClass,
        currency: "XOF",
      });
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setSearchId(res.searchId);
      setOffers(res.offers as unknown as Offer[]);
      setIsMock(res.isMock);
    });
  }

  const sortedOffers = useMemo(() => {
    const arr = [...offers];
    if (sort === "price") arr.sort((a, b) => a.priceAmount - b.priceAmount);
    if (sort === "duration")
      arr.sort(
        (a, b) =>
          a.outbound.totalDurationMinutes - b.outbound.totalDurationMinutes,
      );
    if (sort === "departure")
      arr.sort(
        (a, b) =>
          new Date(a.outbound.segments[0]?.departAt ?? 0).getTime() -
          new Date(b.outbound.segments[0]?.departAt ?? 0).getTime(),
      );
    return arr;
  }, [offers, sort]);

  return (
    <section className="container-narrow pb-10">
      {isMock ? (
        <p className="mb-4 rounded-lg border border-sunrise-orange/30 bg-sunrise-orange/10 px-4 py-2 text-xs text-sunrise-amber">
          ⚠ Données simulées — le provider Kiwi n&apos;est pas encore configuré. Résultats indicatifs pour le développement.
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-sand-deep bg-sand p-5 md:p-6 space-y-4"
      >
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={roundTrip}
              onChange={() => setRoundTrip(true)}
              className="h-4 w-4 text-ocean focus:ring-ocean"
            />
            <span className="text-navy">Aller-retour</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={!roundTrip}
              onChange={() => setRoundTrip(false)}
              className="h-4 w-4 text-ocean focus:ring-ocean"
            />
            <span className="text-navy">Aller simple</span>
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <AirportInput
            label="Départ de"
            value={origin}
            onChange={setOrigin}
            placeholder="Dakar (DSS)…"
          />
          <AirportInput
            label="Destination"
            value={destination}
            onChange={setDestination}
            placeholder="Paris (CDG)…"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Date aller
            </span>
            <input
              type="date"
              value={departDate}
              min={todayISO()}
              onChange={(e) => setDepartDate(e.target.value)}
              required
              className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
            />
          </label>
          {roundTrip ? (
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
                Date retour
              </span>
              <input
                type="date"
                value={returnDate}
                min={departDate || todayISO()}
                onChange={(e) => setReturnDate(e.target.value)}
                required
                className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
              />
            </label>
          ) : (
            <div />
          )}
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Passagers
            </span>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n} {n > 1 ? "passagers" : "passager"}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-graphite mb-1.5">
              Classe
            </span>
            <select
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value as CabinClass)}
              className="min-h-11 w-full rounded-lg border border-sand-deep bg-sand px-3 py-2.5 text-base text-navy outline-none focus:border-ocean md:text-sm"
            >
              {(Object.keys(CABIN_LABELS) as CabinClass[]).map((c) => (
                <option key={c} value={c}>
                  {CABIN_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-sand hover:bg-navy transition-colors disabled:opacity-60"
            >
              {pending ? "Recherche en cours…" : "Rechercher"}
            </button>
          </div>
        </div>

        {error ? (
          <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
            {error}
          </p>
        ) : null}
      </form>

      {offers.length > 0 ? (
        <div className="mt-8 space-y-4">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-navy">
              {offers.length} vol{offers.length > 1 ? "s" : ""} trouvé
              {offers.length > 1 ? "s" : ""}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-graphite">Trier par</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-md border border-sand-deep bg-sand px-2 py-1 text-sm text-navy"
              >
                <option value="price">Prix</option>
                <option value="duration">Durée</option>
                <option value="departure">Départ</option>
              </select>
            </label>
          </header>

          <ol className="space-y-3">
            {sortedOffers.map((o) => (
              <li
                key={o.id}
                className="rounded-xl border border-sand-deep bg-sand p-4 md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy">
                      {o.outbound.segments[0]?.carrierName ??
                        o.outbound.segments[0]?.carrier}
                    </p>
                    <p className="text-xs text-graphite">
                      {o.outbound.segments[0]?.flightNumber} ·{" "}
                      {CABIN_LABELS[o.cabinClass as CabinClass] ?? o.cabinClass}
                    </p>
                    <p className="mt-2 text-sm text-graphite">
                      <span className="font-mono font-semibold text-navy">
                        {o.outbound.segments[0]?.origin}
                      </span>{" "}
                      {formatDateTime(o.outbound.segments[0]?.departAt)} →{" "}
                      <span className="font-mono font-semibold text-navy">
                        {o.outbound.segments[o.outbound.segments.length - 1]?.destination}
                      </span>{" "}
                      {formatDateTime(o.outbound.segments[o.outbound.segments.length - 1]?.arriveAt)}
                    </p>
                    <p className="mt-1 text-xs text-graphite">
                      {formatDuration(o.outbound.totalDurationMinutes)} ·{" "}
                      {o.outbound.stopCount === 0
                        ? "Direct"
                        : `${o.outbound.stopCount} escale${o.outbound.stopCount > 1 ? "s" : ""}`}
                    </p>
                    {o.inbound ? (
                      <p className="mt-1 text-xs text-silver">
                        Retour : {formatDateTime(o.inbound.segments[0]?.departAt)}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-display text-2xl font-semibold text-navy">
                      {formatPrice(o.priceAmount, o.priceCurrency)}
                    </p>
                    <p className="text-xs text-silver">
                      {o.passengers} passager{o.passengers > 1 ? "s" : ""}
                    </p>
                    {searchId ? (
                      <Link
                        href={`/billetterie/${searchId}?offer=${encodeURIComponent(o.providerOfferId)}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-sand hover:bg-navy transition-colors"
                      >
                        Sélectionner
                      </Link>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
