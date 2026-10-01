import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowRight, Building, CalendarDays, ExternalLink, FilePlus2, GraduationCap, Languages, MapPin, Users, Wallet } from "lucide-react";
import { PageTitle } from "@/components/portal/portal-shell";
import { UniMonogram } from "./university-card";
import { UniversityExplorer } from "./university-explorer";
import { db } from "@/lib/db";
import { getUniversityBySlug } from "@/lib/universities";
import { formatNumber, splitList, toFa } from "@/lib/utils";

/** University list rendered inside a portal, so browsing never leaves the panel. */
export async function PanelUniversityList({ basePath, lead }: { basePath: string; lead: string }) {
  const universities = await db.university.findMany({
    where: { published: true },
    select: { slug: true, name: true, nameEn: true, city: true, type: true, tuitionFrom: true, languages: true, summary: true, color: true, programs: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
  return (
    <>
      <PageTitle title="دانشگاه‌ها" lead={lead} />
      <Suspense>
        <UniversityExplorer universities={universities} hrefBase={basePath} inPanel />
      </Suspense>
    </>
  );
}

/** University details inside a portal, with a shortcut to file an application for it. */
export async function PanelUniversityDetail({
  slug,
  basePath,
  applyBase,
  applyLabel,
}: {
  slug: string;
  basePath: string;
  applyBase: string;
  applyLabel: string;
}) {
  const u = await getUniversityBySlug(slug);
  if (!u) notFound();

  const facts = [
    { icon: MapPin, label: "شهر", value: u.city },
    { icon: Building, label: "نوع دانشگاه", value: u.type === "PUBLIC" ? "دولتی" : "خصوصی (وقفی)" },
    u.founded && { icon: CalendarDays, label: "سال تاسیس", value: toFa(u.founded) },
    u.students && { icon: Users, label: "تعداد دانشجو", value: `حدود ${formatNumber(u.students)}` },
    { icon: Languages, label: "زبان تدریس", value: splitList(u.languages).join("، ") },
    { icon: Wallet, label: "شهریه سالانه", value: u.tuitionFrom ? `از ${formatNumber(u.tuitionFrom)} دلار` : "استعلام" },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string }[];

  const applyHref = `${applyBase}?type=ADMISSION&university=${u.id}`;

  return (
    <>
      <Link href={basePath} className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-navy-950">
        <ArrowRight className="h-4 w-4" />
        بازگشت به دانشگاه‌ها
      </Link>

      <div className="card mb-6 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <UniMonogram name={u.nameEn} color={u.color} className="h-16 w-16" />
          <div>
            <h1 className="text-2xl font-black text-navy-950">{u.name}</h1>
            <p className="mt-1 text-sm text-muted" dir="ltr">{u.nameEn}</p>
          </div>
        </div>
        <Link href={applyHref} className="btn-primary">
          <FilePlus2 className="h-4 w-4" />
          {applyLabel}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-lg font-extrabold text-navy-950">معرفی</h2>
            <p className="mt-3 font-semibold leading-8 text-navy-900">{u.summary}</p>
            <div className="mt-3 space-y-3 leading-8 text-muted">
              {u.description.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>
          <section className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-950"><GraduationCap className="h-5 w-5 text-crimson-500" />رشته‌ها</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {splitList(u.programs).map((p) => (
                <li key={p} className="rounded-full bg-sand-100 px-3 py-1.5 text-sm font-semibold text-navy-900">{p}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="card h-fit p-6">
          <h2 className="font-extrabold text-navy-950">مشخصات</h2>
          <dl className="mt-4 space-y-4">
            {facts.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
                <div>
                  <dt className="text-xs text-muted">{f.label}</dt>
                  <dd className="font-bold text-navy-950">{f.value}</dd>
                </div>
              </div>
            ))}
          </dl>
          {u.website && (
            <a href={u.website} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm mt-6 w-full">
              <ExternalLink className="h-4 w-4" />
              وب‌سایت دانشگاه
            </a>
          )}
        </aside>
      </div>
    </>
  );
}
