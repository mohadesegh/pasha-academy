import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession, homeForRole, type Role } from "@/lib/session";

const PROTECTED: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/agent", roles: ["AGENT"] },
  { prefix: "/dashboard", roles: ["STUDENT"] },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  // Logged-in users don't need the auth pages.
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL(homeForRole(session.role), req.url));
  }

  const rule = PROTECTED.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  if (!rule) return NextResponse.next();

  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  if (!rule.roles.includes(session.role)) {
    return NextResponse.redirect(new URL(homeForRole(session.role), req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/agent/:path*", "/dashboard/:path*", "/login", "/register"],
};
