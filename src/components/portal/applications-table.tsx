import Link from "next/link";
import { ChevronLeft, FolderOpen, Paperclip } from "lucide-react";
import { ScholarshipBadge, StatusBadge } from "@/components/ui/badge";
import { APP_STATUSES, APP_TYPES, type AppType } from "@/lib/constants";
import { formatDate, toFa } from "@/lib/utils";

export type AppRow = {
  id: string;
  code: string;
  type: string;
  status: string;
  studentName: string;
  scholarshipPercent: number | null;
  createdAt: Date;
  university?: { name: string } | null;
  agent?: { name: string; companyName: string | null } | null;
  _count: { documents: number };
};

export function ApplicationsTable({ rows, basePath, showAgent = false, empty }: { rows: AppRow[]; basePath: string; showAgent?: boolean; empty?: React.ReactNode }) {
  if (rows.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
        <FolderOpen className="h-12 w-12 text-navy-200" />
        <div className="text-muted">{empty ?? "هنوز درخواستی ثبت نشده است."}</div>
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-sand-100 text-right text-xs text-muted">
            <tr>
              <th className="px-5 py-3 font-bold">متقاضی</th>
              <th className="px-5 py-3 font-bold">نوع</th>
              {showAgent && <th className="px-5 py-3 font-bold">منبع</th>}
              <th className="px-5 py-3 font-bold">مدارک</th>
              <th className="px-5 py-3 font-bold">تاریخ</th>
              <th className="px-5 py-3 font-bold">وضعیت</th>
              <th className="px-5 py-3"><span className="sr-only">جزئیات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} className="group transition hover:bg-sand-50">
                <td className="px-5 py-4">
                  <Link href={`${basePath}/${r.id}`} className="font-extrabold text-navy-950 group-hover:text-crimson-500">
                    {r.studentName}
                  </Link>
                  <p className="font-mono text-xs text-muted" dir="ltr">{r.code}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-navy-900">{APP_TYPES[r.type as AppType]?.short ?? r.type}</p>
                  {r.university && <p className="text-xs text-muted">{r.university.name}</p>}
                  {r.scholarshipPercent && <div className="mt-1.5"><ScholarshipBadge percent={r.scholarshipPercent} /></div>}
                </td>
                {showAgent && (
                  <td className="px-5 py-4 text-xs">
                    {r.agent ? <span className="rounded-full bg-gold-50 px-2 py-1 font-bold text-gold-600">{r.agent.companyName ?? r.agent.name}</span> : <span className="text-muted">مستقیم</span>}
                  </td>
                )}
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 text-muted"><Paperclip className="h-3.5 w-3.5" />{toFa(r._count.documents)}</span>
                </td>
                <td className="px-5 py-4 text-muted">{formatDate(r.createdAt)}</td>
                <td className="px-5 py-4"><StatusBadge map={APP_STATUSES} value={r.status} /></td>
                <td className="px-5 py-4">
                  <Link href={`${basePath}/${r.id}`} className="grid h-8 w-8 place-items-center rounded-full text-navy-300 transition group-hover:bg-navy-950 group-hover:text-white" aria-label={`جزئیات ${r.studentName}`}>
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const appRowSelect = {
  id: true,
  code: true,
  type: true,
  status: true,
  studentName: true,
  scholarshipPercent: true,
  createdAt: true,
  university: { select: { name: true } },
  agent: { select: { name: true, companyName: true } },
  _count: { select: { documents: true } },
} as const;
