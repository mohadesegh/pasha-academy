export const APP_TYPES = {
  DORMITORY: { label: "درخواست خوابگاه", short: "خوابگاه" },
  ADMISSION: { label: "درخواست پذیرش تحصیلی", short: "پذیرش" },
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
  STUDENT_CERT: "برگه دانشجویی (Öğrenci Belgesi)",
  DIPLOMA: "اصل مدرک تحصیلی (دیپلم / کاردانی / لیسانس)",
  DIPLOMA_TRANSLATION: "ترجمه مدرک تحصیلی",
  TRANSCRIPT: "اصل ریز نمرات",
  TRANSCRIPT_TRANSLATION: "ترجمه ریز نمرات",
  RESIDENCE: "کارت اقامت فعلی",
  HEALTH_INSURANCE: "بیمه درمانی",
  PAYMENT_RECEIPT: "فیش واریزی",
  FINAL_ACCEPTANCE: "پذیرش نهایی دانشگاه",
  OTHER: "سایر مدارک",
} as const;
export type DocKind = keyof typeof DOC_KINDS;
export const DOC_KIND_KEYS = Object.keys(DOC_KINDS) as DocKind[];

/** Issued by Pasha Academy, never uploaded by students or agents. */
export const ADMIN_ONLY_DOCS: DocKind[] = ["FINAL_ACCEPTANCE"];
/** Kinds applicants may upload themselves. */
export const APPLICANT_DOC_KINDS = DOC_KIND_KEYS.filter((k) => !ADMIN_ONLY_DOCS.includes(k));

/** Documents required for each application type (shown as a checklist in forms). */
export const REQUIRED_DOCS: Record<AppType, DocKind[]> = {
  DORMITORY: ["STUDENT_CERT", "PASSPORT"],
  ADMISSION: ["PASSPORT", "PHOTO", "DIPLOMA", "DIPLOMA_TRANSLATION", "TRANSCRIPT", "TRANSCRIPT_TRANSLATION"],
};

/** Pasha Academy's own scholarship quotas (percent off tuition) that can be assigned to an application. */
export const SCHOLARSHIP_OPTIONS = [25, 50, 75, 100] as const;

/** Student residence permit (kimlik) checklist — informational, shown on the residence service page. */
export const KIMLIK_DOCS = [
  "۴ قطعه عکس",
  "فرم درخواست اقامت",
  "بیمه‌نامه",
  "فیش هزینه صدور کارت",
  "برگه دانشجویی (Öğrenci Belgesi)",
  "قرارداد اجاره رسمی نوتر شده یا برگه خوابگاه (جهت ارائه آدرس به اداره مهاجرت)",
];
export const KIMLIK_RENEWAL_NOTE = "برای تمدید اقامت، علاوه بر مدارک بالا باید یک کد UETS از PTT اخذ شود.";

export const AGENT_STATUSES: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "در انتظار تایید", tone: "warning" },
  APPROVED: { label: "فعال", tone: "success" },
  SUSPENDED: { label: "غیرفعال", tone: "muted" },
};

/** Program catalogue (tuition search / scholarships). */
export const PROGRAM_DEGREES = {
  ASSOCIATE: { fa: "کاردانی", en: "Associate" },
  BACHELOR: { fa: "کارشناسی", en: "Bachelor" },
  MASTER: { fa: "کارشناسی ارشد با تز", en: "Master's (thesis)" },
  MASTER_NON_THESIS: { fa: "کارشناسی ارشد بدون تز", en: "Master's (non-thesis)" },
  PHD: { fa: "دکتری", en: "PhD" },
} as const;
export type ProgramDegree = keyof typeof PROGRAM_DEGREES;
export const PROGRAM_DEGREE_KEYS = Object.keys(PROGRAM_DEGREES) as ProgramDegree[];

export const PROGRAM_LANGUAGES = {
  TR: { fa: "ترکی", en: "Turkish" },
  EN: { fa: "انگلیسی", en: "English" },
} as const;
export type ProgramLanguage = keyof typeof PROGRAM_LANGUAGES;
export const PROGRAM_LANGUAGE_KEYS = Object.keys(PROGRAM_LANGUAGES) as ProgramLanguage[];

export const ROOM_TYPES =["یک نفره", "دو نفره", "سه نفره", "چهار نفره"];
export const DEGREES = ["کاردانی", "کارشناسی", "کارشناسی ارشد با تز", "کارشناسی ارشد بدون تز", "دکتری", "زبان ترکی (تومر)"];
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
    "پاشا آکادمی؛ اخذ پذیرش از دانشگاه‌های خصوصی ترکیه، اقامت تحصیلی و رزرو خوابگاه دانشجویی در استانبول، آنکارا و سایر شهرها — از انتخاب رشته تا استقرار در ترکیه.",
  phone: "+90 555 000 00 00",
  phoneFa: "۰۰۹۰ ۵۵۵ ۰۰۰ ۰۰ ۰۰",
  whatsapp: "905010211100",
  whatsappDisplay: "+90 501 021 11 00",
  email: "info@pasha-academy.com",
  instagram: "pashaacademy",
  address: "استانبول، شیشلی، خیابان حلاسکارغازی",
  addressEn: "Halaskargazi Cd., Şişli, İstanbul, Türkiye",
};
