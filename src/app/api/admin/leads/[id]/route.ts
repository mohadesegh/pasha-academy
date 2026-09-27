import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { ok, unauthorized, notFound } from "@/lib/http";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser("ADMIN");
  if (!user) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) return notFound();
  await db.lead.update({ where: { id }, data: { handled: Boolean(body?.handled) } });
  revalidatePath("/admin/leads");
  return ok({ id });
}
