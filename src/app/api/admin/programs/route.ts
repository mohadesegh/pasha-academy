import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { ok, fail, unauthorized } from "@/lib/http";
import { programSchema, firstError } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await apiUser("ADMIN");
  if (!user) return unauthorized();

  const parsed = programSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(firstError(parsed.error));

  const uni = await db.university.findUnique({ where: { id: parsed.data.universityId }, select: { id: true } });
  if (!uni) return fail("دانشگاه انتخاب شده وجود ندارد");

  const { nameEn, faculty, ...rest } = parsed.data;
  // A row saved through the admin is real data, never a placeholder.
  const program = await db.program.create({
    data: { ...rest, nameEn: nameEn || null, faculty: faculty || null, sample: false },
  });
  revalidatePath("/programs");
  revalidatePath("/scholarships");
  revalidatePath("/admin/programs");
  return ok({ id: program.id }, 201);
}
