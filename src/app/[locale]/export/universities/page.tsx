import type { Metadata } from "next";
import { ExportDocument, usd } from "@/components/export/export-document";
import { SITE } from "@/lib/constants";
import { exportUniversities } from "@/lib/export-data";
import { splitList, toFa } from "@/lib/utils";

// Prerendered and refreshed with the rest of the catalogue (revalidateSite() after admin edits).
export const revalidate = 3600;

// The title doubles as the suggested PDF file name.
export const metadata: Metadata = {
  title: { absolute: `لیست دانشگاه‌های ترکیه - ${SITE.name}` },
  robots: { index: false, follow: false },
};

export default async function ExportUniversitiesPage() {
  const universities = await exportUniversities();
  return (
    <ExportDocument title="لیست دانشگاه‌های ترکیه" subtitle={`${toFa(universities.length)} دانشگاه همکار ${SITE.name}`}>
      <table className="export-table">
        <thead>
          <tr>
            <th>#</th>
            <th>دانشگاه</th>
            <th>شهر</th>
            <th>زبان تدریس</th>
            <th>شهریه سالانه از</th>
            <th>تعداد رشته</th>
          </tr>
        </thead>
        <tbody>
          {universities.map((u, i) => (
            <tr key={u.slug}>
              <td>{toFa(i + 1)}</td>
              <td>
                <p className="font-extrabold text-[#06142a]">{u.name}</p>
                <p className="text-[10px] text-[#6b7280]" dir="ltr">{u.nameEn}</p>
              </td>
              <td>{u.city}</td>
              <td>{splitList(u.languages).join("، ")}</td>
              <td className="whitespace-nowrap font-bold">{usd(u.tuitionFrom)}</td>
              <td>{u.programCount ? toFa(u.programCount) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ExportDocument>
  );
}
