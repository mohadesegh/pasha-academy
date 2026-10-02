"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calculator, ChevronDown, ListChecks } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { PROGRAM_DEGREES, PROGRAM_DEGREE_KEYS, PROGRAM_LANGUAGES, type ProgramDegree, type ProgramLanguage } from "@/lib/constants";
import { fill, formatNum, formatUsd } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type Uni = { id: string; name: string; nameEn: string };
type Prog = {
  id: string;
  universityId: string;
  name: string;
  nameEn: string | null;
  degree: string;
  language: string;
  durationYears: number;
  tuition: number;
  prepFee: number | null;
  cashTotal: number | null;
  scholarshipPrice: number | null;
  sample: boolean;
};
type Pay = "termly" | "cash" | "scholarship";

/** Cascading selects (university → degree → program → language) with a live total for the chosen payment plan. */
export function TuitionCalculator({ universities, programs }: { universities: Uni[]; programs: Prog[] }) {
  const { locale, t } = useLocale();
  const [uni, setUni] = useState("");
  const [degree, setDegree] = useState("");
  const [programName, setProgramName] = useState("");
  const [language, setLanguage] = useState("");
  const [pay, setPay] = useState<Pay>("termly");

  const label = (p: { name: string; nameEn: string | null }) => (locale === "en" && p.nameEn ? p.nameEn : p.name);
  // The same program is stored once per language; the "program" select groups them by base name.
  const baseName = (p: Prog) => label(p).replace(/\s*\((انگلیسی|ترکی)\)$/, "");

  const inUni = useMemo(() => programs.filter((p) => p.universityId === uni), [programs, uni]);
  const degrees = PROGRAM_DEGREE_KEYS.filter((d) => inUni.some((p) => p.degree === d));
  const inDegree = inUni.filter((p) => p.degree === degree);
  const names = [...new Set(inDegree.map(baseName))];
  const variants = inDegree.filter((p) => baseName(p) === programName);
  const selected = variants.find((p) => p.language === language) ?? (variants.length === 1 ? variants[0] : undefined);

  const termly = selected ? selected.tuition * selected.durationYears + (selected.prepFee ?? 0) : 0;
  const total = !selected ? null : pay === "termly" ? termly : pay === "cash" ? selected.cashTotal : selected.scholarshipPrice;
  const pct = locale === "fa" ? "٪" : "%";

  const field = (id: string, text: string, value: string, onChange: (v: string) => void, items: { value: string; label: string }[], disabled = false) => (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-bold text-navy-900">{text}</span>
      <span className="relative block">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="input h-12 appearance-none rounded-2xl py-0 pe-10 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{t.calc.choose}</option>
          {items.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      </span>
    </label>
  );

  return (
    <div className="card grid overflow-hidden lg:grid-cols-2">
      {/* Mobile: compact header with an icon badge. Desktop: centred intro with the large icon. */}
      <div className="flex flex-col justify-center p-5 sm:p-12 lg:text-center">
        <div className="flex items-center gap-3 lg:flex-col lg:gap-0">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy-950 text-gold-300 lg:hidden">
            <Calculator className="h-6 w-6" />
          </span>
          <div>
            <p className="kicker">{t.calc.eyebrow}</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-navy-950 sm:mt-4 sm:text-5xl">{t.calc.title}</h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-7 text-muted sm:mt-5 sm:text-base sm:leading-8 lg:mx-auto lg:max-w-sm">{t.calc.lead}</p>
        <Calculator className="mx-auto mt-8 hidden h-14 w-14 text-gold-400 lg:block" strokeWidth={1.4} />
      </div>

      <div className="space-y-3.5 bg-sand-100/70 p-5 sm:space-y-4 sm:p-8">
        {field("calc-uni", t.calc.university, uni, (v) => { setUni(v); setDegree(""); setProgramName(""); setLanguage(""); },
          universities.filter((u) => programs.some((p) => p.universityId === u.id)).map((u) => ({ value: u.id, label: locale === "fa" ? u.name : u.nameEn })))}
        {field("calc-degree", t.calc.degree, degree, (v) => { setDegree(v); setProgramName(""); setLanguage(""); },
          degrees.map((d) => ({ value: d, label: PROGRAM_DEGREES[d as ProgramDegree][locale] })), !uni)}
        {field("calc-program", t.calc.program, programName, (v) => { setProgramName(v); setLanguage(""); },
          names.map((n) => ({ value: n, label: n })), !degree)}
        {field("calc-lang", t.calc.language, selected?.language ?? language, setLanguage,
          variants.map((p) => ({ value: p.language, label: PROGRAM_LANGUAGES[p.language as ProgramLanguage]?.[locale] ?? p.language })), !programName)}

        <fieldset>
          <legend className="mb-1.5 text-xs font-bold text-navy-900">{t.calc.payment}</legend>
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-1">
            {([["termly", t.calc.payTermly], ["cash", t.calc.payCash], ["scholarship", t.calc.payScholarship]] as const).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setPay(v)}
                aria-pressed={pay === v}
                className={cn(
                  "rounded-xl px-2 py-2.5 text-[11px] font-extrabold leading-tight transition sm:text-xs",
                  pay === v ? "bg-navy-950 text-white" : "text-navy-800 hover:bg-sand-100",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="min-h-32 rounded-3xl bg-white p-5 text-center shadow-soft sm:min-h-36">
          <p className="text-sm font-extrabold text-gold-600">{t.calc.final}</p>
          <AnimatePresence mode="wait">
            <motion.div key={`${selected?.id}-${pay}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              {!selected ? (
                <p className="mt-5 text-sm leading-7 text-muted sm:mt-6">{t.calc.empty}</p>
              ) : total == null ? (
                <p className="mt-6 text-sm font-bold text-crimson-600">{pay === "scholarship" ? t.calc.noScholarship : "—"}</p>
              ) : (
                <>
                  <p className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">{formatUsd(locale, total)}</p>
                  <p className="mt-2 text-xs text-muted">
                    {pay === "termly"
                      ? fill(t.calc.breakdown, { years: formatNum(locale, selected.durationYears), tuition: formatUsd(locale, selected.tuition), prep: formatUsd(locale, selected.prepFee ?? 0) })
                      : pay === "cash" ? t.calc.cashNote : t.calc.scholarshipNote}
                  </p>
                  {pay !== "termly" && termly > total && (
                    <p className="mt-3 inline-block rounded-full bg-turquoise-50 px-3 py-1 text-xs font-extrabold text-turquoise-600">
                      {fill(t.calc.saving, { amount: formatUsd(locale, termly - total) })} ({formatNum(locale, Math.round((1 - total / termly) * 100))}{pct})
                    </p>
                  )}
                  {selected.sample && <p className="mt-2 text-[10px] font-bold text-gold-600">{t.common.sampleNotice}</p>}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <Link href="/programs" className="btn w-full bg-navy-950 py-3.5 text-white hover:bg-navy-800">
          <ListChecks className="h-4 w-4" />
          {t.calc.cta}
        </Link>
      </div>
    </div>
  );
}
