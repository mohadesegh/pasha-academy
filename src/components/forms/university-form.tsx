"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import { Alert, Field, SubmitButton, postJson } from "./field";
import { TURKEY_CITIES } from "@/lib/constants";

export type UniversityFormValues = {
  id?: string;
  slug: string;
  name: string;
  nameEn: string;
  city: string;
  type: string;
  founded: number | null;
  students: number | null;
  tuitionFrom: number | null;
  languages: string;
  programs: string;
  summary: string;
  description: string;
  website: string | null;
  logo: string | null;
  color: string;
  featured: boolean;
  published: boolean;
};

export const EMPTY_UNIVERSITY: UniversityFormValues = {
  slug: "", name: "", nameEn: "", city: "استانبول", type: "PRIVATE", founded: null, students: null, tuitionFrom: null,
  languages: "انگلیسی,ترکی", programs: "", summary: "", description: "", website: "", logo: "", color: "#0b2340", featured: false, published: true,
};

export function UniversityForm({ initial }: { initial: UniversityFormValues }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState(initial.color);
  const [logo, setLogo] = useState(initial.logo ?? "");
  const isEdit = Boolean(initial.id);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      ...Object.fromEntries(fd),
      featured: fd.get("featured") === "on",
      published: fd.get("published") === "on",
    };
    setPending(true);
    setError(null);
    try {
      await postJson(isEdit ? `/api/admin/universities/${initial.id}` : "/api/admin/universities", body, isEdit ? "PATCH" : "POST");
      router.push("/admin/universities");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  async function onDelete() {
    if (!initial.id || !confirm(`دانشگاه «${initial.name}» حذف شود؟`)) return;
    setPending(true);
    try {
      await postJson(`/api/admin/universities/${initial.id}`, {}, "DELETE");
      router.push("/admin/universities");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-6 p-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="نام فارسی" htmlFor="name" required>
          <input id="name" name="name" defaultValue={initial.name} required className="input" />
        </Field>
        <Field label="نام انگلیسی" htmlFor="nameEn" required>
          <input id="nameEn" name="nameEn" defaultValue={initial.nameEn} required className="input" dir="ltr" />
        </Field>
        <Field label="اسلاگ (آدرس صفحه)" htmlFor="slug" required hint="مثلا istanbul-university — فقط حروف انگلیسی کوچک و خط تیره">
          <input id="slug" name="slug" defaultValue={initial.slug} required className="input" dir="ltr" />
        </Field>
        <Field label="وب‌سایت رسمی" htmlFor="website">
          <input id="website" name="website" defaultValue={initial.website ?? ""} className="input" dir="ltr" placeholder="https://" />
        </Field>
        <Field label="لوگو" htmlFor="logo" hint="آدرس تصویر لوگو (https://...) یا مسیر فایل در public مثل /images/universities/koc.png — ترجیحا PNG/SVG با پس‌زمینه شفاف">
          <div className="flex items-center gap-3">
            <input id="logo" name="logo" value={logo} onChange={(e) => setLogo(e.target.value)} className="input" dir="ltr" placeholder="/images/universities/..." />
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-12 w-12 shrink-0 rounded-xl border border-line bg-white object-contain p-1" />
            )}
          </div>
        </Field>
        <Field label="شهر" htmlFor="city" required>
          <input id="city" name="city" list="cities" defaultValue={initial.city} required className="input" />
          <datalist id="cities">{TURKEY_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="نوع" htmlFor="type" required>
          <select id="type" name="type" defaultValue={initial.type} className="input">
            <option value="PUBLIC">دولتی</option>
            <option value="PRIVATE">خصوصی</option>
          </select>
        </Field>
        <Field label="سال تاسیس (میلادی)" htmlFor="founded">
          <input id="founded" name="founded" type="number" defaultValue={initial.founded ?? ""} className="input" dir="ltr" />
        </Field>
        <Field label="تعداد دانشجو" htmlFor="students">
          <input id="students" name="students" type="number" defaultValue={initial.students ?? ""} className="input" dir="ltr" />
        </Field>
        <Field label="شهریه سالانه از (دلار)" htmlFor="tuitionFrom">
          <input id="tuitionFrom" name="tuitionFrom" type="number" defaultValue={initial.tuitionFrom ?? ""} className="input" dir="ltr" />
        </Field>
        <Field label="زبان‌های تدریس" htmlFor="languages" required hint="با ویرگول جدا کنید">
          <input id="languages" name="languages" defaultValue={initial.languages} required className="input" />
        </Field>
        <Field label="رشته‌ها / دانشکده‌ها" htmlFor="programs" required hint="با ویرگول جدا کنید" className="sm:col-span-2">
          <textarea id="programs" name="programs" defaultValue={initial.programs} rows={2} required className="input resize-none" />
        </Field>
        <Field label="خلاصه (برای کارت و توضیحات متا)" htmlFor="summary" required className="sm:col-span-2">
          <input id="summary" name="summary" defaultValue={initial.summary} required maxLength={300} className="input" />
        </Field>
        <Field label="توضیحات کامل" htmlFor="description" required hint="پاراگراف‌ها را با خط خالی جدا کنید" className="sm:col-span-2">
          <textarea id="description" name="description" defaultValue={initial.description} rows={7} required className="input" />
        </Field>
        <Field label="رنگ برند" htmlFor="color">
          <div className="flex items-center gap-3">
            <input type="color" aria-label="انتخاب رنگ" value={color} onChange={(e) => setColor(e.target.value)} className="h-12 w-14 cursor-pointer rounded-xl border border-line bg-white p-1" />
            <input id="color" name="color" value={color} onChange={(e) => setColor(e.target.value)} className="input" dir="ltr" />
          </div>
        </Field>
        <div className="flex flex-col justify-end gap-3 pb-2">
          <label className="flex items-center gap-2 text-sm font-bold text-navy-900">
            <input type="checkbox" name="published" defaultChecked={initial.published} className="h-4 w-4 accent-crimson-500" />
            نمایش در سایت
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-navy-900">
            <input type="checkbox" name="featured" defaultChecked={initial.featured} className="h-4 w-4 accent-crimson-500" />
            دانشگاه ویژه (نمایش در صفحه اصلی)
          </label>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-6">
        <SubmitButton pending={pending}>
          <Save className="h-4 w-4" />
          {isEdit ? "ذخیره تغییرات" : "افزودن دانشگاه"}
        </SubmitButton>
        {isEdit && (
          <button type="button" onClick={onDelete} disabled={pending} className="btn border border-crimson-200 bg-white text-crimson-600 hover:bg-crimson-50">
            <Trash2 className="h-4 w-4" />
            حذف دانشگاه
          </button>
        )}
      </div>
    </form>
  );
}
