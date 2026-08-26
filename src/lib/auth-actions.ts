"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  clearSessionCookie,
  getSession,
  hashPassword,
  setSessionCookie,
  signSession,
  verifyPassword,
} from "@/lib/auth";

/* ─── Login / logout ──────────────────────────────────────────── */

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/admin");

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    return { error: "Identifiants incorrects." };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { error: "Identifiants incorrects." };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await signSession({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  await setSessionCookie(token);

  // Prevent open-redirect: only allow same-origin paths
  const safeRedirect = redirectTo.startsWith("/") && !redirectTo.startsWith("//")
    ? redirectTo
    : "/admin";
  redirect(safeRedirect);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

/* ─── Server-side guards ──────────────────────────────────────── */

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/* ─── Bootstrap (CLI helper) ──────────────────────────────────── */

/**
 * Create the first super-admin from CLI / one-off script.
 * Called by `pnpm tsx scripts/create-admin.ts`.
 */
export async function createAdminUser({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
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
      role: "SUPER_ADMIN",
    },
  });
  return { ok: true };
}