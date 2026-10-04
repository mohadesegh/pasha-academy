import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { ok, fail, unauthorized, notFound } from "@/lib/http";
import { programSchema, firstError } from "@/lib/validation";
import { revalidateSite } from "@/lib/revalidate";

type Ctx = { params: Promise<{ id: string }> };

function refresh() {
  revalidateSite();
  revalidatePath("/admin/programs");
}

export async function PATCH(req: Request, { params }: Ctx) {
  const user = await apiUser("ADMIN");
  if (!user) return unauthorized();
  const { id } = await params;

  const parsed = programSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(firstError(parsed.error));

  const current = await db.program.findUnique({ where: { id }, select: { id: true } });
  if (!current) return notFound();
  const uni = await db.university.findUnique({ where: { id: parsed.data.universityId }, select: { id: true } });
  if (!uni) return fail("دانشگاه انتخاب شده وجود ندارد");

  const { nameEn, faculty, ...rest } = parsed.data;
  // Once an admin edits a row it is real data, so it loses the sample flag.
  await db.program.update({
    where: { id },
    data: { ...rest, nameEn: nameEn || null, faculty: faculty || null, sample: false },
  });
  refresh();
  return ok({ id });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await apiUser("ADMIN");
  if (!user) return unauthorized();
  const { id } = await params;

  const current = await db.program.findUnique({ where: { id }, select: { id: true } });
  if (!current) return notFound();
  await db.program.delete({ where: { id } });
  refresh();
  return ok({ id });
}
