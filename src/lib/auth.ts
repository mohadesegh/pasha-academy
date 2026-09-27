import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, verifySession, type Role } from "./session";

export async function getCurrentUser() {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, email: true, phone: true, role: true, agentStatus: true, companyName: true, city: true },
  });
  return user ? { ...user, role: user.role as Role } : null;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Use in server components / pages. Redirects when not allowed. */
export async function requireRole(...roles: Role[]) {
  const user = await getCurrentUser();
  // A signed cookie without a matching user must be cleared, otherwise middleware
  // (which only checks the signature) would bounce between /login and the panel.
  if (!user) redirect("/api/auth/logout");
  if (!roles.includes(user.role)) redirect("/");
  return user;
}

/** Use in route handlers. Returns null when not allowed. Pending agents get no API access. */
export async function apiUser(...roles: Role[]) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (roles.length && !roles.includes(user.role)) return null;
  if (user.role === "AGENT" && user.agentStatus !== "APPROVED") return null;
  return user;
}
