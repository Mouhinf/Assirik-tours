import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { AdminUsersClient } from "@/components/admin/users-client";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "users:read")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      twoFactorEnabled: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  const canManage = can(session.role, "users:write");

  return (
    <AdminUsersClient
      users={users as Parameters<typeof AdminUsersClient>[0]["users"]}
      currentUserId={session.sub}
      canManage={canManage}
    />
  );
}
