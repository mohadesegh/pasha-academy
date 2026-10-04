import "server-only";
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "./db";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export const unauthorized = () => fail("دسترسی غیرمجاز", 401);
export const notFound = () => fail("مورد یافت نشد", 404);

// Local development uses memory; production uses an atomic shared PostgreSQL counter.
const hits = new Map<string, { count: number; reset: number }>();

export async function rateLimit(req: Request, bucket: string, limit = 10, windowMs = 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    const window = Math.floor(now / windowMs);
    const digest = createHash("sha256").update(`${key}:${window}`).digest("hex");
    const expiresAt = new Date((window + 1) * windowMs);
    const rows = await db.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "expiresAt") VALUES (${digest}, 1, ${expiresAt})
      ON CONFLICT ("key") DO UPDATE SET "count" = "RateLimit"."count" + 1
      RETURNING "count"
    `;
    return rows[0].count <= limit;
  }
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}
