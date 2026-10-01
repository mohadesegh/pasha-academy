import Link from "next/link";
import { AlertTriangle, Award, FileClock, FolderKanban, Inbox, Users } from "lucide-react";
import { PageTitle, StatCard } from "@/components/portal/portal-shell";
import { ApplicationsTable, appRowSelect } from "@/components/portal/applications-table";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { APP_TYPES, type AppType } from "@/lib/constants";
import { toFa } from "@/lib/utils";

export default async function AdminDashboard() {
  await requireRole("ADMIN");
  const [total, pendingDocs, needsAction, pendingAgents, newLeads, byType, queue, scholarships] = await Promise.all([
    db.application.count(),
    db.document.count({ where: { status: "PENDING" } }),
    db.application.count({ where: { status: "NEEDS_ACTION" } }),
    db.user.count({ where: { role: "AGENT", agentStatus: "PENDING" } }),
    db.lead.count({ where: { handled: false } }),
    db.application.groupBy({ by: ["type"], _count: true }),
    // Review queue: applications that still have unreviewed documents.
    db.application.findMany({
      where: { documents: { some: { status: "PENDING" } }, status: { notIn: ["APPROVED", "REJECTED"] } },
      select: appRowSelect,
      orderBy: { updatedAt: "asc" },
      take: 10,
    }),
    db.application.findMany({
      where: { scholarshipPercent: { not: null } },
      select: appRowSelect,
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const max = Math.max(1, ...byType.map((t) => t._count));

  return (
    <>
      <PageTitle title="داشبورد مدیریت" lead="نمای کلی درخواست‌ها، مدارک و نمایندگان" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="کل درخواست‌ها" value={toFa(total)} icon={<FolderKanban className="h-6 w-6" />} />
        <StatCard label="مدارک در انتظار بررسی" value={toFa(pendingDocs)} tone="gold" icon={<FileClock className="h-6 w-6" />} />
        <StatCard label="نیاز به اصلاح" value={toFa(needsAction)} tone="crimson" icon={<AlertTriangle className="h-6 w-6" />} />
        <StatCard label="مشاوره‌های جدید" value={toFa(newLeads)} tone="turquoise" icon={<Inbox className="h-6 w-6" />} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="card p-6">
          <h2 className="font-extrabold text-navy-950">درخواست‌ها بر اساس نوع</h2>
          <ul className="mt-5 space-y-4">
            {(Object.keys(APP_TYPES) as AppType[]).map((t) => {
              const c = byType.find((b) => b.type === t)?._count ?? 0;
              return (
                <li key={t}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-semibold text-navy-900">{APP_TYPES[t].label}</span>
                    <span className="font-bold text-navy-950">{toFa(c)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-sand-100">
                    <div className="h-full rounded-full bg-navy-700" style={{ width: `${(c / max) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
        <Link href="/admin/agents?status=PENDING" className="card group flex flex-col justify-between bg-gradient-to-br from-gold-300 to-gold-500 p-6 transition hover:-translate-y-1 hover:shadow-lift">
          <Users className="h-8 w-8 text-navy-950" />
          <div>
            <p className="text-4xl font-black text-navy-950">{toFa(pendingAgents)}</p>
            <p className="mt-1 font-bold text-navy-950/80">درخواست نمایندگی در انتظار تایید</p>
          </div>
        </Link>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-950"><Award className="h-5 w-5 text-gold-500" />استفاده از سهمیه بورسیه</h2>
        <Link href="/admin/applications?scholarship=1" className="text-sm font-bold text-crimson-500">مشاهده همه</Link>
      </div>
      <div className="mb-8">
        <ApplicationsTable rows={scholarships} basePath="/admin/applications" showAgent empty="هنوز هیچ نماینده‌ای از سهمیه بورسیه استفاده نکرده است." />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-navy-950">صف بررسی مدارک</h2>
        <Link href="/admin/applications" className="text-sm font-bold text-crimson-500">همه درخواست‌ها</Link>
      </div>
      <ApplicationsTable rows={queue} basePath="/admin/applications" showAgent empty="مدرکی در انتظار بررسی نیست 🎉" />
    </>
  );
}
