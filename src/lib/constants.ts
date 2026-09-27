export const APP_TYPES = {
  DORMITORY: { label: "درخواست خوابگاه", short: "خوابگاه" },
  ADMISSION: { label: "درخواست پذیرش تحصیلی", short: "پذیرش" },
  RESIDENCE: { label: "درخواست اقامت تحصیلی", short: "اقامت" },
} as const;
export type AppType = keyof typeof APP_TYPES;
export const APP_TYPE_KEYS = Object.keys(APP_TYPES) as AppType[];

export type Tone = "info" | "warning" | "danger" | "success" | "muted";

export const APP_STATUSES: Record<string, { label: string; tone: Tone }> = {
  SUBMITTED: { label: "ثبت شده", tone: "info" },
  IN_REVIEW: { label: "در حال بررسی", tone: "warning" },
  NEEDS_ACTION: { label: "نیاز به اصلاح مدارک", tone: "danger" },
  APPROVED: { label: "تایید شده", tone: "success" },
  REJECTED: { label: "رد شده", tone: "muted" },
};
export const APP_STATUS_KEYS = ["SUBMITTED", "IN_REVIEW", "NEEDS_ACTION", "APPROVED", "REJECTED"] as const;
export type AppStatus = (typeof APP_STATUS_KEYS)[number];

export const DOC_STATUSES: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "در انتظار بررسی", tone: "warning" },
  APPROVED: { label: "تایید شد", tone: "success" },
  REJECTED: { label: "رد شد", tone: "danger" },
};

export const DOC_KINDS = {
  PASSPORT: "صفحه اول پاسپورت",
  PHOTO: "عکس پرسنلی",
  ACCEPTANCE: "نامه پذیرش دانشگاه",
  STUDENT_CERT: "گواهی اشتغال به تحصیل (Öğrenci Belgesi)",
  DIPLOMA: "مدرک تحصیلی (دیپلم / لیسانس)",
  TRANSCRIPT: "ریز نمرات",
  RESIDENCE: "کارت اقامت فعلی",
  HEALTH_INSURANCE: "بیمه درمانی",
  OTHER: "سایر مدارک",
} as const;
export type DocKind = keyof typeof DOC_KINDS;
export const DOC_KIND_KEYS = Object.keys(DOC_KINDS) as DocKind[];

/** Documents required for each application type (shown as a checklist in forms). */
export const REQUIRED_DOCS: Record<AppType, DocKind[]> = {
  DORMITORY: ["PASSPORT", "PHOTO", "ACCEPTANCE"],
  ADMISSION: ["PASSPORT", "PHOTO", "DIPLOMA", "TRANSCRIPT"],
  RESIDENCE: ["PASSPORT", "PHOTO", "STUDENT_CERT", "HEALTH_INSURANCE"],
};

export const AGENT_STATUSES: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "در انتظار تایید", tone: "warning" },
  APPROVED: { label: "فعال", tone: "success" },
  SUSPENDED: { label: "غیرفعال", tone: "muted" },
};

export const ROOM_TYPES = ["یک نفره", "دو نفره", "سه نفره", "چهار نفره"];
export const DEGREES = ["کارشناسی", "کارشناسی ارشد", "دکتری", "زبان ترکی (تومر)"];
export const TURKEY_CITIES = ["استانبول", "آنکارا", "ازمیر", "آنتالیا", "بورسا", "اسکی‌شهیر", "قونیه", "ترابزون"];

export const UPLOAD_LIMIT_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export const ACCEPT_ATTR = ".pdf,.jpg,.jpeg,.png,.webp";

export const SITE = {
  name: "پاشا آکادمی",
  nameEn: "Pasha Academy",
  tagline: "ادامه تحصیل، اقامت و خوابگاه در ترکیه",
  description:
    "پاشا آکادمی؛ اخذ پذیرش از دانشگاه‌های دولتی و خصوصی ترکیه، اقامت تحصیلی و رزرو خوابگاه دانشجویی در استانبول، آنکارا و سایر شهرها — از انتخاب رشته تا استقرار در ترکیه.",
  phone: "+90 555 000 00 00",
  phoneFa: "۰۰۹۰ ۵۵۵ ۰۰۰ ۰۰ ۰۰",
  whatsapp: "905550000000",
  email: "info@pasha-academy.com",
  instagram: "pasha.academy",
  address: "استانبول، شیشلی، خیابان حلاسکارغازی",
  addressEn: "Halaskargazi Cd., Şişli, İstanbul, Türkiye",
};
