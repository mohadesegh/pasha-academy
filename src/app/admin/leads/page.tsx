import { Inbox, Mail, Phone } from "lucide-react";
import { PageTitle } from "@/components/portal/portal-shell";
import { LeadToggle } from "@/components/portal/admin-actions";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn, formatDateTime } from "@/lib/utils";

export default async function AdminLeadsPage() {
  await requireRole("ADMIN");
  const leads = await db.lead.findMany({ orderBy: [{ handled: "asc" }, { createdAt: "desc" }], take: 300 });

  return (
    <>
      <PageTitle title="درخواست‌های مشاوره" lead="فرم‌های ارسال‌شده از سایت" />
      {leads.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-muted"><Inbox className="h-12 w-12 text-navy-200" />درخواستی ثبت نشده است.</div>
      ) : (
        <ul className="space-y-3">
          {leads.map((l) => (
            <li key={l.id} className={cn("card p-5", l.handled && "opacity-60")}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-extrabold text-navy-950">{l.name}</p>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted">
                    <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 hover:text-navy-950" dir="ltr"><Phone className="h-3.5 w-3.5" />{l.phone}</a>
                    {l.email && <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 hover:text-navy-950" dir="ltr"><Mail className="h-3.5 w-3.5" />{l.email}</a>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{formatDateTime(l.createdAt)}</span>
                  <LeadToggle id={l.id} handled={l.handled} />
                </div>
              </div>
              {l.service && <p className="mt-3 inline-block rounded-full bg-gold-50 px-3 py-1 text-xs font-bold text-gold-600">{l.service}</p>}
              {l.message && <p className="mt-3 whitespace-pre-line text-sm leading-7 text-navy-900">{l.message}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
