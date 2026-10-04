"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Award, BedDouble, GraduationCap, Plus, Send } from "lucide-react";
import { Alert, Field } from "./field";
import { DocumentDropzone } from "./document-dropzone";
import {
  APP_TYPES,
  APPLICANT_DOC_KINDS,
  DEGREES,
  DOC_KINDS,
  REQUIRED_DOCS,
  ROOM_TYPES,
  SCHOLARSHIP_OPTIONS,
  TURKEY_CITIES,
  type AppType,
  type DocKind,
} from "@/lib/constants";
import { cn, toFa } from "@/lib/utils";
import { prepareUploads } from "@/lib/upload-client";

type Uni = { id: string; name: string; city: string };

const TYPE_CARDS: { type: AppType; icon: typeof BedDouble; text: string }[] = [
  { type: "DORMITORY", icon: BedDouble, text: "رزرو خوابگاه یا رزیدنس دانشجویی" },
  { type: "ADMISSION", icon: GraduationCap, text: "اخذ پذیرش از دانشگاه‌های ترکیه" },
];

type Extra = { id: number; kind: DocKind; file: File | null };

export function ApplicationForm({
  universities,
  initialType = "DORMITORY",
  initialUniversityId = "",
  defaults,
  successBase,
  forAgent = false,
}: {
  universities: Uni[];
  initialType?: AppType;
  initialUniversityId?: string;
  defaults?: { name?: string; email?: string; phone?: string };
  /** Where to go after submit; the new application id is appended. */
  successBase: string;
  forAgent?: boolean;
}) {
  const router = useRouter();
  const [type, setType] = useState<AppType>(initialType);
  const [required, setRequired] = useState<Partial<Record<DocKind, File | null>>>({});
  const [extras, setExtras] = useState<Extra[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const requiredKinds = REQUIRED_DOCS[type];
  const extraKinds = useMemo(() => APPLICANT_DOC_KINDS.filter((k) => !requiredKinds.includes(k)), [requiredKinds]);
  const doneCount = requiredKinds.filter((k) => required[k]).length;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const missing = requiredKinds.filter((k) => !required[k]);
    if (missing.length) {
      setError(`لطفا مدارک الزامی را بارگذاری کنید: ${missing.map((k) => DOC_KINDS[k]).join("، ")}`);
      return;
    }

    const fd = new FormData(e.currentTarget);
    fd.set("type", type);
    for (const k of requiredKinds) {
      fd.append("files", required[k]!);
      fd.append("kinds", k);
    }
    for (const x of extras) {
      if (!x.file) continue;
      fd.append("files", x.file);
      fd.append("kinds", x.kind);
    }

    setProgress(0);
    try {
      await prepareUploads(fd, setProgress);
    } catch (error) {
      setProgress(null);
      setError(error instanceof Error ? error.message : "خطا در بارگذاری مدارک");
      return;
    }
    // XHR provides progress for local storage as well.
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/applications");
    xhr.upload.onprogress = (ev) => ev.lengthComputable && setProgress((current) => Math.max(current ?? 0, Math.round((ev.loaded / ev.total) * 100)));
    xhr.onload = () => {
      let json: { ok: boolean; data?: { id: string }; error?: string } = { ok: false };
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (json.ok && json.data) {
        router.push(`${successBase}/${json.data.id}?created=1`);
        router.refresh();
      } else {
        setProgress(null);
        setError(json.error ?? "ثبت درخواست با خطا مواجه شد");
      }
    };
    xhr.onerror = () => {
      setProgress(null);
      setError("خطا در ارتباط با سرور؛ اتصال اینترنت را بررسی کنید");
    };
    xhr.send(fd);
  }

  const pending = progress !== null;

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {/* 1. Type */}
      <section className="card p-6">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-950">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-navy-950 text-xs text-gold-300">۱</span>
          نوع درخواست
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="نوع درخواست">
          {TYPE_CARDS.map((t) => {
            const active = type === t.type;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={active}
                key={t.type}
                onClick={() => setType(t.type)}
                className={cn(
                  "relative rounded-2xl border-2 p-4 text-right transition",
                  active ? "border-crimson-500 bg-crimson-50/50" : "border-line bg-white hover:border-navy-200",
                )}
              >
                <t.icon className={cn("h-7 w-7", active ? "text-crimson-500" : "text-navy-400")} />
                <p className="mt-3 font-extrabold text-navy-950">{APP_TYPES[t.type].label}</p>
                <p className="mt-1 text-xs text-muted">{t.text}</p>
                {active && <motion.span layoutId="type-check" className="absolute left-3 top-3 h-3 w-3 rounded-full bg-crimson-500 ring-4 ring-crimson-100" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Personal info */}
      <section className="card p-6">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-950">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-navy-950 text-xs text-gold-300">۲</span>
          {forAgent ? "مشخصات دانشجو" : "مشخصات شما"}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="نام و نام خانوادگی (مطابق پاسپورت)" htmlFor="studentName" required>
            <input id="studentName" name="studentName" required defaultValue={defaults?.name} className="input" />
          </Field>
          {type === "ADMISSION" && (
            <Field label="نام مادر" htmlFor="motherName" required>
              <input id="motherName" name="motherName" required className="input" />
            </Field>
          )}
          <Field label="ملیت" htmlFor="nationality" required>
            <input id="nationality" name="nationality" required defaultValue="ایرانی" className="input" />
          </Field>
          <Field label="ایمیل" htmlFor="studentEmail" required>
            <input id="studentEmail" name="studentEmail" type="email" required defaultValue={defaults?.email} className="input" dir="ltr" />
          </Field>
          <Field label="شماره تماس / واتساپ" htmlFor="studentPhone" required>
            <input id="studentPhone" name="studentPhone" required defaultValue={defaults?.phone} className="input" dir="ltr" inputMode="tel" />
          </Field>
          <Field label="شماره پاسپورت" htmlFor="passportNo">
            <input id="passportNo" name="passportNo" className="input" dir="ltr" />
          </Field>
          <Field label="تاریخ تولد" htmlFor="birthDate">
            <input id="birthDate" name="birthDate" type="date" className="input" dir="ltr" />
          </Field>
        </div>
      </section>

      {/* 3. Details */}
      <section className="card p-6">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-950">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-navy-950 text-xs text-gold-300">۳</span>
          جزئیات {APP_TYPES[type].short}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="دانشگاه" htmlFor="universityId">
            <select id="universityId" name="universityId" defaultValue={initialUniversityId} className="input">
              <option value="">{type === "ADMISSION" ? "انتخاب دانشگاه (یا مشاوره بگیرید)" : "انتخاب دانشگاه"}</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>{u.name} — {u.city}</option>
              ))}
            </select>
          </Field>
          <AnimatePresence mode="popLayout" initial={false}>
            {type === "DORMITORY" ? (
              <motion.div key="dorm" className="contents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Field label="شهر" htmlFor="dormCity" required>
                  <select id="dormCity" name="dormCity" className="input" defaultValue="استانبول">
                    {TURKEY_CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="نوع اتاق" htmlFor="roomType">
                  <select id="roomType" name="roomType" className="input" defaultValue="دو نفره">
                    {ROOM_TYPES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="تاریخ ورود" htmlFor="moveInDate">
                  <input id="moveInDate" name="moveInDate" type="date" className="input" dir="ltr" />
                </Field>
              </motion.div>
            ) : (
              <motion.div key="study" className="contents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Field label="مقطع" htmlFor="degree">
                  <select id="degree" name="degree" className="input" defaultValue="کارشناسی">
                    {DEGREES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="رشته" htmlFor="program">
                  <input id="program" name="program" className="input" placeholder="مثلا مهندسی کامپیوتر" />
                </Field>
                {forAgent && (
                  <Field label="سهمیه بورسیه پاشا آکادمی" htmlFor="scholarshipPercent" className="sm:col-span-2">
                    <div className="relative">
                      <Award className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-500" />
                      <select id="scholarshipPercent" name="scholarshipPercent" className="input" defaultValue="">
                        <option value="">بدون استفاده از سهمیه</option>
                        {SCHOLARSHIP_OPTIONS.map((p) => <option key={p} value={p}>بورسیه {toFa(p)}٪</option>)}
                      </select>
                    </div>
                  </Field>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <Field label="توضیحات" htmlFor="notes" className="sm:col-span-2">
            <textarea id="notes" name="notes" rows={3} className="input resize-none" placeholder="هر نکته‌ای که لازم است کارشناس بداند..." />
          </Field>
        </div>
      </section>

      {/* 4. Documents */}
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-950">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-navy-950 text-xs text-gold-300">۴</span>
            بارگذاری مدارک
          </h2>
          <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-bold text-navy-800">
            {toFa(doneCount)} از {toFa(requiredKinds.length)} مدرک الزامی
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand-200">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-turquoise-400 to-turquoise-600"
            animate={{ width: `${(doneCount / requiredKinds.length) * 100}%` }}
          />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {requiredKinds.map((k) => (
            <DocumentDropzone
              key={`${type}-${k}`}
              label={DOC_KINDS[k]}
              required
              file={required[k] ?? null}
              onChange={(f) => setRequired((r) => ({ ...r, [k]: f }))}
            />
          ))}
        </div>

        {extras.length > 0 && (
          <div className="mt-6 space-y-3 border-t border-line pt-6">
            <p className="text-sm font-bold text-navy-900">مدارک تکمیلی</p>
            {extras.map((x) => (
              <div key={x.id} className="grid gap-3 md:grid-cols-[220px_1fr]">
                <select
                  aria-label="نوع مدرک"
                  value={x.kind}
                  onChange={(e) => setExtras((xs) => xs.map((y) => (y.id === x.id ? { ...y, kind: e.target.value as DocKind } : y)))}
                  className="input"
                >
                  {extraKinds.map((k) => <option key={k} value={k}>{DOC_KINDS[k]}</option>)}
                </select>
                <DocumentDropzone
                  compact
                  label={DOC_KINDS[x.kind]}
                  file={x.file}
                  onChange={(f) =>
                    f
                      ? setExtras((xs) => xs.map((y) => (y.id === x.id ? { ...y, file: f } : y)))
                      : setExtras((xs) => xs.filter((y) => y.id !== x.id))
                  }
                />
              </div>
            ))}
          </div>
        )}
        {extras.length < 6 && (
          <button
            type="button"
            onClick={() => setExtras((xs) => [...xs, { id: Date.now(), kind: extraKinds[extraKinds.length - 1], file: null }])}
            className="btn-outline btn-sm mt-5"
          >
            <Plus className="h-4 w-4" />
            افزودن مدرک دیگر
          </button>
        )}
      </section>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="card sticky bottom-4 z-10 flex flex-col items-center gap-4 p-4 sm:flex-row sm:justify-between">
        {pending ? (
          <div className="w-full">
            <div className="flex justify-between text-sm font-bold text-navy-900">
              <span>در حال ارسال مدارک...</span>
              <span>{toFa(progress)}٪</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand-200">
              <motion.div className="h-full rounded-full bg-crimson-500" animate={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted">با ارسال فرم، صحت اطلاعات و مدارک را تایید می‌کنید.</p>
            <button type="submit" className="btn-primary w-full px-10 sm:w-auto">
              <Send className="h-4 w-4" />
              ثبت نهایی درخواست
            </button>
          </>
        )}
      </div>
    </form>
  );
}
