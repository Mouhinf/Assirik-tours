/**
 * Role-based access control. Three roles map to a coarse matrix.
 *
 * SUPER_ADMIN → everything
 * AGENT       → reservations, destinations, offres, visa, clients
 * COMPTABLE   → read-only on financial surfaces, payments
 */
export type AdminRole = "SUPER_ADMIN" | "AGENT" | "COMPTABLE";

const MATRIX: Record<AdminRole, Set<string>> = {
  SUPER_ADMIN: new Set([
    "dashboard:view",
    "destinations:read", "destinations:write", "destinations:delete",
    "offers:read", "offers:write", "offers:delete",
    "reservations:read", "reservations:write", "reservations:delete",
    "clients:read", "clients:write", "clients:export",
    "visa:read", "visa:write", "visa:delete",
    "payments:read", "payments:refund",
    "media:read", "media:write", "media:delete",
    "users:read", "users:write",
    "settings:read", "settings:write",
    "reports:read",
    "communications:send",
    "audit:read",
  ]),
  AGENT: new Set([
    "dashboard:view",
    "destinations:read", "destinations:write",
    "offers:read", "offers:write",
    "reservations:read", "reservations:write",
    "clients:read", "clients:write",
    "visa:read", "visa:write",
    "media:read", "media:write",
    "settings:read",
    "reports:read",
  ]),
  COMPTABLE: new Set([
    "dashboard:view",
    "destinations:read",
    "offers:read",
    "reservations:read", "reservations:write",
    "clients:read", "clients:export",
    "payments:read", "payments:refund",
    "reports:read",
    "audit:read",
  ]),
};

export function can(role: AdminRole, action: string): boolean {
  return MATRIX[role]?.has(action) ?? false;
}

export function requireRole(session: { role: AdminRole }, action: string) {
  if (!can(session.role, action)) {
    throw new RbacError(session.role, action);
  }
}

export class RbacError extends Error {
  constructor(public role: AdminRole, public action: string) {
    super(`Role "${role}" is not allowed to perform "${action}".`);
    this.name = "RbacError";
  }
}

/** Human-readable role labels (FR). */
export const ROLE_LABELS_FR: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super-admin",
  AGENT: "Agent commercial",
  COMPTABLE: "Comptable",
};
