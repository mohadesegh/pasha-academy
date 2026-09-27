import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "پنل مدیریت", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  return (
    <PortalShell
      user={user}
      nav={[
        { href: "/admin", label: "داشبورد", icon: "LayoutDashboard", exact: true },
        { href: "/admin/applications", label: "درخواست‌ها و مدارک", icon: "FolderKanban" },
        { href: "/admin/agents", label: "نمایندگان", icon: "Users" },
        { href: "/admin/universities", label: "دانشگاه‌ها", icon: "Building2" },
        { href: "/admin/leads", label: "درخواست‌های مشاوره", icon: "Inbox" },
        { href: "/", label: "مشاهده سایت", icon: "Globe", exact: true },
      ]}
    >
      {children}
    </PortalShell>
  );
}
