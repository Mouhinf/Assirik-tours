import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COOKIE = "ass_client_session";
const COOKIE_DAYS = 7;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET not set");
  return new TextEncoder().encode(secret);
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
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_DAYS}d`)
    .sign(getSecret());
}

export async function getClientSession(): Promise<ClientSessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as ClientSessionPayload;
  } catch {
    return null;
  }
}

export async function setClientSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
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
  const session = await getClientSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/espace-client");
  }
  return session;
}
