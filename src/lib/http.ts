import "server-only";
import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export const unauthorized = () => fail("دسترسی غیرمجاز", 401);
export const notFound = () => fail("مورد یافت نشد", 404);

// Naive in-memory fixed-window limiter. Good enough for a single instance;
// swap for Redis/Upstash when running multiple instances.
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(req: Request, bucket: string, limit = 10, windowMs = 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}
