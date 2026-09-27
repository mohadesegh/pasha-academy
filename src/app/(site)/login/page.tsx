import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/layout/auth-shell";
import { AuthForm } from "@/components/forms/auth-form";

export const metadata: Metadata = {
  title: "ورود به پنل",
  robots: { index: false, follow: true },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <AuthShell title="ورود به پنل پاشا آکادمی" lead="دانشجویان، نمایندگان و کارشناسان از این صفحه وارد پنل اختصاصی خود می‌شوند.">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}
