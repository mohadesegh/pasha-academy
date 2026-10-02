import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { AlertTriangle, ChevronLeft, ChevronRight, Pencil, Plus, Search } from "lucide-react";
import { PageTitle } from "@/components/portal/portal-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { PROGRAM_DEGREES, PROGRAM_DEGREE_KEYS, PROGRAM_LANGUAGES, type ProgramDegree, type ProgramLanguage } from "@/lib/constants";
import { formatNumber, toFa } from "@/lib/utils";
import { DeleteSamplesButton } from "./delete-samples-button";

const PAGE_SIZE = 50;

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminProgramsPage({ searchParams }: Props) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const university = sp.university ?? "";
  const degree = sp.degree && (PROGRAM_DEGREE_KEYS as string[]).includes(sp.degree) ? sp.degree : "";
  const scholarship = sp.scholarship === "1";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: Prisma.ProgramWhereInput = {
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { nameEn: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(university && { universityId: university }),
    ...(degree && { degree }),
    ...(scholarship && { scholarshipPrice: { not: null } }),
  };

  const [programs, total, sampleCount, universities] = await Promise.all([
    db.program.findMany({
      where,
      orderBy: [{ university: { name: "asc" } }, { degree: "asc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { university: { select: { name: true } } },
    }),
    db.program.count({ where }),
    db.program.count({ where: { sample: true } }),
    db.university.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Builds a list URL that keeps the current filters and only swaps the page.
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (university) params.set("university", university);
    if (degree) params.set("degree", degree);
    if (scholarship) params.set("scholarship", "1");
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/admin/programs?${s}` : "/admin/programs";
  };

  return (
    <>
      <PageTitle
        title="رشته‌ها و شهریه‌ها"
        lead={`${toFa(total)} رشته`}
        action={<Link href="/admin/programs/new" className="btn-primary"><Plus className="h-4 w-4" />افزودن رشته</Link>}
      />

      {sampleCount > 0 && (
        <div className="card mb-6 flex flex-col gap-3 border-gold-300 bg-gold-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm font-bold text-navy-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
            رشته‌های دارای برچسب نمونه داده آزمایشی هستند و باید با قیمت‌های واقعی جایگزین شوند.
            <span className="text-muted">({toFa(sampleCount)} رشته نمونه)</span>
          </p>
          <DeleteSamplesButton count={sampleCount} />
        </div>
      )}

      <form method="GET" className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1.5fr_1fr_auto_auto] lg:items-center">
        <input name="q" defaultValue={q} placeholder="جستجوی نام رشته…" aria-label="جستجوی نام رشته" className="input" />
        <select name="university" defaultValue={university} aria-label="دانشگاه" className="input">
          <option value="">همه دانشگاه‌ها</option>
          {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select name="degree" defaultValue={degree} aria-label="مقطع" className="input">
          <option value="">همه مقاطع</option>
          {PROGRAM_DEGREE_KEYS.map((k) => <option key={k} value={k}>{PROGRAM_DEGREES[k].fa}</option>)}
        </select>
        <label className="flex items-center gap-2 whitespace-nowrap text-sm font-bold text-navy-900">
          <input type="checkbox" name="scholarship" value="1" defaultChecked={scholarship} className="h-4 w-4 accent-crimson-500" />
          فقط دارای بورسیه
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary btn-sm"><Search className="h-4 w-4" />فیلتر</button>
          <Link href="/admin/programs" className="btn-outline btn-sm">پاک کردن</Link>
        </div>
      </form>

      {programs.length === 0 ? (
        <div className="card p-10 text-center text-muted">رشته‌ای با این مشخصات پیدا نشد.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-sand-100 text-right text-xs text-muted">
                <tr>
                  <th className="px-5 py-3 font-bold">رشته</th>
                  <th className="px-5 py-3 font-bold">دانشگاه</th>
                  <th className="px-5 py-3 font-bold">مقطع</th>
                  <th className="px-5 py-3 font-bold">زبان</th>
                  <th className="px-5 py-3 font-bold">مدت</th>
                  <th className="px-5 py-3 font-bold">شهریه سالانه</th>
                  <th className="px-5 py-3 font-bold">بورسیه</th>
                  <th className="px-5 py-3"><span className="sr-only">ویرایش</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {programs.map((p) => (
                  <tr key={p.id} className="group transition hover:bg-sand-50">
                    <td className="px-5 py-4">
                      <Link href={`/admin/programs/${p.id}`} className="font-extrabold text-navy-950 group-hover:text-crimson-500">
                        {p.name}
                      </Link>
                      {p.sample && <span className="mr-1.5 inline-block rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold text-gold-600">نمونه</span>}
                      {!p.active && <span className="mr-1.5 inline-block rounded-full bg-sand-200 px-2 py-0.5 text-[10px] font-bold text-muted">غیرفعال</span>}
                      {p.nameEn && <p className="mt-0.5 text-xs text-muted" dir="ltr">{p.nameEn}</p>}
                    </td>
                    <td className="px-5 py-4 text-navy-900">{p.university.name}</td>
                    <td className="px-5 py-4">{PROGRAM_DEGREES[p.degree as ProgramDegree]?.fa ?? p.degree}</td>
                    <td className="px-5 py-4">{PROGRAM_LANGUAGES[p.language as ProgramLanguage]?.fa ?? p.language}</td>
                    <td className="px-5 py-4 text-muted">{toFa(p.durationYears)} سال</td>
                    <td className="px-5 py-4 font-bold text-navy-950">{formatNumber(p.tuition)} دلار</td>
                    <td className="px-5 py-4">{p.scholarshipPrice != null ? `${formatNumber(p.scholarshipPrice)} دلار` : <span className="text-muted">—</span>}</td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/programs/${p.id}`} className="grid h-9 w-9 place-items-center rounded-full bg-navy-950 text-white hover:bg-navy-800" aria-label="ویرایش">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3" aria-label="صفحه‌بندی">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="btn-outline btn-sm"><ChevronRight className="h-4 w-4" />قبلی</Link>
          ) : (
            <span className="btn-outline btn-sm pointer-events-none opacity-50"><ChevronRight className="h-4 w-4" />قبلی</span>
          )}
          <span className="text-sm font-bold text-muted">صفحه {toFa(page)} از {toFa(pages)}</span>
          {page < pages ? (
            <Link href={pageHref(page + 1)} className="btn-outline btn-sm">بعدی<ChevronLeft className="h-4 w-4" /></Link>
          ) : (
            <span className="btn-outline btn-sm pointer-events-none opacity-50">بعدی<ChevronLeft className="h-4 w-4" /></span>
          )}
        </nav>
      )}
    </>
  );
}
