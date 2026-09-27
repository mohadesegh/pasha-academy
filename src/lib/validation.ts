import { z } from "zod";
import { APP_TYPE_KEYS, APP_STATUS_KEYS, DOC_KIND_KEYS } from "./constants";

const phone = z.string().trim().min(8, "شماره تماس معتبر نیست").max(20, "شماره تماس معتبر نیست");
const email = z.string().trim().toLowerCase().email("ایمیل معتبر نیست");
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
// Empty form value → null, so clearing a field in the edit form actually clears it.
const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z.number({ message: "عدد معتبر وارد کنید" }).int().min(0).nullable(),
);

export const registerSchema = z.object({
  name: z.string().trim().min(3, "نام و نام خانوادگی را کامل وارد کنید").max(80),
  email,
  phone,
  password: z.string().min(8, "رمز عبور حداقل ۸ کاراکتر باشد").max(100),
});

export const agentRegisterSchema = registerSchema.extend({
  companyName: z.string().trim().min(2, "نام موسسه / مجموعه را وارد کنید").max(100),
  city: z.string().trim().min(2, "شهر را وارد کنید").max(60),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

export const applicationSchema = z.object({
  type: z.enum(APP_TYPE_KEYS as [string, ...string[]], { message: "نوع درخواست معتبر نیست" }),
  studentName: z.string().trim().min(3, "نام دانشجو را وارد کنید").max(80),
  studentEmail: email,
  studentPhone: phone,
  nationality: z.string().trim().min(2, "ملیت را وارد کنید").max(40),
  passportNo: optionalText(20),
  birthDate: optionalText(20),
  universityId: optionalText(40),
  program: optionalText(100),
  degree: optionalText(40),
  dormCity: optionalText(40),
  roomType: optionalText(40),
  moveInDate: optionalText(20),
  notes: optionalText(1000),
});

export const docKindSchema = z.enum(DOC_KIND_KEYS as [string, ...string[]]);

export const leadSchema = z.object({
  name: z.string().trim().min(2, "نام را وارد کنید").max(80),
  phone,
  email: email.optional().or(z.literal("")),
  service: optionalText(60),
  message: optionalText(1500),
});

export const statusUpdateSchema = z.object({
  status: z.enum(APP_STATUS_KEYS),
  adminNote: z.string().trim().max(1500).optional(),
});

export const docReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
  reviewNote: z.string().trim().max(500).optional(),
});

export const universitySchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "اسلاگ فقط شامل حروف انگلیسی کوچک، عدد و خط تیره باشد"),
  name: z.string().trim().min(2, "نام دانشگاه را وارد کنید").max(120),
  nameEn: z.string().trim().min(2, "نام انگلیسی را وارد کنید").max(120),
  city: z.string().trim().min(2, "شهر را وارد کنید").max(40),
  type: z.enum(["PUBLIC", "PRIVATE"]),
  founded: optionalInt,
  students: optionalInt,
  tuitionFrom: optionalInt,
  languages: z.string().trim().min(2, "زبان تدریس را وارد کنید").max(120),
  programs: z.string().trim().min(2, "رشته‌ها را وارد کنید").max(2000),
  summary: z.string().trim().min(10, "خلاصه حداقل ۱۰ کاراکتر باشد").max(300),
  description: z.string().trim().min(20, "توضیحات حداقل ۲۰ کاراکتر باشد").max(6000),
  website: z.string().trim().url("آدرس وب‌سایت معتبر نیست").optional().or(z.literal("")),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "رنگ باید به فرمت هگز باشد"),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "اطلاعات وارد شده معتبر نیست";
}
