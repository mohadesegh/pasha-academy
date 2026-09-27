import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { ok, fail, unauthorized, notFound } from "@/lib/http";
import { statusUpdateSchema, firstError } from "@/lib/validation";
import { APP_STATUSES } from "@/lib/constants";
import { actorLabel, logEvent } from "@/lib/applications";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser("ADMIN");
  if (!user) return unauthorized();
  const { id } = await params;

  const parsed = statusUpdateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(firstError(parsed.error));

  const app = await db.application.findUnique({ where: { id }, select: { id: true, status: true, adminNote: true } });
  if (!app) return notFound();

  const { status, adminNote } = parsed.data;
  await db.application.update({ where: { id }, data: { status, adminNote: adminNote ?? app.adminNote } });

  if (status !== app.status) {
    await logEvent(id, `وضعیت پرونده به «${APP_STATUSES[status].label}» تغییر کرد`, actorLabel(user));
  }
  if (adminNote !== undefined && adminNote !== (app.adminNote ?? "")) {
    await logEvent(id, "یادداشت کارشناس به‌روزرسانی شد", actorLabel(user));
  }

  revalidatePath("/admin", "layout");
  return ok({ id });
}
