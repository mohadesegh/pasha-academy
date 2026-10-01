import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { ok, fail, unauthorized, notFound } from "@/lib/http";
import { docKindSchema } from "@/lib/validation";
import { saveUpload, UploadError } from "@/lib/storage";
import { ADMIN_ONLY_DOCS, DOC_KINDS, type DocKind } from "@/lib/constants";
import { actorLabel, findApplicationFor, logEvent } from "@/lib/applications";

/** Upload an additional or replacement document to an existing application. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser("STUDENT", "AGENT", "ADMIN");
  if (!user) return unauthorized();
  const { id } = await params;

  const app = await findApplicationFor(user, id);
  if (!app) return notFound();

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const kind = docKindSchema.safeParse(form?.get("kind"));
  if (!(file instanceof File) || file.size === 0) return fail("فایلی انتخاب نشده است");
  if (!kind.success) return fail("نوع مدرک معتبر نیست");
  const docKind = kind.data as DocKind;

  const isAdmin = user.role === "ADMIN";
  if (!isAdmin && ADMIN_ONLY_DOCS.includes(docKind)) return fail("این مدرک فقط توسط پاشا آکادمی صادر می‌شود", 403);
  // Payment receipts usually arrive after final acceptance, so an approved case still accepts them.
  const closed = app.status === "REJECTED" || (app.status === "APPROVED" && docKind !== "PAYMENT_RECEIPT");
  if (!isAdmin && closed) return fail("این پرونده بسته شده و امکان افزودن مدرک ندارد");

  try {
    const saved = await saveUpload(file);
    const issued = isAdmin && ADMIN_ONLY_DOCS.includes(docKind);
    const doc = await db.document.create({
      data: { applicationId: app.id, kind: docKind, ...saved, ...(issued ? { status: "APPROVED", reviewedAt: new Date() } : {}) },
    });
    await logEvent(
      app.id,
      docKind === "FINAL_ACCEPTANCE"
        ? `پذیرش نهایی دانشگاه برای ${app.agentId ? "نماینده" : "دانشجو"} ارسال شد`
        : `مدرک «${DOC_KINDS[docKind]}» بارگذاری شد`,
      actorLabel(user),
    );

    // A fix was uploaded by the applicant → move the case back into review.
    if (user.role !== "ADMIN" && app.status === "NEEDS_ACTION") {
      await db.application.update({ where: { id: app.id }, data: { status: "IN_REVIEW" } });
      await logEvent(app.id, "وضعیت پرونده به «در حال بررسی» تغییر کرد", "سیستم");
    }
    revalidatePath("/admin", "layout");
    return ok({ id: doc.id }, 201);
  } catch (e) {
    return fail(e instanceof UploadError ? e.message : "خطا در ذخیره فایل");
  }
}
