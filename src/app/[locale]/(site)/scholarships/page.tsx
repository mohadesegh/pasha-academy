import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Info, MessageCircle, SearchX } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ProgramFilters } from "@/components/programs/program-filters";
import { Pager, SampleBadge, cityName, programName, universityName, whatsappLink } from "@/components/programs/program-list";
import { UniMonogram } from "@/components/university/university-card";
import { PROGRAM_DEGREES, PROGRAM_LANGUAGES, type ProgramDegree, type ProgramLanguage } from "@/lib/constants";
import { fill, formatNum, formatUsd } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/server";
import { PAGE_SIZE, programFilterOptions, scholarshipStats, searchPrograms, termlyTotal, type ProgramFilters as Filters } from "@/lib/programs";

// Filters live in the query string, so this page renders per request — its database reads are cached (see lib/programs.ts).

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { t } = await getDict(params);
  return { title: t.scholarships.title, description: t.scholarships.lead, alternates: { canonical: "/scholarships" } };
}

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Filters> };

export default async function ScholarshipsPage({ params, searchParams }: Props) {
  const sp = await searchParams;
  const { locale, t } = await getDict(params);
  const filters = { ...sp, scholarship: "1" };
  const order = sp.sort === "expensive" ? [{ scholarshipPrice: "desc" as const }] : sp.sort === "name" ? [{ name: "asc" as const }] : [{ scholarshipPrice: "asc" as const }];
  const [options, stats, result] = await Promise.all([programFilterOptions(), scholarshipStats(), searchPrograms(filters, order)]);
  const first = (result.page - 1) * PAGE_SIZE;

  const statCards = [
    { label: t.scholarships.seats, value: formatNum(locale, stats.seats) },
    { label: t.scholarships.universities, value: formatNum(locale, stats.universities) },
    { label: t.scholarships.from, value: formatUsd(locale, stats.from) },
  ];

  return (
    <>
      <PageHero kicker={t.scholarships.eyebrow} title={t.scholarships.title} lead={t.scholarships.lead}>
        <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className="card p-4 sm:p-5">
              <p className="text-xs font-bold text-muted">{s.label}</p>
              <p className="mt-1 text-xl font-black text-navy-950 sm:text-2xl">{s.value}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="-mt-12 pb-24">
        <div className="container-x space-y-6">
          <Suspense>
            <ProgramFilters options={options} fields={["university", "degree", "language", "sort"]} />
          </Suspense>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-muted" aria-live="polite">
              {fill(t.scholarships.showing, {
                from: formatNum(locale, result.total ? first + 1 : 0),
                to: formatNum(locale, first + result.rows.length),
                total: formatNum(locale, result.total),
              })}
            </p>
            {result.rows.some((r) => r.sample) && (
              <p className="flex items-center gap-2 rounded-full bg-gold-50 px-4 py-2 text-xs font-bold text-gold-600">
                <Info className="h-4 w-4" />
                {t.common.sampleNotice}
              </p>
            )}
          </div>

          {result.rows.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center text-muted">
              <SearchX className="h-12 w-12 text-navy-200" />
              <p className="font-bold">{t.common.noResults}</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="bg-sand-100 text-xs text-muted ltr:text-left rtl:text-right">
                    <tr>
                      <th className="px-5 py-3 font-bold">{t.scholarships.colUniversity}</th>
                      <th className="px-5 py-3 font-bold">{t.scholarships.colProgram}</th>
                      <th className="px-5 py-3 font-bold">{t.scholarships.colDegree}</th>
                      <th className="px-5 py-3 font-bold">{t.scholarships.colLanguage}</th>
                      <th className="px-5 py-3 font-bold">{t.scholarships.colDuration}</th>
                      <th className="px-5 py-3 font-bold">{t.scholarships.colPrice}</th>
                      <th className="px-5 py-3 font-bold">{t.scholarships.colSaving}</th>
                      <th className="px-5 py-3 font-bold">{t.scholarships.colAction}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {result.rows.map((p) => {
                      const name = programName(p, locale);
                      const uni = universityName(p.university, locale);
                      const saving = Math.round((1 - p.scholarshipPrice! / termlyTotal(p)) * 100);
                      return (
                        <tr key={p.id} className="transition hover:bg-sand-50">
                          <td className="px-5 py-4">
                            <Link href={`/universities/${p.university.slug}`} className="flex items-center gap-3">
                              <UniMonogram name={p.university.nameEn} color={p.university.color} className="h-10 w-10 rounded-xl text-xs" />
                              <span>
                                <span className="block font-extrabold text-navy-950">{uni}</span>
                                <span className="block text-xs text-muted">{cityName(p.university.city, locale)}</span>
                              </span>
                            </Link>
                          </td>
                          <td className="px-5 py-4">
                            <span className="flex flex-wrap items-center gap-2 font-bold text-turquoise-600">
                              {name}
                              {p.sample && <SampleBadge t={t} />}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-navy-800">{PROGRAM_DEGREES[p.degree as ProgramDegree]?.[locale] ?? p.degree}</td>
                          <td className="px-5 py-4 text-navy-800">{PROGRAM_LANGUAGES[p.language as ProgramLanguage]?.[locale] ?? p.language}</td>
                          <td className="px-5 py-4 font-bold text-navy-900" dir="ltr">{p.prepFee ? `${p.durationYears}+1` : p.durationYears}</td>
                          <td className="px-5 py-4 text-base font-black text-gold-600">{formatUsd(locale, p.scholarshipPrice!)}</td>
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-turquoise-50 px-2.5 py-1 text-xs font-extrabold text-turquoise-600">{formatNum(locale, saving)}{locale === "fa" ? "٪" : "%"}</span>
                          </td>
                          <td className="px-5 py-4">
                            <a
                              href={whatsappLink(fill(t.common.whatsappProgram, { program: name, university: uni }))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm bg-navy-950 text-white hover:bg-navy-800"
                            >
                              <MessageCircle className="h-4 w-4" />
                              {t.common.consult}
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <Pager page={result.page} pages={result.pages} params={sp as Record<string, string | undefined>} basePath="/scholarships" locale={locale} t={t} />
        </div>
      </section>
    </>
  );
}
