import Link from "next/link";
import { LogOut } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { PortalNav, type NavItem } from "./portal-nav";
import type { CurrentUser } from "@/lib/auth";

const ROLE_LABEL = { ADMIN: "مدیریت", AGENT: "پورتال نمایندگان", STUDENT: "پنل دانشجو" } as const;

export function PortalShell({ user, nav, children }: { user: CurrentUser; nav: NavItem[]; children: React.ReactNode }) {
  const header = (
    <Link href="/" className="flex items-center gap-3">
      <LogoMark className="h-10 w-10" />
      <span className="leading-tight">
        <span className="block font-black text-white">پاشا آکادمی</span>
        <span className="block text-xs font-bold text-gold-300">{ROLE_LABEL[user.role]}</span>
      </span>
    </Link>
  );

  const footer = (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="truncate font-bold text-white">{user.name}</p>
      <p className="truncate text-xs text-white/50" dir="ltr">{user.email}</p>
      <form action="/api/auth/logout" method="post" className="mt-3">
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2 text-sm font-bold text-white transition hover:bg-crimson-500">
          <LogOut className="h-4 w-4" />
          خروج
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-dvh bg-sand-50">
      <PortalNav items={nav} header={header} footer={footer} />
      <div className="lg:pr-72">
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ title, lead, action }: { title: string; lead?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-black text-navy-950 sm:text-3xl">{title}</h1>
        {lead && <p className="mt-2 text-muted">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, tone = "navy", icon }: { label: string; value: string; tone?: "navy" | "crimson" | "gold" | "turquoise"; icon: React.ReactNode }) {
  const tones = {
    navy: "bg-navy-50 text-navy-700",
    crimson: "bg-crimson-50 text-crimson-500",
    gold: "bg-gold-50 text-gold-600",
    turquoise: "bg-turquoise-50 text-turquoise-600",
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`grid h-12 w-12 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span>
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="text-2xl font-black text-navy-950">{value}</p>
      </div>
    </div>
  );
}
