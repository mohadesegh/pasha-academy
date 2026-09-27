import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/layout/auth-shell";
import { AuthForm } from "@/components/forms/auth-form";

export const metadata: Metadata = {
  title: "ثبت‌نام دانشجو",
  description: "با ساخت حساب کاربری در پاشا آکادمی، درخواست پذیرش، اقامت یا خوابگاه ثبت کنید و مدارک خود را آپلود کنید.",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return (
    <AuthShell title="ساخت حساب دانشجویی" lead="با یک حساب کاربری، همه درخواست‌ها و مدارک خود را در یک پنل مدیریت کنید.">
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </AuthShell>
  );
}
