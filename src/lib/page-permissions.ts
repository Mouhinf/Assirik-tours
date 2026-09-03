import { redirect } from "next/navigation";
import { requirePermission, requireAdmin } from "@/lib/auth-actions";
import { can, type AdminRole } from "@/lib/rbac";

/**
 * Gate an admin page by RBAC. Returns the session on success; redirects to
 * /admin on insufficient permissions.
 *
 * Usage:
 *   const session = await requirePagePermission("destinations:write");
 */
export async function requirePagePermission(
  permission: Parameters<typeof can>[1],
  fallback: "/admin" | "/admin/login" = "/admin",
) {
  const session = await requireAdmin();
  if (!can(session.role, permission)) {
    redirect(fallback);
  }
  return session;
}

/**
 * Same as requirePagePermission but returns a `Forbidden` component instead
 * of redirecting. Useful for pages where we want to render a friendly
 * "you don't have access to this screen" message instead of bouncing.
 */
export async function pageHasPermission(
  role: AdminRole,
  permission: Parameters<typeof can>[1],
): Promise<boolean> {
  return can(role, permission);
}

export { requirePermission, requireAdmin };
