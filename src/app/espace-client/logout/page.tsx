"use server";

import { redirect } from "next/navigation";

export async function logoutClientAction() {
  const { clearClientSessionCookie } = await import("@/lib/client-auth");
  await clearClientSessionCookie();
  redirect("/espace-client");
}

export default async function LogoutClientPage() {
  // Any direct hit on /espace-client/logout (bookmark, back-button, etc.)
  // should still end the session and bounce to the login page.
  await logoutClientAction();
}
