import { redirect } from "@tanstack/react-router";

import { auth } from "@/lib/auth";
import { env } from "@/lib/config/t3.config";

function getAllowedEmails() {
  return env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase());
}

export async function requireAdmin(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.email) {
    throw redirect({ to: "/sign-in", search: { redirect: "/admin" } });
  }
  if (!getAllowedEmails().includes(session.user.email.toLowerCase())) {
    throw redirect({ to: "/" });
  }
  return session;
}

export async function checkIsAdmin(request: Request): Promise<boolean> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.email) return false;
  return getAllowedEmails().includes(session.user.email.toLowerCase());
}
