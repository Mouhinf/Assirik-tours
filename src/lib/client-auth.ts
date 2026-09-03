import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COOKIE = "ass_client_session";
const COOKIE_DAYS = 7;
const ISSUER = "assirik-tours";
const AUDIENCE = "client";

function getSecrets(): { current: Uint8Array; previous?: Uint8Array } {
  const current = process.env.AUTH_SECRET;
  if (!current) throw new Error("AUTH_SECRET not set");
  const previous = process.env.AUTH_SECRET_PREVIOUS;
  return {
    current: new TextEncoder().encode(current),
    previous: previous ? new TextEncoder().encode(previous) : undefined,
  };
}

export type ClientSessionPayload = {
  sub: string;
  email: string;
  firstName: string;
};

export async function hashClientPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export async function verifyClientPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function signClientSession(payload: ClientSessionPayload) {
  const { current } = getSecrets();
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_DAYS}d`)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .sign(current);
}

async function verifyWith(secret: Uint8Array, token: string): Promise<ClientSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload as unknown as ClientSessionPayload;
  } catch {
    return null;
  }
}

export async function getClientSession(): Promise<ClientSessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const { current, previous } = getSecrets();
  const primary = await verifyWith(current, token);
  if (primary) return primary;
  if (previous) return verifyWith(previous, token);
  return null;
}

/**
 * Returns the session if it is still backed by a live, non-deleted account.
 * This is the version used by all authenticated client routes — it prevents
 * a stale JWT from surviving account deletion or deactivation.
 */
export async function getActiveClientSession(): Promise<ClientSessionPayload | null> {
  const session = await getClientSession();
  if (!session) return null;
  const account = await prisma.clientAccount.findUnique({ where: { id: session.sub } });
  if (!account) return null;
  return session;
}

export async function setClientSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * COOKIE_DAYS,
  });
}

export async function clearClientSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Find or create a ClientAccount from a verified email (used in the
 *  magic-link / password setup flow). */
export async function ensureClientAccount(opts: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  return prisma.clientAccount.upsert({
    where: { email: opts.email.toLowerCase() },
    create: {
      email: opts.email.toLowerCase(),
      firstName: opts.firstName,
      lastName: opts.lastName,
      phone: opts.phone,
      passwordHash: "",
      emailVerified: false,
    },
    update: {
      firstName: opts.firstName,
      lastName: opts.lastName,
      phone: opts.phone,
    },
  });
}


/** Redirect to /espace-client if no client session. */
export async function requireClientSession() {
  const session = await getActiveClientSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/espace-client");
  }
  return session;
}

/** Same as requireClientSession but also exports the active variant directly
 *  for callers that need a strictly live account (e.g. the dashboard). */
export const requireActiveClientSession = requireClientSession;

/* ─── Login rate-limit (in-memory token bucket) ──────────────────────── */

type Attempt = { count: number; resetAt: number; lockedUntil?: number };
const BUCKET = new Map<string, Attempt>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000;

export function checkClientLoginRate(email: string, ip: string | null): string | null {
  const key = `${email || "__anon__"}|${ip ?? "?"}`;
  const now = Date.now();
  const b = BUCKET.get(key);
  if (b?.lockedUntil && b.lockedUntil > now) {
    const min = Math.ceil((b.lockedUntil - now) / 60000);
    return `Trop de tentatives. Réessayez dans ${min} min.`;
  }
  if (!b || b.resetAt < now) {
    BUCKET.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  b.count += 1;
  if (b.count > MAX_ATTEMPTS) {
    b.lockedUntil = now + LOCK_DURATION_MS;
    return `Trop de tentatives. Réessayez dans ${Math.ceil(LOCK_DURATION_MS / 60000)} min.`;
  }
  return null;
}

export function resetClientLoginRate(email: string, ip: string | null) {
  BUCKET.delete(`${email || "__anon__"}|${ip ?? "?"}`);
}

export async function getRequestIp(): Promise<string | null> {
  try {
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null
    );
  } catch {
    return null;
  }
}
