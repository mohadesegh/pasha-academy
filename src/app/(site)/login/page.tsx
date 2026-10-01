import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Briefcase, GraduationCap } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { AuthForm } from "@/components/forms/auth-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ورود به پنل",
  robots: { index: false, follow: true },
  alternates: { canonical: "/login" },
};

type Props = { searchParams: Promise<{ as?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const agent = sp.as === "agent";
  const next = sp.next ? `&next=${encodeURIComponent(sp.next)}` : "";
  const tabs = [
    { key: "student", href: `/login?as=student${next}`, label: "ورود دانشجو", icon: GraduationCap, active: !agent },
    { key: "agent", href: `/login?as=agent${next}`, label: "ورود همکار", icon: Briefcase, active: agent },
  ];

  return (
    <AuthShell
      title={agent ? "ورود همکاران و نمایندگان" : "ورود دانشجویان"}
      lead={
        agent
          ? "نمایندگان و موسسات همکار از این بخش وارد پورتال نمایندگی می‌شوند تا پرونده دانشجویان خود را ثبت و پیگیری کنند."
          : "دانشجویان از این بخش وارد پنل خود می‌شوند تا درخواست ثبت کنند، مدارک را بارگذاری و وضعیت را پیگیری کنند."
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-sand-100 p-1" role="tablist" aria-label="نوع ورود">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            role="tab"
            aria-selected={t.active}
            replace
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-extrabold transition",
              t.active ? "bg-navy-950 text-white shadow-soft" : "text-navy-800 hover:bg-white",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </Link>
        ))}
      </div>
      <Suspense>
        <AuthForm mode="login" audience={agent ? "agent" : "student"} />
      </Suspense>
    </AuthShell>
  );
}
