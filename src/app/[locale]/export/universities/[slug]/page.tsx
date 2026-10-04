import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExportDocument, usd } from "@/components/export/export-document";
import { PROGRAM_DEGREES, PROGRAM_LANGUAGES, SITE, type ProgramDegree, type ProgramLanguage } from "@/lib/constants";
import { exportUniversityPrograms } from "@/lib/export-data";
import { db } from "@/lib/db";
import { safeRead } from "@/lib/universities";
import { SEED_UNIVERSITIES } from "@/data/universities";
import { toFa } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;
// New universities get their export on first visit (the [locale] layout only fixes the languages).
export const dynamicParams = true;

export async function generateStaticParams() {
  const rows = await safeRead(
    () => db.university.findMany({ where: { published: true }, select: { slug: true } }),
    SEED_UNIVERSITIES.map((u) => ({ slug: u.slug })),
  );
  return rows.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await exportUniversityPrograms((await params).slug);
  return {
    title: { absolute: data ? `رشته‌ها و شهریه‌های ${data.university.name} - ${SITE.name}` : SITE.name },
    robots: { index: false, follow: false },
  };
}

export default async function ExportUniversityProgramsPage({ params }: Props) {
  const data = await exportUniversityPrograms((await params).slug);
  if (!data) notFound();
  const { university: u, programs } = data;

  // One table per degree, in the catalogue's degree order.
  const groups = [...new Set(programs.map((p) => p.degree))].map((degree) => ({
    degree,
    label: PROGRAM_DEGREES[degree as ProgramDegree]?.fa ?? degree,
    rows: programs.filter((p) => p.degree === degree),
  }));
  const hasSample = programs.some((p) => p.sample);

  return (
    <ExportDocument title={`رشته‌ها و شهریه‌های ${u.name}`} subtitle={`${u.nameEn} · ${u.city} · ${toFa(programs.length)} رشته`}>
      {programs.length === 0 && <p className="text-sm text-[#6b7280]">هنوز رشته‌ای برای این دانشگاه ثبت نشده است.</p>}
      {groups.map((g) => (
        <section key={g.degree}>
          <h2 className="export-section-title">{g.label}</h2>
          <table className="export-table">
            <thead>
              <tr>
                <th>رشته</th>
                <th>زبان</th>
                <th>مدت</th>
                <th>شهریه سالانه</th>
                <th>کل دوره (نقدی)</th>
                <th>بورسیه ۱۰۰٪ پاشا</th>
              </tr>
            </thead>
            <tbody>
              {g.rows.map((p, i) => (
                <tr key={`${p.name}-${p.language}-${i}`}>
                  <td className="font-bold text-[#06142a]">{p.name}</td>
                  <td>{PROGRAM_LANGUAGES[p.language as ProgramLanguage]?.fa ?? p.language}</td>
                  <td className="whitespace-nowrap">{toFa(p.durationYears)} سال</td>
                  <td className="whitespace-nowrap">{usd(p.tuition)}</td>
                  <td className="whitespace-nowrap">{usd(p.cashTotal)}</td>
                  <td className="whitespace-nowrap font-bold text-[#a7772c]">{usd(p.scholarshipPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
      {hasSample && <p className="mt-4 text-[11px] font-bold text-[#a7772c]">قیمت‌های این سند فعلا نمونه هستند و به‌زودی با لیست قیمت رسمی جایگزین می‌شوند.</p>}
    </ExportDocument>
  );
}
