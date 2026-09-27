import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, homeForRole, verifySession } from "@/lib/session";

export async function GET() {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  return NextResponse.json(
    session ? { loggedIn: true, name: session.name, panel: homeForRole(session.role) } : { loggedIn: false },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
