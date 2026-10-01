"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import { Alert, Field, SubmitButton, postJson } from "./field";
import { PROGRAM_DEGREES, PROGRAM_DEGREE_KEYS, PROGRAM_LANGUAGES, PROGRAM_LANGUAGE_KEYS } from "@/lib/constants";

export type ProgramFormValues = {
  id?: string;
  universityId: string;
  name: string;
  nameEn: string | null;
  faculty: string | null;
  degree: string;
  language: string;
  durationYears: number;
  tuition: number | null;
  cashTotal: number | null;
  deposit: number | null;
  prepFee: number | null;
  scholarshipPrice: number | null;
  active: boolean;
};

export const EMPTY_PROGRAM: ProgramFormValues = {
  universityId: "", name: "", nameEn: "", faculty: "", degree: "BACHELOR", language: "EN", durationYears: 4,
  tuition: null, cashTotal: null, deposit: null, prepFee: null, scholarshipPrice: null, active: true,
};

export function ProgramForm({
  initial,
  universities,
}: {
  initial: ProgramFormValues;
  universities: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(initial.id);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = { ...Object.fromEntries(fd), active: fd.get("active") === "on" };
    setPending(true);
    setError(null);
    try {
      await postJson(isEdit ? `/api/admin/programs/${initial.id}` : "/api/admin/programs", body, isEdit ? "PATCH" : "POST");
      router.push("/admin/programs");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  async function onDelete() {
    if (!initial.id || !confirm(`رشته «${initial.name}» حذف شود؟`)) return;
    setPending(true);
    try {
      await postJson(`/api/admin/programs/${initial.id}`, {}, "DELETE");
      router.push("/admin/programs");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-6 p-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="دانشگاه" htmlFor="universityId" required className="sm:col-span-2">
          <select id="universityId" name="universityId" defaultValue={initial.universityId} required className="input">
            <option value="">انتخاب دانشگاه…</option>
            {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
        <Field label="نام رشته (فارسی)" htmlFor="name" required>
          <input id="name" name="name" defaultValue={initial.name} required className="input" />
        </Field>
        <Field label="نام انگلیسی" htmlFor="nameEn">
          <input id="nameEn" name="nameEn" defaultValue={initial.nameEn ?? ""} className="input" dir="ltr" />
        </Field>
        <Field label="دانشکده" htmlFor="faculty">
          <input id="faculty" name="faculty" defaultValue={initial.faculty ?? ""} className="input" />
        </Field>
        <Field label="مقطع" htmlFor="degree" required>
          <select id="degree" name="degree" defaultValue={initial.degree} className="input">
            {PROGRAM_DEGREE_KEYS.map((k) => <option key={k} value={k}>{PROGRAM_DEGREES[k].fa}</option>)}
          </select>
        </Field>
        <Field label="زبان تدریس" htmlFor="language" required>
          <select id="language" name="language" defaultValue={initial.language} className="input">
            {PROGRAM_LANGUAGE_KEYS.map((k) => <option key={k} value={k}>{PROGRAM_LANGUAGES[k].fa}</option>)}
          </select>
        </Field>
        <Field label="مدت تحصیل (سال)" htmlFor="durationYears" required>
          <input id="durationYears" name="durationYears" type="number" min={1} max={8} defaultValue={initial.durationYears} required className="input" dir="ltr" />
        </Field>
        <Field label="شهریه سالانه (دلار)" htmlFor="tuition" required hint="پرداخت ترم به ترم">
          <input id="tuition" name="tuition" type="number" min={0} defaultValue={initial.tuition ?? ""} required className="input" dir="ltr" />
        </Field>
        <Field label="مبلغ کل نقدی (دلار)" htmlFor="cashTotal" hint="در صورت پرداخت یکجای کل دوره">
          <input id="cashTotal" name="cashTotal" type="number" min={0} defaultValue={initial.cashTotal ?? ""} className="input" dir="ltr" />
        </Field>
        <Field label="ودیعه / پیش‌پرداخت (دلار)" htmlFor="deposit">
          <input id="deposit" name="deposit" type="number" min={0} defaultValue={initial.deposit ?? ""} className="input" dir="ltr" />
        </Field>
        <Field label="شهریه سال آمادگی زبان (دلار)" htmlFor="prepFee">
          <input id="prepFee" name="prepFee" type="number" min={0} defaultValue={initial.prepFee ?? ""} className="input" dir="ltr" />
        </Field>
        <Field label="قیمت بورسیه (دلار)" htmlFor="scholarshipPrice" hint="قیمت کل صندلی بورسیه ۱۰۰٪ پاشا آکادمی؛ خالی = بدون بورسیه">
          <input id="scholarshipPrice" name="scholarshipPrice" type="number" min={0} defaultValue={initial.scholarshipPrice ?? ""} className="input" dir="ltr" />
        </Field>
        <div className="flex flex-col justify-end gap-3 pb-2">
          <label className="flex items-center gap-2 text-sm font-bold text-navy-900">
            <input type="checkbox" name="active" defaultChecked={initial.active} className="h-4 w-4 accent-crimson-500" />
            فعال (نمایش در سایت)
          </label>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-6">
        <SubmitButton pending={pending}>
          <Save className="h-4 w-4" />
          {isEdit ? "ذخیره تغییرات" : "افزودن رشته"}
        </SubmitButton>
        {isEdit && (
          <button type="button" onClick={onDelete} disabled={pending} className="btn border border-crimson-200 bg-white text-crimson-600 hover:bg-crimson-50">
            <Trash2 className="h-4 w-4" />
            حذف رشته
          </button>
        )}
      </div>
    </form>
  );
}
