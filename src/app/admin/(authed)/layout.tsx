import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, clearSessionCookie } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Middleware already guards, but defensive — covers edge cases
  if (!session) {
    redirect("/admin/login");
  }

  async function logoutAction() {
    "use server";
    await clearSessionCookie();
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-sand-deep/40">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          user={{
            name: session.email.split("@")[0],
            email: session.email,
            role: session.role,
          }}
          logoutAction={logoutAction}
        />
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}