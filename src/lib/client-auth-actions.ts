"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  clearClientSessionCookie,
  getClientSession,
  hashClientPassword,
  setClientSessionCookie,
  signClientSession,
  verifyClientPassword,
} from "@/lib/client-auth";

export type ClientAuthState =
  | { stage: "ok"; error?: string }
  | { stage: "needs_password"; email: string; error?: string }
  | null;

export async function loginClientAction(
  _prev: ClientAuthState,
  formData: FormData,
): Promise<ClientAuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email) return { stage: "ok", error: "Email requis." };

  const account = await prisma.clientAccount.findUnique({ where: { email } });
  if (!account) {
    return { stage: "needs_password", email, error: "Aucun compte lié à cet email. Contactez l'agence pour recevoir un lien d'activation." };
  }

  if (!account.passwordHash) {
    return { stage: "needs_password", email, error: "Mot de passe non défini. Demandez à l'agence de vous envoyer un lien de configuration." };
  }

  const ok = await verifyClientPassword(password, account.passwordHash);
  if (!ok) return { stage: "ok", error: "Mot de passe incorrect." };

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
  const session = await getClientSession();
  if (!session) redirect("/espace-client");
  return session;
}

export async function setPasswordAction(token: string, password: string) {
  // Token is a verifyToken issued via the admin (manual or magic link).
  // Simplified for the scaffold — production should add expiry + email.
  const account = await prisma.clientAccount.findFirst({
    where: { verifyToken: token },
  });
  if (!account) return { ok: false, error: "Lien invalide ou expiré." };
  const passwordHash = await hashClientPassword(password);
  await prisma.clientAccount.update({
    where: { id: account.id },
    data: { passwordHash, verifyToken: null, emailVerified: true },
  });
  return { ok: true, email: account.email };
}
