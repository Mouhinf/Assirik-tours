/**
 * Admin-managed configuration for the /billetterie module.
 *
 * The FlightConfig singleton row carries **notes** (internal comments for the
 * team) and **optional contact overrides**. The active flight provider itself
 * stays in the `FLIGHT_PROVIDER` environment variable — provider selection is
 * infrastructure, not business config. See `/docs/flight-provider.md`.
 */
import "server-only";
import { prisma } from "@/lib/prisma";

export type FlightConfigView = {
  notes: string;
  contactEmail: string;
  contactPhone: string;
  updatedAt: Date | null;
};

const EMPTY: FlightConfigView = {
  notes: "",
  contactEmail: "",
  contactPhone: "",
  updatedAt: null,
};

export async function getFlightConfig(): Promise<FlightConfigView> {
  const row = await prisma.flightConfig.findUnique({ where: { id: "singleton" } });
  if (!row) return EMPTY;
  return {
    notes: row.notes ?? "",
    contactEmail: row.contactEmail ?? "",
    contactPhone: row.contactPhone ?? "",
    updatedAt: row.updatedAt,
  };
}

export async function saveFlightConfig(input: {
  notes?: string;
  contactEmail?: string;
  contactPhone?: string;
}) {
  const data = {
    notes: input.notes ?? "",
    contactEmail: input.contactEmail ?? "",
    contactPhone: input.contactPhone ?? "",
  };
  await prisma.flightConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });
}
