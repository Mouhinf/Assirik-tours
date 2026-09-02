import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { AuditLogClient } from "@/components/admin/audit-client";

export default async function AdminAuditPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "audit:read")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const [logs, users] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.adminUser.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <AuditLogClient initialLogs={logs} users={users} />;
}
