"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-actions";
import { recordAudit } from "@/lib/audit";
import { getFlightProvider, isUsingMockProvider } from "@/lib/flight-providers";
import type {
  CabinClass,
  FlightSearchInput,
  FlightOfferResult,
} from "@/lib/flight-providers/types";
import { notifyAgency } from "@/lib/communications-actions";

/* ── Helpers ────────────────────────────────────────────────────── */

function parseDateOnly(s: string): Date | null {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const CABIN_CLASSES: CabinClass[] = [
  "ECONOMY",
  "PREMIUM_ECONOMY",
  "BUSINESS",
  "FIRST",
];

function parseCabinClass(raw: unknown): CabinClass {
  return typeof raw === "string" && (CABIN_CLASSES as string[]).includes(raw)
    ? (raw as CabinClass)
    : "ECONOMY";
}

/* ── Public search ──────────────────────────────────────────── */

export type PublicSearchPayload = {
  ok: true;
  searchId: string;
  isMock: boolean;
  offers: Array<{
    id: string;
    providerOfferId: string;
    priceAmount: number;
    priceCurrency: string;
    cabinClass: string;
    outbound: unknown;
    inbound: unknown | null;
    passengers: number;
    expiresAt: Date;
    bookingUrl: string | null;
  }>;
} | { error: string };

export async function searchFlightsAction(input: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string | null;
  passengers: number;
  cabinClass?: string;
  currency?: string;
  userEmail?: string | null;
}): Promise<PublicSearchPayload> {
  const origin = input.origin?.trim().toUpperCase() ?? "";
  const destination = input.destination?.trim().toUpperCase() ?? "";
  if (!/^[A-Z]{3}$/.test(origin)) return { error: "Code aéroport de départ invalide (IATA 3 lettres)." };
  if (!/^[A-Z]{3}$/.test(destination)) return { error: "Code aéroport de destination invalide (IATA 3 lettres)." };
  if (origin === destination) return { error: "Les aéroports doivent être différents." };

  const depart = parseDateOnly(input.departDate);
  if (!depart) return { error: "Date de départ invalide." };

  let returnDate: Date | null = null;
  if (input.returnDate) {
    returnDate = parseDateOnly(input.returnDate);
    if (!returnDate) return { error: "Date de retour invalide." };
    if (returnDate.getTime() < depart.getTime()) {
      return { error: "La date de retour doit suivre la date de départ." };
    }
  }

  const passengers = Math.max(1, Math.min(9, Math.trunc(input.passengers || 1)));
  const cabinClass = parseCabinClass(input.cabinClass);
  const provider = getFlightProvider();

  const searchInput: FlightSearchInput = {
    origin,
    destination,
    departDate: depart,
    returnDate: returnDate ?? undefined,
    passengers,
    cabinClass,
    currency: input.currency ?? "XOF",
  };

  // Hit the provider
  let offers;
  try {
    offers = await provider.searchFlights(searchInput);
  } catch (e) {
    console.error("[flight search] provider failed", e);
    return {
      error:
        e instanceof Error
          ? e.message
          : "La recherche a échoué. Réessayez ou contactez-nous.",
    };
  }

  // Persist
  const isMock = isUsingMockProvider();
  const search = await prisma.flightSearch.create({
    data: {
      origin,
      destination,
      departDate: depart,
      returnDate,
      passengers,
      cabinClass,
      provider: provider.name,
      rawResults: { count: offers.length, isMock } as never,
      userEmail: input.userEmail ?? null,
      status: "NEW",
    },
  });

  if (offers.length > 0) {
    await prisma.flightOffer.createMany({
      data: offers.map((o) => ({
        searchId: search.id,
        provider: o.provider,
        providerOfferId: o.providerOfferId,
        priceAmount: o.priceAmount as never,
        priceCurrency: o.priceCurrency,
        outbound: o.outbound as never,
        inbound: (o.inbound ?? null) as never,
        passengers: o.passengers,
        cabinClass: o.cabinClass,
        expiresAt: o.expiresAt,
        bookingUrl: o.bookingUrl ?? null,
      })),
    });
  }

  return {
    ok: true,
    searchId: search.id,
    isMock,
    offers: offers.map((o) => ({
      id: o.providerOfferId,
      providerOfferId: o.providerOfferId,
      priceAmount: o.priceAmount,
      priceCurrency: o.priceCurrency,
      cabinClass: o.cabinClass,
      outbound: o.outbound,
      inbound: o.inbound ?? null,
      passengers: o.passengers,
      expiresAt: o.expiresAt,
      bookingUrl: o.bookingUrl ?? null,
    })),
  };
}

/* ── Quote request ──────────────────────────────────────────── */

export async function requestFlightQuoteAction(formData: FormData) {
  const searchId = String(formData.get("searchId") ?? "");
  const offerId = String(formData.get("offerId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!searchId || !offerId) return { error: "Recherche invalide." };
  if (name.length < 2) return { error: "Le nom est requis." };
  if (!/.+@.+\..+/.test(email)) return { error: "Email invalide." };
  if (phone.length < 5) return { error: "Le téléphone est requis." };

  const search = await prisma.flightSearch.findUnique({ where: { id: searchId } });
  if (!search) return { error: "Recherche introuvable." };

  await prisma.flightSearch.update({
    where: { id: searchId },
    data: {
      status: "QUOTE_REQUESTED",
      quoteName: name,
      quotePhone: phone,
      quoteMessage: message,
      userEmail: email,
    },
  });

  // Audit
  await recordAudit({
    action: "flight.quote.request",
    entity: `flight:${searchId}`,
    metadata: {
      origin: search.origin,
      destination: search.destination,
      departDate: search.departDate.toISOString(),
      offerId,
      name,
      email,
      phone,
    },
  });

  // Notify the agency by email.
  const offer = await prisma.flightOffer.findFirst({
    where: { searchId, providerOfferId: offerId },
  });
  void notifyAgency({
    templateId: "flight.quote_requested",
    vars: {
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      origin: search.origin,
      destination: search.destination,
      departDate: search.departDate.toISOString().slice(0, 10),
      returnDate: search.returnDate?.toISOString().slice(0, 10) ?? "",
      passengers: search.passengers,
      offerPrice: offer?.priceAmount ? String(offer.priceAmount) : "—",
      offerCurrency: offer?.priceCurrency ?? "XOF",
    },
    metadata: { searchId, offerId },
  });

  return { success: true };
}

/* ── Admin helpers ─────────────────────────────────────────── */

export async function listFlightSearchesForAdmin() {
  await requirePermission("flight:read");
  return prisma.flightSearch.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getFlightSearchForAdmin(id: string) {
  await requirePermission("flight:read");
  return prisma.flightSearch.findUnique({
    where: { id },
    include: {
      offers: { orderBy: { priceAmount: "asc" } },
    },
  });
}

export async function archiveFlightSearchAction(formData: FormData) {
  const session = await requirePermission("flight:write");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID manquant." };
  await prisma.flightSearch.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  await recordAudit({
    userId: session.sub,
    action: "flight.search",
    entity: `flight:${id}`,
    metadata: { action: "archive" },
  });
  revalidatePath("/admin/billetterie");
  return { ok: true };
}
