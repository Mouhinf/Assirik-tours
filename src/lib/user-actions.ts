"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { recordAudit } from "@/lib/audit";
import { hashPassword } from "@/lib/auth";
import type { AdminRole } from "@/lib/rbac";

export type UserFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    general?: string[];
  };
  success?: boolean;
  message?: string;
};

export async function createUserAction(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await getSession();
  if (!session) return { errors: { general: ["Non autorisé."] } };
  try {
    requireRole(session, "users:write");
  } catch {
    return { errors: { general: ["Accès refusé."] } };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "AGENT") as AdminRole;

  if (!name) return { errors: { name: ["Le nom est requis."] } };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { errors: { email: ["Email invalide."] } };
  }
  if (!password || password.length < 8) {
    return { errors: { password: ["8 caractères minimum."] } };
  }
  if (!["SUPER_ADMIN", "AGENT", "COMPTABLE"].includes(role)) {
    return { errors: { role: ["Rôle invalide."] } };
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ["Cet email a déjà un compte."] } };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.adminUser.create({
    data: { email, name, passwordHash, role },
  });

  await recordAudit({
    userId: session.sub,
    action: "user.create",
    entity: user.id,
    metadata: { email, name, role },
  });

  revalidatePath("/admin/users");
  return { success: true, message: `Compte ${name} créé.` };
}

export async function updateUserAction(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await getSession();
  if (!session) return { errors: { general: ["Non autorisé."] } };
  try {
    requireRole(session, "users:write");
  } catch {
    return { errors: { general: ["Accès refusé."] } };
  }

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as AdminRole;

  if (!id) return { errors: { general: ["ID manquant."] } };
  if (!name) return { errors: { name: ["Le nom est requis."] } };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { errors: { email: ["Email invalide."] } };
  }
  if (password && password.length < 8) {
    return { errors: { password: ["8 caractères minimum si fourni."] } };
  }
  if (!["SUPER_ADMIN", "AGENT", "COMPTABLE"].includes(role)) {
    return { errors: { role: ["Rôle invalide."] } };
  }

  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) return { errors: { general: ["Utilisateur introuvable."] } };

  const emailConflict = await prisma.adminUser.findFirst({
    where: { email, NOT: { id } },
  });
  if (emailConflict) return { errors: { email: ["Cet email est déjà pris."] } };

  const data: Parameters<typeof prisma.adminUser.update>[0]["data"] = {
    name,
    email,
    role,
  };
  if (password) {
    data.passwordHash = await hashPassword(password);
  }

  await prisma.adminUser.update({ where: { id }, data });

  await recordAudit({
    userId: session.sub,
    action: "user.update",
    entity: id,
    metadata: { name, email, role, passwordChanged: !!password },
  });

  revalidatePath("/admin/users");
  return { success: true, message: `Compte ${name} mis à jour.` };
}

export async function deleteUserAction(
  id: string,
): Promise<{ success?: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Non autorisé." };
  try {
    requireRole(session, "users:write");
  } catch {
    return { error: "Accès refusé." };
  }

  if (id === session.sub) return { error: "Vous ne pouvez pas vous supprimer." };

  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (!user) return { error: "Utilisateur introuvable." };

  await prisma.adminUser.delete({ where: { id } });

  await recordAudit({
    userId: session.sub,
    action: "user.delete",
    entity: id,
    metadata: { email: user.email, name: user.name },
  });

  revalidatePath("/admin/users");
  return { success: true };
}
