import Link from "next/link";
import { AlertTriangle, CheckCircle2, FolderKanban, Hourglass, Plus } from "lucide-react";
import { PageTitle, StatCard } from "@/components/portal/portal-shell";
import { ApplicationsTable, appRowSelect } from "@/components/portal/applications-table";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { toFa } from "@/lib/utils";

export default async function AgentDashboard() {
  const user = await requireRole("AGENT");
  const where = { agentId: user.id };
  const [total, grouped, recent] = await Promise.all([
    db.application.count({ where }),
    db.application.groupBy({ by: ["status"], where, _count: true }),
    db.application.findMany({ where, select: appRowSelect, orderBy: { updatedAt: "desc" }, take: 8 }),
  ]);
  const count = (s: string) => grouped.find((g) => g.status === s)?._count ?? 0;

  return (
    <>
      <PageTitle
        title={`پورتال نمایندگی ${user.companyName ?? ""}`}
        lead="پرونده دانشجویان خود را ثبت کنید و وضعیت آن‌ها را پیگیری کنید."
        action={<Link href="/agent/new" className="btn-primary"><Plus className="h-4 w-4" />ثبت پرونده جدید</Link>}
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="کل پرونده‌ها" value={toFa(total)} icon={<FolderKanban className="h-6 w-6" />} />
        <StatCard label="در جریان" value={toFa(count("SUBMITTED") + count("IN_REVIEW"))} tone="gold" icon={<Hourglass className="h-6 w-6" />} />
        <StatCard label="نیاز به اقدام" value={toFa(count("NEEDS_ACTION"))} tone="crimson" icon={<AlertTriangle className="h-6 w-6" />} />
        <StatCard label="تایید شده" value={toFa(count("APPROVED"))} tone="turquoise" icon={<CheckCircle2 className="h-6 w-6" />} />
      </div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-navy-950">آخرین پرونده‌ها</h2>
        <Link href="/agent/applications" className="text-sm font-bold text-crimson-500">مشاهده همه</Link>
      </div>
      <ApplicationsTable rows={recent} basePath="/agent/applications" empty="هنوز پرونده‌ای ثبت نکرده‌اید." />
    </>
  );
}
