/**
 * Idempotent migration: backfill the new `Reservation.source` column.
 *
 * Rules (deterministic — same input always produces the same output):
 *   - if `tags` contains "Billetterie"               → FLIGHT
 *   - else if `offerId IS NOT NULL`                  → OFFER
 *   - else if destinationId/tags/notes identify a destination → DESTINATION
 *   - else                                           → CONTACT
 *
 * When an offer or an unambiguous destination is found, destinationId is
 * backfilled too. `processingStatus` is populated by its database default.
 *
 * Idempotency: only updates rows where `source = 'CONTACT'` (the default
 * value). Once a row is correctly tagged, re-running is a no-op.
 *
 * Usage: pnpm tsx scripts/migrate-reservation-source.ts
 */
import { PrismaClient, ReservationSource } from "@prisma/client";

const prisma = new PrismaClient();

const TOUCHED = new Set<ReservationSource>([
  ReservationSource.CONTACT,
]);

async function main() {
  const [destinations, offers] = await Promise.all([
    prisma.destination.findMany({
      select: { id: true, slug: true, title: true },
    }),
    prisma.offer.findMany({
      select: { id: true, destinationId: true },
    }),
  ]);
  const offerDestination = new Map(
    offers.map((offer) => [offer.id, offer.destinationId]),
  );

  const rows = await prisma.reservation.findMany({
    where: { source: { in: Array.from(TOUCHED) } },
    select: {
      id: true,
      source: true,
      tags: true,
      offerId: true,
      destinationId: true,
      notes: true,
    },
  });

  let updated = 0;
  let unchanged = 0;
  const buckets: Record<ReservationSource, number> = {
    CONTACT: 0,
    DESTINATION: 0,
    OFFER: 0,
    FLIGHT: 0,
  };

  for (const row of rows) {
    const tags = row.tags.map((tag) => tag.toLocaleLowerCase("fr"));
    const notes = row.notes?.toLocaleLowerCase("fr") ?? "";
    const matchedDestination = destinations.find((destination) => {
      const title = destination.title.toLocaleLowerCase("fr");
      const slug = destination.slug.toLocaleLowerCase("fr");
      return notes.includes(title) || notes.includes(slug);
    });

    let next: ReservationSource;
    if (tags.includes("billetterie")) {
      next = ReservationSource.FLIGHT;
    } else if (row.offerId) {
      next = ReservationSource.OFFER;
    } else if (
      row.destinationId ||
      tags.includes("destination") ||
      matchedDestination
    ) {
      next = ReservationSource.DESTINATION;
    } else {
      next = ReservationSource.CONTACT;
    }
    buckets[next] += 1;
    const destinationId =
      row.destinationId ??
      (row.offerId ? offerDestination.get(row.offerId) : undefined) ??
      matchedDestination?.id ??
      null;
    if (next !== row.source || destinationId !== row.destinationId) {
      await prisma.reservation.update({
        where: { id: row.id },
        data: { source: next, destinationId },
      });
      updated++;
    } else {
      unchanged++;
    }
  }

  const total = await prisma.reservation.count();
  console.log(`✓ ${rows.length} rows scanned · ${updated} updated · ${unchanged} unchanged`);
  console.log(`✓ Buckets: FLIGHT=${buckets.FLIGHT} OFFER=${buckets.OFFER} DESTINATION=${buckets.DESTINATION} CONTACT=${buckets.CONTACT}`);
  console.log(`✓ Total reservations in DB: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
