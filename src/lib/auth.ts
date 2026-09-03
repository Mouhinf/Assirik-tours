import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "ass_admin_session";
const COOKIE_DURATION_DAYS = 7;
const ISSUER = "assirik-tours";
const AUDIENCE = "admin";

/**
 * Returns the current and previous secrets. We support secret rotation:
 * `AUTH_SECRET` is the current signing key, `AUTH_SECRET_PREVIOUS` lets
 * us still verify tokens minted before the rotation. New tokens are always
 * signed with the current secret.
 */
function getSecrets(): { current: Uint8Array; previous?: Uint8Array } {
  const current = process.env.AUTH_SECRET;
  if (!current) {
    throw new Error(
      "AUTH_SECRET is not defined. Set it in .env.local (use `openssl rand -hex 32`).",
    );
  }
  const previous = process.env.AUTH_SECRET_PREVIOUS;
  return {
    current: new TextEncoder().encode(current),
    previous: previous ? new TextEncoder().encode(previous) : undefined,
  };
}

export type SessionPayload = {
  sub: string;
  email: string;
  role: "SUPER_ADMIN" | "AGENT" | "COMPTABLE";
};

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

/**
 * Verify a password while keeping timing constant regardless of whether
 * the user exists. Helps prevent user enumeration via response-time analysis.
 */
export async function timingSafeComparePassword(plain: string, hash: string | null | undefined) {
  if (!hash) {
    // Burn comparable CPU so attackers cannot detect "no user" by latency.
    await bcrypt.compare(plain, "$2b$12$abcdefghijklmnopqrstuv");
    return false;
  }
  return bcrypt.compare(plain, hash);
}

export async function signSession(payload: SessionPayload) {
  const { current } = getSecrets();
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_DURATION_DAYS}d`)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .sign(current);
}

async function verifyWith(secret: Uint8Array, token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  const { current, previous } = getSecrets();
  const primary = await verifyWith(current, token);
  if (primary) return primary;
  if (previous) return verifyWith(previous, token);
  return null;
}

/**
 * Reads the current session from the cookie store.
 * Returns null if missing or invalid. Safe to call from any server context.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * COOKIE_DURATION_DAYS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;

/* ─── Login rate-limit (in-memory token bucket) ──────────────────────── */

type Attempt = { count: number; resetAt: number; lockedUntil?: number };
const LOGIN_BUCKET = new Map<string, Attempt>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000;

function clientKey(email: string) {
  // Lowercased, trimmed — caller is expected to do this already.
  return email || "__anon__";
}

/**
 * Throttles login attempts per email + IP. Returns `null` when the caller
 * may proceed, otherwise a user-facing French error message.
 */
export function checkLoginRate(email: string, ip: string | null): string | null {
  const key = `${clientKey(email)}|${ip ?? "?"}`;
  const now = Date.now();
  const bucket = LOGIN_BUCKET.get(key);
  if (bucket?.lockedUntil && bucket.lockedUntil > now) {
    const minutes = Math.ceil((bucket.lockedUntil - now) / 60000);
    return `Trop de tentatives. Compte temporairement verrouillé (${minutes} min).`;
  }
  if (!bucket || bucket.resetAt < now) {
    LOGIN_BUCKET.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  bucket.count += 1;
  if (bucket.count > MAX_ATTEMPTS) {
    bucket.lockedUntil = now + LOCK_DURATION_MS;
    return `Trop de tentatives. Compte temporairement verrouillé (${Math.ceil(LOCK_DURATION_MS / 60000)} min).`;
  }
  return null;
}

export function resetLoginRate(email: string, ip: string | null) {
  LOGIN_BUCKET.delete(`${clientKey(email)}|${ip ?? "?"}`);
}

export async function getRequestIp(): Promise<string | null> {
  // Best-effort: Vercel sets x-forwarded-for / x-real-ip. Header access
  // throws in static contexts; guard with try/catch.
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
