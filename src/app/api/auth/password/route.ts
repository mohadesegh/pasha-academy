import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { ok, fail, unauthorized, rateLimit } from "@/lib/http";
import { firstError } from "@/lib/validation";

const schema = z.object({
  currentPassword: z.string().min(1, "رمز عبور فعلی را وارد کنید"),
  newPassword: z.string().min(8, "رمز عبور حداقل ۸ کاراکتر باشد").max(100),
});

/** Lets a signed-in user replace their own password after confirming the current one. */
export async function POST(req: Request) {
  const user = await apiUser("STUDENT", "AGENT", "ADMIN");
  if (!user) return unauthorized();
  if (!await rateLimit(req, `password:${user.id}`, 5)) return fail("تعداد تلاش‌ها زیاد است، یک دقیقه دیگر تلاش کنید", 429);

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(firstError(parsed.error));

  const record = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!record || !await bcrypt.compare(parsed.data.currentPassword, record.passwordHash)) {
    return fail("رمز عبور فعلی اشتباه است", 401);
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) } });
  return ok({ changed: true });
}
