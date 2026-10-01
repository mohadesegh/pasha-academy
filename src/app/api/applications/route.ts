import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { ok, fail, unauthorized, rateLimit } from "@/lib/http";
import { applicationSchema, docKindSchema, firstError } from "@/lib/validation";
import { saveUpload, deleteUpload, UploadError } from "@/lib/storage";
import { REQUIRED_DOCS, DOC_KINDS, APP_TYPES, ADMIN_ONLY_DOCS, type AppType, type DocKind } from "@/lib/constants";
import { trackingCode } from "@/lib/utils";
import { actorLabel, logEvent } from "@/lib/applications";

const MAX_FILES = 12;

/**
 * Creates an application with its documents (multipart/form-data).
 * Fields: application fields + repeated `files` and matching repeated `kinds`.
 */
export async function POST(req: Request) {
  const user = await apiUser("STUDENT", "AGENT");
  if (!user) return unauthorized();
  if (!rateLimit(req, "applications", 10)) return fail("تعداد درخواست‌ها زیاد است، کمی بعد تلاش کنید", 429);

  const form = await req.formData().catch(() => null);
  if (!form) return fail("فرم ارسالی معتبر نیست");

  const fields = Object.fromEntries(
    [...form.entries()].filter(([k, v]) => typeof v === "string" && k !== "kinds"),
  ) as Record<string, string>;
  const parsed = applicationSchema.safeParse(fields);
  if (!parsed.success) return fail(firstError(parsed.error));
  const data = parsed.data;
  const type = data.type as AppType;
  if (type === "ADMISSION" && !data.motherName) return fail("نام مادر را وارد کنید");

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const kinds = form.getAll("kinds").map(String);
  if (files.length !== kinds.length) return fail("نوع هر مدرک را مشخص کنید");
  if (files.length > MAX_FILES) return fail(`حداکثر ${MAX_FILES} فایل قابل ارسال است`);
  for (const k of kinds) {
    if (!docKindSchema.safeParse(k).success || ADMIN_ONLY_DOCS.includes(k as DocKind)) return fail("نوع مدرک معتبر نیست");
  }

  const missing = REQUIRED_DOCS[type].filter((k) => !kinds.includes(k));
  if (missing.length) return fail(`مدارک الزامی بارگذاری نشده: ${missing.map((k) => DOC_KINDS[k]).join("، ")}`);

  if (data.universityId) {
    const uni = await db.university.findUnique({ where: { id: data.universityId }, select: { id: true } });
    if (!uni) return fail("دانشگاه انتخاب‌شده معتبر نیست");
  }

  const saved: { kind: DocKind; storedName: string; mimeType: string; size: number; originalName: string }[] = [];
  try {
    for (let i = 0; i < files.length; i++) {
      saved.push({ kind: kinds[i] as DocKind, ...(await saveUpload(files[i])) });
    }
  } catch (e) {
    await Promise.all(saved.map((s) => deleteUpload(s.storedName)));
    return fail(e instanceof UploadError ? `${files[saved.length]?.name}: ${e.message}` : "خطا در ذخیره فایل", 400);
  }

  const empty = (v?: string) => (v ? v : null);
  const app = await db.application.create({
    data: {
      code: trackingCode(),
      type,
      studentName: data.studentName,
      motherName: type === "ADMISSION" ? empty(data.motherName) : null,
      studentEmail: data.studentEmail,
      studentPhone: data.studentPhone,
      nationality: data.nationality,
      passportNo: empty(data.passportNo),
      birthDate: empty(data.birthDate),
      universityId: empty(data.universityId),
      program: empty(data.program),
      degree: empty(data.degree),
      // Scholarship quotas are handed out through agents.
      scholarshipPercent: type === "ADMISSION" && user.role === "AGENT" ? data.scholarshipPercent : null,
      dormCity: empty(data.dormCity),
      roomType: empty(data.roomType),
      moveInDate: empty(data.moveInDate),
      notes: empty(data.notes),
      studentId: user.role === "STUDENT" ? user.id : null,
      agentId: user.role === "AGENT" ? user.id : null,
      documents: { create: saved },
    },
  });
  await logEvent(app.id, `${APP_TYPES[type].label} با ${saved.length} مدرک ثبت شد`, actorLabel(user));
  if (app.scholarshipPercent) {
    await logEvent(app.id, `از سهمیه بورسیه ${app.scholarshipPercent}٪ پاشا آکادمی استفاده شد`, actorLabel(user));
  }

  revalidatePath("/admin", "layout");
  return ok({ id: app.id, code: app.code }, 201);
}
