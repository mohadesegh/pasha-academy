import Link from "next/link";
import { Award, ChevronLeft, ChevronRight, MessageCircle, SearchX, Send } from "lucide-react";
import { UniMonogram } from "@/components/university/university-card";
import { SITE, PROGRAM_DEGREES, PROGRAM_LANGUAGES, type ProgramDegree, type ProgramLanguage } from "@/lib/constants";
import { fill, formatNum, formatUsd, type Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { ProgramRow } from "@/lib/programs";
import { cn } from "@/lib/utils";

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const programName = (p: { name: string; nameEn: string | null }, locale: Locale) => (locale === "en" && p.nameEn ? p.nameEn : p.name);
// Cities are stored in Persian; English pages show the Latin name when we know it.
const CITY_EN: Record<string, string> = { "استانبول": "Istanbul", "آنکارا": "Ankara", "ازمیر": "Izmir", "آنتالیا": "Antalya", "بورسا": "Bursa", "اسکی‌شهیر": "Eskişehir", "قونیه": "Konya", "ترابزون": "Trabzon" };
export const cityName = (city: string, locale: Locale) => (locale === "en" ? CITY_EN[city] ?? city : city);

export const universityName = (u: { name: string; nameEn: string }, locale: Locale) => (locale === "en" ? u.nameEn : u.name);

export function SampleBadge({ t }: { t: Dict }) {
  return <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-extrabold text-gold-600">{t.common.sample}</span>;
}

export function ProgramList({ rows, locale, t }: { rows: ProgramRow[]; locale: Locale; t: Dict }) {
  if (rows.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center text-muted">
        <SearchX className="h-12 w-12 text-navy-200" />
        <p className="font-bold">{t.common.noResults}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {rows.map((p) => {
        const name = programName(p, locale);
        const uni = universityName(p.university, locale);
        const prices = [
          { label: t.programs.tuition, value: formatUsd(locale, p.tuition), strong: true },
          { label: t.programs.deposit, value: p.deposit ? formatUsd(locale, p.deposit) : "—" },
          { label: t.programs.prep, value: p.prepFee ? formatUsd(locale, p.prepFee) : t.programs.free },
          { label: t.programs.cash, value: p.cashTotal ? formatUsd(locale, p.cashTotal) : "—" },
        ];
        return (
          <li key={p.id} className="card p-5 transition hover:shadow-lift sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <UniMonogram name={p.university.nameEn} color={p.university.color} className="h-12 w-12 text-sm" />
                <div className="min-w-0">
                  <h3 className="flex flex-wrap items-center gap-2 text-lg font-black text-navy-950">
                    {name}
                    {p.sample && <SampleBadge t={t} />}
                  </h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted">
                    <Link href={`/universities/${p.university.slug}`} className="font-bold text-navy-800 hover:text-gold-600">{uni}</Link>
                    <span>·</span>
                    <span>{cityName(p.university.city, locale)}</span>
                    {p.faculty && locale === "fa" && (<><span>·</span><span>{p.faculty}</span></>)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="rounded-full bg-sand-100 px-3 py-1 text-navy-800">{PROGRAM_DEGREES[p.degree as ProgramDegree]?.[locale] ?? p.degree}</span>
                    <span className="rounded-full bg-sand-100 px-3 py-1 text-navy-800">{PROGRAM_LANGUAGES[p.language as ProgramLanguage]?.[locale] ?? p.language}</span>
                    <span className="rounded-full bg-sand-100 px-3 py-1 text-navy-800">{fill(t.common.years, { n: formatNum(locale, p.durationYears) })}</span>
                    {p.scholarshipPrice && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-3 py-1 text-gold-600">
                        <Award className="h-3.5 w-3.5" />
                        {t.programs.hasScholarship}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <a
                  href={whatsappLink(fill(t.common.whatsappProgram, { program: name, university: uni }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline btn-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t.common.consult}
                </a>
                <Link href={`/dashboard/apply?type=ADMISSION&university=${p.university.id}`} className="btn-navy btn-sm">
                  <Send className="h-4 w-4" />
                  {t.common.apply}
                </Link>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-dashed border-line pt-4 sm:grid-cols-5">
              {prices.map((x) => (
                <div key={x.label}>
                  <dt className="text-[11px] font-semibold text-muted">{x.label}</dt>
                  <dd className={cn("mt-0.5 font-extrabold", x.strong ? "text-gold-600" : "text-navy-950")}>{x.value}</dd>
                </div>
              ))}
              <div>
                <dt className="text-[11px] font-semibold text-muted">{t.programs.scholarship}</dt>
                <dd className={cn("mt-0.5 font-extrabold", p.scholarshipPrice ? "text-turquoise-600" : "text-muted")}>
                  {p.scholarshipPrice ? formatUsd(locale, p.scholarshipPrice) : "—"}
                </dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}

/** Previous / next links that keep the current filters. */
export function Pager({
  page,
  pages,
  params,
  basePath,
  locale,
  t,
}: {
  page: number;
  pages: number;
  params: Record<string, string | undefined>;
  basePath: string;
  locale: Locale;
  t: Dict;
}) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const Prev = locale === "fa" ? ChevronRight : ChevronLeft;
  const Next = locale === "fa" ? ChevronLeft : ChevronRight;
  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn-outline btn-sm" scroll={false}><Prev className="h-4 w-4" />{t.common.prev}</Link>
      ) : (
        <span className="btn-outline btn-sm pointer-events-none opacity-40"><Prev className="h-4 w-4" />{t.common.prev}</span>
      )}
      <span className="text-sm font-bold text-muted">{fill(t.common.pageOf, { page: formatNum(locale, page), pages: formatNum(locale, pages) })}</span>
      {page < pages ? (
        <Link href={href(page + 1)} className="btn-outline btn-sm" scroll={false}>{t.common.next}<Next className="h-4 w-4" /></Link>
      ) : (
        <span className="btn-outline btn-sm pointer-events-none opacity-40">{t.common.next}<Next className="h-4 w-4" /></span>
      )}
    </nav>
  );
}
