import type { Metadata } from "next";
import { ExportDocument, usd } from "@/components/export/export-document";
import { PROGRAM_DEGREES, PROGRAM_LANGUAGES, SITE, type ProgramDegree, type ProgramLanguage } from "@/lib/constants";
import { EXPORT_LIMIT, exportPrograms, programFilterOptions, type ProgramFilters } from "@/lib/programs";
import { toFa } from "@/lib/utils";

// Filters come from the query string (same ones as /programs), so this export renders per request;
// its database reads are cached (see lib/programs.ts).

// The title doubles as the suggested PDF file name.
export const metadata: Metadata = {
  title: { absolute: `رشته‌ها و شهریه‌ها - ${SITE.name}` },
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<ProgramFilters> };

export default async function ExportProgramsPage({ searchParams }: Props) {
  const f = await searchParams;
  const [{ rows, total }, options] = await Promise.all([exportPrograms(f), programFilterOptions()]);

  // The filters this list was made with, so the PDF explains itself.
  const degree = PROGRAM_DEGREES[f.degree as ProgramDegree]?.fa;
  const language = PROGRAM_LANGUAGES[f.language as ProgramLanguage]?.fa;
  const university = f.university && options.universities.find((u) => u.id === f.university)?.name;
  const applied = [
    f.q?.trim() && `جستجو: «${f.q.trim()}»`,
    f.city && `شهر: ${f.city}`,
    university && `دانشگاه: ${university}`,
    degree && `مقطع: ${degree}`,
    f.faculty && `دانشکده: ${f.faculty}`,
    language && `زبان: ${language}`,
    Number(f.min) > 0 && `شهریه از ${usd(Number(f.min))}`,
    Number(f.max) > 0 && `شهریه تا ${usd(Number(f.max))}`,
    f.scholarship === "1" && "فقط رشته‌های دارای بورسیه",
  ].filter(Boolean);

  return (
    <ExportDocument title="رشته‌ها و شهریه‌ها" subtitle={`${toFa(total)} رشته${applied.length ? " · " + applied.join(" · ") : ""}`}>
      {rows.length === 0 && <p className="text-sm text-[#6b7280]">رشته‌ای با این فیلترها پیدا نشد.</p>}
      {rows.length > 0 && (
        <table className="export-table export-table-compact">
          <thead>
            <tr>
              <th>#</th>
              <th>رشته</th>
              <th>دانشگاه</th>
              <th>مقطع</th>
              <th>زبان</th>
              <th>مدت</th>
              <th>شهریه سالانه</th>
              <th>کل دوره (نقدی)</th>
              <th>بورسیه ۱۰۰٪ پاشا</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.id}>
                <td>{toFa(i + 1)}</td>
                <td className="font-bold text-[#06142a]">{p.name}</td>
                <td>
                  <p>{p.university.name}</p>
                  <p className="text-[10px] text-[#6b7280]">{p.university.city}</p>
                </td>
                <td>{PROGRAM_DEGREES[p.degree as ProgramDegree]?.fa ?? p.degree}</td>
                <td>{PROGRAM_LANGUAGES[p.language as ProgramLanguage]?.fa ?? p.language}</td>
                <td className="whitespace-nowrap">{toFa(p.durationYears)} سال</td>
                <td className="whitespace-nowrap">{usd(p.tuition)}</td>
                <td className="whitespace-nowrap">{usd(p.cashTotal)}</td>
                <td className="whitespace-nowrap font-bold text-[#a7772c]">{usd(p.scholarshipPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {total > rows.length && (
        <p className="mt-4 text-[11px] font-bold text-[#6b7280]">
          این سند {toFa(EXPORT_LIMIT)} رشته اول از {toFa(total)} رشته را نشان می‌دهد؛ برای لیست کامل، فیلترها را محدودتر کنید.
        </p>
      )}
      {rows.some((p) => p.sample) && <p className="mt-4 text-[11px] font-bold text-[#a7772c]">قیمت‌های این سند فعلا نمونه هستند و به‌زودی با لیست قیمت رسمی جایگزین می‌شوند.</p>}
    </ExportDocument>
  );
}
