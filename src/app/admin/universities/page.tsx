import Link from "next/link";
import { ExternalLink, Pencil, Plus, Star } from "lucide-react";
import { PageTitle } from "@/components/portal/portal-shell";
import { UniMonogram } from "@/components/university/university-card";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatNumber, toFa } from "@/lib/utils";

export default async function AdminUniversitiesPage() {
  await requireRole("ADMIN");
  const unis = await db.university.findMany({
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    include: { _count: { select: { applications: true } } },
  });

  return (
    <>
      <PageTitle
        title="مدیریت دانشگاه‌ها"
        lead={`${toFa(unis.length)} دانشگاه`}
        action={<Link href="/admin/universities/new" className="btn-primary"><Plus className="h-4 w-4" />افزودن دانشگاه</Link>}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {unis.map((u) => (
          <div key={u.id} className="card flex items-center gap-4 p-4">
            <UniMonogram name={u.nameEn} color={u.color} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-extrabold text-navy-950">
                {u.name}
                {u.featured && <Star className="h-4 w-4 fill-gold-400 text-gold-400" />}
              </p>
              <p className="text-xs text-muted">
                {u.city} · {u.type === "PUBLIC" ? "دولتی" : "خصوصی"} · {u.tuitionFrom ? `از ${formatNumber(u.tuitionFrom)}$` : "—"} · {toFa(u._count.applications)} درخواست
              </p>
              {!u.published && <span className="mt-1 inline-block rounded-full bg-sand-200 px-2 py-0.5 text-[10px] font-bold text-muted">پیش‌نویس</span>}
            </div>
            <div className="flex gap-1">
              <Link href={`/universities/${u.slug}`} target="_blank" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-navy-50" aria-label="مشاهده در سایت"><ExternalLink className="h-4 w-4" /></Link>
              <Link href={`/admin/universities/${u.id}`} className="grid h-9 w-9 place-items-center rounded-full bg-navy-950 text-white hover:bg-navy-800" aria-label="ویرایش"><Pencil className="h-4 w-4" /></Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
