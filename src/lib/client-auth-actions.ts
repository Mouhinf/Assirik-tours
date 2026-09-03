"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  clearClientSessionCookie,
  hashClientPassword,
  setClientSessionCookie,
  signClientSession,
  verifyClientPassword,
  checkClientLoginRate,
  resetClientLoginRate,
  getActiveClientSession,
  getRequestIp,
} from "@/lib/client-auth";
import { recordAudit } from "@/lib/audit";
import {
  checkHoneypot,
  EMAIL_RE,
  isPlausibleInput,
} from "@/lib/validators/public-forms";
import {
  passwordIsStrongEnough,
  type SetPasswordState,
} from "@/lib/client-password-policy";

export type ClientAuthState =
  | { stage: "ok"; error?: string }
  | { stage: "needs_password"; email: string; error?: string }
  | null;

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export { passwordIsStrongEnough };

export async function loginClientAction(
  _prev: ClientAuthState,
  formData: FormData,
): Promise<ClientAuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  // Honeypot — silently succeed and discard the submission.
  if (checkHoneypot(formData)) return { stage: "ok", error: undefined };

  if (!EMAIL_RE.test(email)) {
    return { stage: "ok", error: "Adresse email invalide." };
  }

  const ip = await getRequestIp();
  const rateLimited = checkClientLoginRate(email, ip);
  if (rateLimited) return { stage: "ok", error: rateLimited };

  const account = await prisma.clientAccount.findUnique({ where: { email } });
  if (!account) {
    return {
      stage: "needs_password",
      email,
      error: "Aucun compte lié à cet email. Contactez l'agence pour recevoir un lien d'activation.",
    };
  }

  if (!account.passwordHash) {
    return {
      stage: "needs_password",
      email,
      error: "Mot de passe non défini. Demandez à l'agence de vous envoyer un lien de configuration.",
    };
  }

  const ok = await verifyClientPassword(password, account.passwordHash);
  if (!ok) {
    await recordAudit({
      action: "client.auth.failed",
      metadata: { email, ip, reason: "bad-password" },
    });
    return { stage: "ok", error: "Mot de passe incorrect." };
  }
  resetClientLoginRate(email, ip);

  await prisma.clientAccount.update({ where: { id: account.id }, data: { lastLoginAt: new Date() } });
  const token = await signClientSession({
    sub: account.id,
    email: account.email,
    firstName: account.firstName,
  });
  await setClientSessionCookie(token);
  redirect("/espace-client/dashboard");
}

export async function logoutClientAction() {
  await clearClientSessionCookie();
  redirect("/espace-client");
}

export async function requireClientSession() {
  const session = await getActiveClientSession();
  if (!session) redirect("/espace-client");
  return session;
}

export async function setPasswordAction(
  token: string,
  password: string,
): Promise<SetPasswordState> {
  if (!isPlausibleInput(token) || !password) {
    return { ok: false, error: "Lien invalide." };
  }
  const weak = passwordIsStrongEnough(password);
  if (weak) return { ok: false, error: weak };

  const account = await prisma.clientAccount.findFirst({ where: { verifyToken: token } });
  if (!account) return { ok: false, error: "Lien invalide ou expiré." };
  // The verifyToken is single-use and expires 24h after the link was issued
  // (we use `lastLoginAt` as a proxy; if it has never logged in we use
  // `createdAt`, which is when the account was provisioned by the agency).
  const issuedAt = account.lastLoginAt ?? account.createdAt;
  if (Date.now() - issuedAt.getTime() > VERIFY_TOKEN_TTL_MS) {
    return { ok: false, error: "Ce lien a expiré. Demandez-en un nouveau à l'agence." };
  }

  const passwordHash = await hashClientPassword(password);
  await prisma.clientAccount.update({
    where: { id: account.id },
    data: { passwordHash, verifyToken: null, emailVerified: true },
  });
  await recordAudit({
    action: "client.password.set",
    metadata: { clientAccountId: account.id },
  });
  return { ok: true };
}
