import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { ok, fail, unauthorized, notFound } from "@/lib/http";
import { docReviewSchema, firstError } from "@/lib/validation";
import { deleteUpload } from "@/lib/storage";
import { DOC_KINDS, DOC_STATUSES, type DocKind } from "@/lib/constants";
import { actorLabel, logEvent, scopeFor } from "@/lib/applications";

type Ctx = { params: Promise<{ id: string }> };

/** Admin review of a single document (approve / reject with a note). */
export async function PATCH(req: Request, { params }: Ctx) {
  const user = await apiUser("ADMIN");
  if (!user) return unauthorized();
  const { id } = await params;

  const parsed = docReviewSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(firstError(parsed.error));
  const { status, reviewNote } = parsed.data;
  if (status === "REJECTED" && !reviewNote) return fail("برای رد مدرک، دلیل را بنویسید");

  const doc = await db.document.findUnique({ where: { id } });
  if (!doc) return notFound();

  await db.document.update({
    where: { id },
    data: { status, reviewNote: reviewNote || null, reviewedAt: status === "PENDING" ? null : new Date() },
  });
  await logEvent(
    doc.applicationId,
    `مدرک «${DOC_KINDS[doc.kind as DocKind] ?? doc.kind}»: ${DOC_STATUSES[status].label}${reviewNote ? ` — ${reviewNote}` : ""}`,
    actorLabel(user),
  );

  // Keep the application status in sync with its documents.
  const app = await db.application.findUnique({ where: { id: doc.applicationId }, include: { documents: true } });
  if (app && app.status !== "APPROVED" && app.status !== "REJECTED") {
    const anyRejected = app.documents.some((d) => d.status === "REJECTED");
    const next = anyRejected ? "NEEDS_ACTION" : "IN_REVIEW";
    if (next !== app.status) {
      await db.application.update({ where: { id: app.id }, data: { status: next } });
    }
  }

  revalidatePath("/admin", "layout");
  return ok({ id });
}

/** Owners can delete documents that were not approved yet; admins can delete any. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await apiUser("STUDENT", "AGENT", "ADMIN");
  if (!user) return unauthorized();
  const { id } = await params;

  const doc = await db.document.findFirst({
    where: { id, application: scopeFor(user) },
    include: { application: { select: { status: true } } },
  });
  if (!doc) return notFound();
  if (user.role !== "ADMIN" && (doc.status === "APPROVED" || doc.application.status === "APPROVED")) {
    return fail("مدرک تایید شده قابل حذف نیست");
  }

  await db.document.delete({ where: { id } });
  await deleteUpload(doc.storedName);
  await logEvent(doc.applicationId, `مدرک «${DOC_KINDS[doc.kind as DocKind] ?? doc.kind}» حذف شد`, actorLabel(user));
  return ok({ id });
}
