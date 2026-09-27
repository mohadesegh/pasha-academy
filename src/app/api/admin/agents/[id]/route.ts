import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { ok, fail, unauthorized, notFound } from "@/lib/http";

const schema = z.object({ agentStatus: z.enum(["PENDING", "APPROVED", "SUSPENDED"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser("ADMIN");
  if (!user) return unauthorized();
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail("وضعیت معتبر نیست");

  const agent = await db.user.findFirst({ where: { id, role: "AGENT" } });
  if (!agent) return notFound();

  await db.user.update({ where: { id }, data: { agentStatus: parsed.data.agentStatus } });
  revalidatePath("/admin/agents");
  return ok({ id });
}
