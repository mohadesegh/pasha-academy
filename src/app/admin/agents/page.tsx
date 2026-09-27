import Link from "next/link";
import { Users } from "lucide-react";
import { PageTitle } from "@/components/portal/portal-shell";
import { StatusBadge } from "@/components/ui/badge";
import { AgentStatusSelect } from "@/components/portal/admin-actions";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { AGENT_STATUSES } from "@/lib/constants";
import { cn, formatDate, toFa } from "@/lib/utils";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminAgentsPage({ searchParams }: Props) {
  await requireRole("ADMIN");
  const { status } = await searchParams;
  const filter = status && status in AGENT_STATUSES ? status : undefined;
  const agents = await db.user.findMany({
    where: { role: "AGENT", ...(filter ? { agentStatus: filter } : {}) },
    select: {
      id: true, name: true, email: true, phone: true, companyName: true, city: true, agentStatus: true, createdAt: true,
      _count: { select: { agentApplications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const tabs = [{ key: "", label: "همه" }, ...Object.entries(AGENT_STATUSES).map(([k, v]) => ({ key: k, label: v.label }))];

  return (
    <>
      <PageTitle title="نمایندگان (ساب‌ایجنت‌ها)" lead="تایید، فعال‌سازی یا غیرفعال‌سازی حساب نمایندگان" />
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/admin/agents?status=${t.key}` : "/admin/agents"}
            className={cn("rounded-full px-4 py-2 text-sm font-bold", (filter ?? "") === t.key ? "bg-navy-950 text-white" : "bg-white text-navy-800 ring-1 ring-line")}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {agents.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-muted"><Users className="h-12 w-12 text-navy-200" />نماینده‌ای یافت نشد.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-sand-100 text-right text-xs text-muted">
              <tr>
                <th className="px-5 py-3 font-bold">موسسه / نماینده</th>
                <th className="px-5 py-3 font-bold">تماس</th>
                <th className="px-5 py-3 font-bold">پرونده‌ها</th>
                <th className="px-5 py-3 font-bold">تاریخ عضویت</th>
                <th className="px-5 py-3 font-bold">وضعیت</th>
                <th className="px-5 py-3 font-bold">تغییر وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {agents.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-4">
                    <p className="font-extrabold text-navy-950">{a.companyName}</p>
                    <p className="text-xs text-muted">{a.name} · {a.city}</p>
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <p dir="ltr" className="text-right">{a.email}</p>
                    <p dir="ltr" className="text-right text-muted">{a.phone}</p>
                  </td>
                  <td className="px-5 py-4 font-bold">{toFa(a._count.agentApplications)}</td>
                  <td className="px-5 py-4 text-muted">{formatDate(a.createdAt)}</td>
                  <td className="px-5 py-4"><StatusBadge map={AGENT_STATUSES} value={a.agentStatus ?? "PENDING"} /></td>
                  <td className="px-5 py-4"><AgentStatusSelect id={a.id} status={a.agentStatus ?? "PENDING"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
