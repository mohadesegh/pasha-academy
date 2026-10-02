import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { ok, fail, unauthorized, notFound } from "@/lib/http";
import { universitySchema, firstError } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

function refresh() {
  revalidatePath("/universities", "layout");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

export async function PATCH(req: Request, { params }: Ctx) {
  const user = await apiUser("ADMIN");
  if (!user) return unauthorized();
  const { id } = await params;

  const parsed = universitySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(firstError(parsed.error));

  const current = await db.university.findUnique({ where: { id } });
  if (!current) return notFound();
  if (parsed.data.slug !== current.slug) {
    const taken = await db.university.findUnique({ where: { slug: parsed.data.slug } });
    if (taken) return fail("این اسلاگ قبلا استفاده شده است", 409);
  }

  await db.university.update({ where: { id }, data: { ...parsed.data, website: parsed.data.website || null, logo: parsed.data.logo || null } });
  refresh();
  return ok({ id });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await apiUser("ADMIN");
  if (!user) return unauthorized();
  const { id } = await params;

  const current = await db.university.findUnique({ where: { id } });
  if (!current) return notFound();
  await db.university.delete({ where: { id } });
  refresh();
  return ok({ id });
}
