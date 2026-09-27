import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { ok, fail, unauthorized, notFound } from "@/lib/http";
import { docKindSchema } from "@/lib/validation";
import { saveUpload, UploadError } from "@/lib/storage";
import { DOC_KINDS, type DocKind } from "@/lib/constants";
import { actorLabel, findApplicationFor, logEvent } from "@/lib/applications";

/** Upload an additional or replacement document to an existing application. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser("STUDENT", "AGENT", "ADMIN");
  if (!user) return unauthorized();
  const { id } = await params;

  const app = await findApplicationFor(user, id);
  if (!app) return notFound();
  if (app.status === "APPROVED" || app.status === "REJECTED") {
    return fail("این پرونده بسته شده و امکان افزودن مدرک ندارد");
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const kind = docKindSchema.safeParse(form?.get("kind"));
  if (!(file instanceof File) || file.size === 0) return fail("فایلی انتخاب نشده است");
  if (!kind.success) return fail("نوع مدرک معتبر نیست");

  try {
    const saved = await saveUpload(file);
    const doc = await db.document.create({ data: { applicationId: app.id, kind: kind.data, ...saved } });
    await logEvent(app.id, `مدرک «${DOC_KINDS[kind.data as DocKind]}» بارگذاری شد`, actorLabel(user));

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
