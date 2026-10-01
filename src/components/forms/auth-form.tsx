"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { Alert, Field, SubmitButton, postJson } from "./field";

type Mode = "login" | "register" | "agent";

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

/** `audience` only changes the sign-up links on the login form; the account role decides the panel. */
export function AuthForm({ mode, audience = "student" }: { mode: Mode; audience?: "student" | "agent" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const data = await postJson<{ redirect: string }>(url, { ...body, asAgent: mode === "agent" });
      // Students can be sent back to where they came from (e.g. the dormitory form).
      const next = safeNext(params.get("next"));
      router.push(next && data.redirect === "/dashboard" ? next : data.redirect);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  const nextQuery = params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : "";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {mode !== "login" && (
        <Field label="نام و نام خانوادگی" htmlFor="name" required>
          <input id="name" name="name" required className="input" autoComplete="name" />
        </Field>
      )}
      {mode === "agent" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="نام موسسه / مجموعه" htmlFor="companyName" required>
            <input id="companyName" name="companyName" required className="input" autoComplete="organization" />
          </Field>
          <Field label="شهر" htmlFor="city" required>
            <input id="city" name="city" required className="input" />
          </Field>
        </div>
      )}
      <Field label="ایمیل" htmlFor="email" required>
        <input id="email" name="email" type="email" required className="input" dir="ltr" autoComplete="email" />
      </Field>
      {mode !== "login" && (
        <Field label="شماره موبایل" htmlFor="phone" required>
          <input id="phone" name="phone" required className="input" dir="ltr" inputMode="tel" autoComplete="tel" />
        </Field>
      )}
      <Field label="رمز عبور" htmlFor="password" required hint={mode !== "login" ? "حداقل ۸ کاراکتر" : undefined}>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            required
            className="input pl-12"
            dir="ltr"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-navy-900"
            aria-label={showPw ? "پنهان کردن رمز" : "نمایش رمز"}
          >
            {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </Field>

      {error && <Alert tone="error">{error}</Alert>}

      <SubmitButton pending={pending} className="btn-primary w-full py-4">
        {mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
        {mode === "login" ? "ورود" : mode === "agent" ? "ثبت درخواست نمایندگی" : "ایجاد حساب کاربری"}
      </SubmitButton>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          audience === "agent" ? (
          <>هنوز همکار ما نیستید؟ <Link href="/agents#join" className="font-bold text-crimson-500 hover:underline">ثبت درخواست نمایندگی</Link></>
        ) : (
          <>حساب ندارید؟ <Link href={`/register${nextQuery}`} className="font-bold text-crimson-500 hover:underline">ثبت‌نام دانشجو</Link></>
        )
        ) : (
          <>قبلا ثبت‌نام کرده‌اید؟ <Link href={`/login${nextQuery}`} className="font-bold text-crimson-500 hover:underline">وارد شوید</Link></>
        )}
      </p>
    </form>
  );
}
