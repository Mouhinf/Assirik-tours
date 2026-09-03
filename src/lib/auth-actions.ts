"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  clearSessionCookie,
  getSession,
  hashPassword,
  setSessionCookie,
  signSession,
  verifyPassword,
} from "@/lib/auth";
import { generateSecret, verifyTotp, buildOtpAuthUrl } from "@/lib/totp";
import { recordAudit } from "@/lib/audit";
import { requireRole } from "@/lib/rbac";
import {
  checkLoginRate,
  resetLoginRate,
  timingSafeComparePassword,
  getRequestIp,
} from "@/lib/auth";

/* ─── Login / 2FA / logout ─────────────────────────────────── */

const PENDING_2FA_COOKIE = "ass_admin_2fa_pending";

export type LoginState =
  | { stage: "credentials"; error?: string }
  | { stage: "twofactor"; userId: string; error?: string }
  | { stage: "ok"; redirectTo: string };

export async function loginAction(
  _prev: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const token = String(formData.get("token") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/admin");
  const ip = await getRequestIp();

  const rateLimited = checkLoginRate(email, ip);
  if (rateLimited) {
    return { stage: "credentials", error: rateLimited };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  // Constant-time password check whether or not the user exists.
  const ok = await timingSafeComparePassword(password, user?.passwordHash);
  if (!user || !ok) {
    await recordAudit({
      action: "auth.failed",
      metadata: { email, reason: user ? "bad-password" : "no-user", ip },
    });
    return { stage: "credentials", error: "Identifiants incorrects." };
  }
  resetLoginRate(email, ip);

  // 2FA flow — mandatory for SUPER_ADMIN, optional for others.
  if (user.twoFactorEnabled || user.role === "SUPER_ADMIN") {
    if (!token) {
      // First step — stash a short-lived pending cookie and prompt for the code.
      const store = await cookies();
      store.set(PENDING_2FA_COOKIE, user.id, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 5 * 60,
      });
      return { stage: "twofactor", userId: user.id };
    }

    const pending = await getPending2FAUserId();
    if (pending !== user.id) {
      return { stage: "credentials", error: "Session 2FA expirée. Reconnectez-vous." };
    }

    const secret = await prisma.twoFactorCode.findUnique({ where: { userId: user.id } });
    if (!secret || !secret.confirmed) {
      // For SUPER_ADMIN, 2FA must be configured — block login until it is.
      if (user.role === "SUPER_ADMIN") {
        return {
          stage: "credentials",
          error: "Le 2FA est obligatoire pour les super-admins. Contactez un autre super-admin pour le configurer.",
        };
      }
      user.twoFactorEnabled = false;
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { twoFactorEnabled: false },
      });
    } else {
      const valid = await verifyTotp({ secret: secret.secret, token });
      if (!valid) {
        await recordAudit({ action: "auth.failed", metadata: { email, reason: "bad-2fa" } });
        return { stage: "twofactor", userId: user.id, error: "Code invalide ou expiré." };
      }
      await prisma.twoFactorCode.update({
        where: { userId: user.id },
        data: { lastUsed: new Date() },
      });
    }
    const c = await cookies();
    c.delete(PENDING_2FA_COOKIE);
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const jwt = await signSession({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  await setSessionCookie(jwt);

  await recordAudit({
    userId: user.id,
    action: "auth.login",
    metadata: { role: user.role, twoFactor: user.twoFactorEnabled },
  });

  const safeRedirect = redirectTo.startsWith("/") && !redirectTo.startsWith("//")
    ? redirectTo
    : "/admin";
  redirect(safeRedirect);
}

export async function logoutAction() {
  const session = await getSession();
  await clearSessionCookie();
  await recordAudit({ userId: session?.sub ?? null, action: "auth.logout" });
  redirect("/admin/login");
}

async function getPending2FAUserId(): Promise<string | null> {
  const c = await cookies();
  return c.get(PENDING_2FA_COOKIE)?.value ?? null;
}

/* ─── Server-side guards ─────────────────────────────────── */

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requirePermission(action: Parameters<typeof requireRole>[1]) {
  const session = await requireAdmin();
  requireRole(session, action);
  return session;
}

/* ─── 2FA setup ───────────────────────────────────────────── */

export type Setup2FAState = {
  otpauthUrl: string;
  secret: string;
  confirmed: boolean;
  error?: string;
};

export async function begin2FASetup(): Promise<Setup2FAState> {
  const session = await requirePermission("settings:write");
  const secret = await generateSecret();
  await prisma.twoFactorCode.upsert({
    where: { userId: session.sub },
    create: { userId: session.sub, secret, confirmed: false },
    update: { secret, confirmed: false },
  });
  const otpauthUrl = await buildOtpAuthUrl({
    secret,
    accountName: session.email,
    issuer: "Assirik Tours Admin",
  });
  return { otpauthUrl, secret, confirmed: false };
}

export async function confirm2FASetup(token: string): Promise<{ ok: boolean; error?: string }> {
  const session = await requirePermission("settings:write");
  const row = await prisma.twoFactorCode.findUnique({ where: { userId: session.sub } });
  if (!row) return { ok: false, error: "Démarrez la configuration depuis l'écran 2FA." };
  const valid = await verifyTotp({ secret: row.secret, token });
  if (!valid) return { ok: false, error: "Code invalide." };

  await prisma.twoFactorCode.update({
    where: { userId: session.sub },
    data: { confirmed: true },
  });
  await prisma.adminUser.update({
    where: { id: session.sub },
    data: { twoFactorEnabled: true },
  });
  await recordAudit({
    userId: session.sub,
    action: "auth.2fa_enabled",
    metadata: { email: session.email },
  });
  return { ok: true };
}

export async function disable2FA(): Promise<void> {
  const session = await requirePermission("settings:write");
  await prisma.twoFactorCode.deleteMany({ where: { userId: session.sub } });
  await prisma.adminUser.update({
    where: { id: session.sub },
    data: { twoFactorEnabled: false },
  });
}

/* ─── Bootstrap (CLI helper) ──────────────────────────────── */

export async function createAdminUser({
  email,
  password,
  name,
  role = "AGENT",
}: {
  email: string;
  password: string;
  name: string;
  role?: "SUPER_ADMIN" | "AGENT" | "COMPTABLE";
}) {
  const existing = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    return { ok: false, message: "Cet email a déjà un compte admin." };
  }
  const passwordHash = await hashPassword(password);
  await prisma.adminUser.create({
    data: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      role,
    },
  });
  return { ok: true };
}
