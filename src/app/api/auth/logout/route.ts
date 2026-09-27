import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

async function clear(req: Request, to: string) {
  (await cookies()).delete(SESSION_COOKIE);
  return NextResponse.redirect(new URL(to, req.url), 303);
}

/** Logout button (form POST). */
export async function POST(req: Request) {
  return clear(req, "/");
}

/** Used by server guards to drop a stale session (e.g. the user was deleted). */
export async function GET(req: Request) {
  return clear(req, "/login");
}
