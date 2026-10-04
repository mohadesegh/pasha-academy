import { revalidateSite } from "@/lib/revalidate";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { ok, fail, unauthorized } from "@/lib/http";
import { universitySchema, firstError } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await apiUser("ADMIN");
  if (!user) return unauthorized();

  const parsed = universitySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(firstError(parsed.error));

  const exists = await db.university.findUnique({ where: { slug: parsed.data.slug } });
  if (exists) return fail("این اسلاگ قبلا استفاده شده است", 409);

  const uni = await db.university.create({ data: { ...parsed.data, website: parsed.data.website || null, logo: parsed.data.logo || null } });
  revalidateSite();
  return ok({ id: uni.id }, 201);
}
