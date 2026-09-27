"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Alert, Field, SubmitButton, postJson } from "./field";
import { SERVICES } from "@/data/content";

export function LeadForm({ compact = false }: { compact?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setError(null);
    try {
      await postJson("/api/leads", Object.fromEntries(new FormData(form)));
      setDone(true);
      form.reset();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <Alert tone="success">
        درخواست شما ثبت شد. کارشناسان پاشا آکادمی حداکثر تا ۲۴ ساعت آینده با شما تماس می‌گیرند.
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
      {/* Honeypot: hidden from humans */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Field label="نام و نام خانوادگی" htmlFor="lead-name" required>
        <input id="lead-name" name="name" required className="input" autoComplete="name" />
      </Field>
      <Field label="شماره تماس / واتساپ" htmlFor="lead-phone" required>
        <input id="lead-phone" name="phone" required className="input" dir="ltr" inputMode="tel" autoComplete="tel" />
      </Field>
      {!compact && (
        <Field label="ایمیل" htmlFor="lead-email">
          <input id="lead-email" name="email" type="email" className="input" dir="ltr" autoComplete="email" />
        </Field>
      )}
      <Field label="خدمت مورد نظر" htmlFor="lead-service" className={compact ? "sm:col-span-2" : ""}>
        <select id="lead-service" name="service" className="input" defaultValue="">
          <option value="">انتخاب کنید</option>
          {SERVICES.map((s) => (
            <option key={s.slug} value={s.title}>{s.title}</option>
          ))}
        </select>
      </Field>
      <Field label="توضیحات" htmlFor="lead-message" className="sm:col-span-2">
        <textarea id="lead-message" name="message" rows={compact ? 3 : 4} className="input resize-none" placeholder="رشته، مقطع و شهر مورد علاقه‌تان را بنویسید" />
      </Field>
      {error && <div className="sm:col-span-2"><Alert tone="error">{error}</Alert></div>}
      <div className="sm:col-span-2">
        <SubmitButton pending={pending} className="btn-primary w-full py-4">
          <Send className="h-4 w-4" />
          درخواست مشاوره رایگان
        </SubmitButton>
      </div>
    </form>
  );
}
