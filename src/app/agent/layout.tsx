import type { Metadata } from "next";
import { Hourglass, ShieldOff } from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { requireRole } from "@/lib/auth";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "پورتال نمایندگان", robots: { index: false, follow: false } };

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("AGENT");
  const approved = user.agentStatus === "APPROVED";

  return (
    <PortalShell
      user={user}
      nav={
        approved
          ? [
              { href: "/agent", label: "داشبورد", icon: "LayoutDashboard", exact: true },
              { href: "/agent/applications", label: "پرونده‌ها", icon: "FolderKanban" },
              { href: "/agent/new", label: "ثبت پرونده جدید", icon: "FilePlus2" },
              { href: "/universities", label: "دانشگاه‌ها", icon: "Building2" },
            ]
          : [{ href: "/agent", label: "وضعیت حساب", icon: "LayoutDashboard", exact: true }]
      }
    >
      {approved ? (
        children
      ) : (
        <div className="card mx-auto mt-10 max-w-xl p-10 text-center">
          {user.agentStatus === "SUSPENDED" ? (
            <>
              <ShieldOff className="mx-auto h-14 w-14 text-crimson-500" />
              <h1 className="mt-5 text-2xl font-black text-navy-950">حساب نمایندگی غیرفعال است</h1>
              <p className="mt-3 leading-8 text-muted">برای پیگیری با تیم همکاری پاشا آکادمی تماس بگیرید: <span dir="ltr">{SITE.phone}</span></p>
            </>
          ) : (
            <>
              <Hourglass className="mx-auto h-14 w-14 animate-pulse text-gold-500" />
              <h1 className="mt-5 text-2xl font-black text-navy-950">درخواست نمایندگی شما در حال بررسی است</h1>
              <p className="mt-3 leading-8 text-muted">
                {user.companyName} عزیز، از درخواست همکاری شما سپاسگزاریم. کارشناسان ما به‌زودی با شما تماس می‌گیرند و پس از
                تایید، دسترسی کامل به پورتال نمایندگان فعال می‌شود.
              </p>
            </>
          )}
        </div>
      )}
    </PortalShell>
  );
}
