import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { ok, fail, rateLimit } from "@/lib/http";
import { SESSION_COOKIE, sessionCookieOptions, signSession, homeForRole, type Role } from "@/lib/session";
import { loginSchema, firstError } from "@/lib/validation";

export async function POST(req: Request) {
  if (!rateLimit(req, "login", 10)) return fail("تعداد تلاش‌ها زیاد است، یک دقیقه دیگر تلاش کنید", 429);

  const parsed = loginSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(firstError(parsed.error));

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  if (!user || !valid) return fail("ایمیل یا رمز عبور اشتباه است", 401);
  if (user.role === "AGENT" && user.agentStatus === "SUSPENDED") return fail("حساب نمایندگی شما غیرفعال شده است", 403);

  const role = user.role as Role;
  const token = await signSession({ sub: user.id, role, name: user.name });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  return ok({ redirect: homeForRole(role) });
}
