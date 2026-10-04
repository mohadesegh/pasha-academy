import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { ok, fail, rateLimit } from "@/lib/http";
import { SESSION_COOKIE, sessionCookieOptions, signSession, homeForRole } from "@/lib/session";
import { agentRegisterSchema, registerSchema, firstError } from "@/lib/validation";

/** Registers a student, or an agent when `asAgent` is true (agents start as PENDING). */
export async function POST(req: Request) {
  if (!await rateLimit(req, "register", 5)) return fail("تعداد درخواست‌ها زیاد است، کمی بعد تلاش کنید", 429);

  const body = await req.json().catch(() => ({}));
  const asAgent = body?.asAgent === true;
  const parsed = (asAgent ? agentRegisterSchema : registerSchema).safeParse(body);
  if (!parsed.success) return fail(firstError(parsed.error));
  const data = parsed.data as typeof parsed.data & { companyName?: string; city?: string };

  const exists = await db.user.findUnique({ where: { email: data.email } });
  if (exists) return fail("با این ایمیل قبلا ثبت‌نام شده است", 409);

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash: await bcrypt.hash(data.password, 10),
      role: asAgent ? "AGENT" : "STUDENT",
      agentStatus: asAgent ? "PENDING" : null,
      companyName: data.companyName,
      city: data.city,
    },
  });

  const role = user.role as "STUDENT" | "AGENT";
  const token = await signSession({ sub: user.id, role, name: user.name });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  return ok({ redirect: homeForRole(role) }, 201);
}
