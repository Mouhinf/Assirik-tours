import "server-only";

import { randomUUID } from "node:crypto";

/**
 * Generates a readable reservation reference with enough entropy to make a
 * collision on the database unique index practically impossible.
 */
export function createReservationReference(now = new Date()): string {
  const token = randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `AT-${now.getFullYear()}-${token}`;
}

/** Required unique placeholder for contacts who provide only a phone. */
export function createAnonymousClientEmail(): string {
  return `no-email-${randomUUID()}@assirik.local`;
}
