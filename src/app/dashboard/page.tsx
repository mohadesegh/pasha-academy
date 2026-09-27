import Link from "next/link";
import { BedDouble, GraduationCap, IdCard, Plus } from "lucide-react";
import { PageTitle } from "@/components/portal/portal-shell";
import { ApplicationsTable, appRowSelect } from "@/components/portal/applications-table";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

const QUICK = [
  { type: "DORMITORY", label: "درخواست خوابگاه", icon: BedDouble, cls: "from-gold-300 to-gold-500 text-navy-950" },
  { type: "ADMISSION", label: "درخواست پذیرش", icon: GraduationCap, cls: "from-crimson-500 to-crimson-700 text-white" },
  { type: "RESIDENCE", label: "درخواست اقامت", icon: IdCard, cls: "from-turquoise-400 to-turquoise-600 text-white" },
];

export default async function StudentDashboard() {
  const user = await requireRole("STUDENT");
  const rows = await db.application.findMany({
    where: { studentId: user.id },
    select: appRowSelect,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageTitle
        title={`سلام، ${user.name} 👋`}
        lead="درخواست‌ها و مدارک خود را از اینجا مدیریت کنید."
        action={
          <Link href="/dashboard/apply" className="btn-primary">
            <Plus className="h-4 w-4" />
            درخواست جدید
          </Link>
        }
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {QUICK.map((q) => (
          <Link
            key={q.type}
            href={`/dashboard/apply?type=${q.type}`}
            className={`group flex items-center justify-between rounded-2xl bg-gradient-to-br p-5 font-extrabold shadow-soft transition hover:-translate-y-1 hover:shadow-lift ${q.cls}`}
          >
            {q.label}
            <q.icon className="h-8 w-8 opacity-80 transition group-hover:scale-110" />
          </Link>
        ))}
      </div>
      <h2 className="mb-4 text-lg font-extrabold text-navy-950">درخواست‌های من</h2>
      <ApplicationsTable
        rows={rows}
        basePath="/dashboard/applications"
        empty={<>هنوز درخواستی ثبت نکرده‌اید. <Link href="/dashboard/apply" className="font-bold text-crimson-500">اولین درخواست را ثبت کنید</Link></>}
      />
    </>
  );
}
