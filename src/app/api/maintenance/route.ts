import { timingSafeEqual } from "node:crypto";
import { list, del } from "@vercel/blob";
import { db } from "@/lib/db";
import { blobConfigured } from "@/lib/storage";

export const maxDuration = 60;

/** Sweep only temporary uploads older than a day, never permanent documents. */
export async function GET(request: Request) {
  const expected = Buffer.from(`Bearer ${process.env.CRON_SECRET ?? ""}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  if (!process.env.CRON_SECRET || actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return new Response("Unauthorized", { status: 401 });
  }
  await db.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  let removed = 0;
  let cursor: string | undefined;
  if (blobConfigured()) {
    for (let page = 0; page < 5; page++) {
      const result = await list({ prefix: "staging/", limit: 1000, cursor });
      const expired = result.blobs.filter((b) => b.uploadedAt.getTime() < Date.now() - 86400000);
      if (expired.length) await del(expired.map((b) => b.url));
      removed += expired.length;
      if (!result.hasMore) break;
      cursor = result.cursor;
    }
  }
  return Response.json({ removed });
}
