import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "پنل دانشجو", robots: { index: false, follow: false } };

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("STUDENT");
  return (
    <PortalShell
      user={user}
      nav={[
        { href: "/dashboard", label: "درخواست‌های من", icon: "LayoutDashboard", exact: true },
        { href: "/dashboard/apply", label: "ثبت درخواست جدید", icon: "FilePlus2" },
        { href: "/dashboard/universities", label: "دانشگاه‌ها", icon: "Building2" },
        { href: "/", label: "بازگشت به سایت", icon: "Globe", exact: true },
      ]}
    >
      {children}
    </PortalShell>
  );
}
