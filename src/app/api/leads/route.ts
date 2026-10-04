import { db } from "@/lib/db";
import { ok, fail, rateLimit } from "@/lib/http";
import { leadSchema, firstError } from "@/lib/validation";

/** Public consultation / contact form. */
export async function POST(req: Request) {
  if (!await rateLimit(req, "leads", 5)) return fail("تعداد درخواست‌ها زیاد است، کمی بعد تلاش کنید", 429);

  const body = await req.json().catch(() => ({}));
  // Honeypot field — bots fill every input.
  if (body?.website) return ok({ id: "ignored" });

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return fail(firstError(parsed.error));

  const { name, phone, email, service, message } = parsed.data;
  const lead = await db.lead.create({
    data: { name, phone, email: email || null, service: service || null, message: message || null },
  });
  return ok({ id: lead.id }, 201);
}
