import type { Metadata } from "next";
import { Suspense } from "react";
import { FileDown, Info } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ProgramFilters } from "@/components/programs/program-filters";
import { Pager, ProgramList } from "@/components/programs/program-list";
import { fill, formatNum } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/server";
import { programFilterOptions, searchPrograms, type ProgramFilters as Filters } from "@/lib/programs";

// Filters live in the query string, so this page renders per request — its database reads are cached (see lib/programs.ts).

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { t } = await getDict(params);
  return { title: t.programs.title, description: t.programs.lead, alternates: { canonical: "/programs" } };
}

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Filters> };

export default async function ProgramsPage({ params, searchParams }: Props) {
  const sp = await searchParams;
  const { locale, t } = await getDict(params);
  const [options, result] = await Promise.all([programFilterOptions(), searchPrograms(sp)]);
  const hasSample = result.rows.some((r) => r.sample);
  // The PDF export takes the same filters and lists every match, not just this page.
  const exportQuery = new URLSearchParams(Object.entries(sp).filter(([k, v]) => k !== "page" && typeof v === "string" && v) as [string, string][]);
  exportQuery.set("print", "1");

  return (
    <>
      <PageHero kicker={t.programs.eyebrow} title={t.programs.title} lead={t.programs.lead} />
      <section className="-mt-12 pb-24">
        <div className="container-x space-y-6">
          <Suspense>
            <ProgramFilters options={options} />
          </Suspense>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-extrabold text-navy-950" aria-live="polite">{fill(t.programs.count, { count: formatNum(locale, result.total) })}</p>
            {result.total > 0 && (
              <a href={`/export/programs?${exportQuery}`} target="_blank" rel="noopener" className="btn-outline btn-sm">
                <FileDown className="h-4 w-4" />
                {t.programs.exportPdf}
              </a>
            )}
          </div>
          {hasSample && (
            <p className="flex w-fit items-center gap-2 rounded-full bg-gold-50 px-4 py-2 text-xs font-bold text-gold-600">
              <Info className="h-4 w-4" />
              {t.common.sampleNotice}
            </p>
          )}

          <ProgramList rows={result.rows} locale={locale} t={t} />
          <Pager page={result.page} pages={result.pages} params={sp as Record<string, string | undefined>} basePath="/programs" locale={locale} t={t} />
        </div>
      </section>
    </>
  );
}
