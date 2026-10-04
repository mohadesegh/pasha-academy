import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession, homeForRole, type Role } from "@/lib/session";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

const PROTECTED: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/agent", roles: ["AGENT"] },
  { prefix: "/dashboard", roles: ["STUDENT"] },
];

const under = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Portals: auth only. They are Persian-only and render per request.
  const rule = PROTECTED.find((r) => under(pathname, r.prefix));
  if (rule) {
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    if (!rule.roles.includes(session.role)) {
      return NextResponse.redirect(new URL(homeForRole(session.role), req.url));
    }
    return NextResponse.next();
  }

  // Someone opened the internal /fa/... or /en/... address: remember the language and show the clean URL.
  const [, first, ...rest] = pathname.split("/");
  if (isLocale(first)) {
    const res = NextResponse.redirect(new URL(`/${rest.join("/")}${search}`, req.url));
    res.cookies.set(LOCALE_COOKIE, first, { path: "/", maxAge: 31536000, sameSite: "lax" });
    return res;
  }

  // Logged-in users don't need the auth pages.
  if (pathname === "/login" || pathname === "/register") {
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (session) return NextResponse.redirect(new URL(homeForRole(session.role), req.url));
  }

  // Public site: serve the prerendered copy for the visitor's language. The URL in the address bar
  // stays the same; only the internal route changes (app/[locale]/...).
  const cookie = req.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookie) ? cookie : DEFAULT_LOCALE;
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except API routes, Next internals and files (anything with an extension, e.g. sitemap.xml,
  // icon.png, sw.js) and the generated Open Graph image.
  matcher: ["/((?!api|_next|opengraph-image|.*\\..*).*)"],
};
