"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { PROGRAM_DEGREES, PROGRAM_DEGREE_KEYS, PROGRAM_LANGUAGES, PROGRAM_LANGUAGE_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { cityName } from "./program-list";

type Options = {
  universities: { id: string; name: string; nameEn: string; city: string }[];
  cities: string[];
  faculties: string[];
};

/**
 * URL-driven filters: every change rewrites the query string and the server page re-queries.
 * `fields` picks which controls to show (the scholarship list uses a smaller set).
 */
export function ProgramFilters({
  options,
  fields = ["city", "university", "degree", "faculty", "language", "price", "scholarship", "sort"],
}: {
  options: Options;
  fields?: ("city" | "university" | "degree" | "faculty" | "language" | "price" | "scholarship" | "sort")[];
}) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page"); // any filter change starts from the first page
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  // Debounce the free-text and price inputs.
  useEffect(() => {
    if (q === (params.get("q") ?? "") && min === (params.get("min") ?? "") && max === (params.get("max") ?? "")) return;
    const id = setTimeout(() => update({ q, min, max }), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, min, max]);

  const has = (f: (typeof fields)[number]) => fields.includes(f);
  const uniLabel = (u: Options["universities"][number]) => (locale === "fa" ? u.name : u.nameEn);
  const activeCount = [...params.keys()].filter((k) => k !== "page" && params.get(k)).length;

  const select = (key: string, label: string, items: { value: string; label: string }[]) => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      <select value={params.get(key) ?? ""} onChange={(e) => update({ [key]: e.target.value })} className="input rounded-2xl">
        <option value="">{t.common.all}</option>
        {items.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
      </select>
    </label>
  );

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-black text-navy-950">
          <SlidersHorizontal className="h-5 w-5 text-gold-500" />
          {t.programs.filters}
          {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setMin("");
              setMax("");
              start(() => router.replace(pathname, { scroll: false }));
            }}
            className="btn btn-sm bg-crimson-500 text-white hover:bg-crimson-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t.common.reset}
          </button>
        )}
      </div>

      <label className="relative mb-4 block">
        <span className="sr-only">{t.common.search}</span>
        <Search className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-muted ltr:left-4 rtl:right-4" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.programs.searchPlaceholder} className="input rounded-2xl py-4 ltr:pl-12 rtl:pr-12" />
      </label>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {has("city") && options.cities.length > 1 && select("city", t.programs.city, options.cities.map((c) => ({ value: c, label: cityName(c, locale) })))}
        {has("university") && select("university", t.programs.university, options.universities.map((u) => ({ value: u.id, label: uniLabel(u) })))}
        {has("degree") && select("degree", t.programs.degree, PROGRAM_DEGREE_KEYS.map((d) => ({ value: d, label: PROGRAM_DEGREES[d][locale] })))}
        {has("faculty") && options.faculties.length > 0 && select("faculty", t.programs.faculty, options.faculties.map((f) => ({ value: f, label: f })))}
        {has("language") && select("language", t.programs.language, PROGRAM_LANGUAGE_KEYS.map((l) => ({ value: l, label: PROGRAM_LANGUAGES[l][locale] })))}
        {has("sort") && (
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-muted">{t.programs.sort}</span>
            <select value={params.get("sort") ?? ""} onChange={(e) => update({ sort: e.target.value })} className="input rounded-2xl">
              <option value="">{t.programs.sortCheap}</option>
              <option value="expensive">{t.programs.sortExpensive}</option>
              <option value="name">{t.programs.sortName}</option>
            </select>
          </label>
        )}
      </div>

      {(has("price") || has("scholarship")) && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {has("price") && (
            <>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-muted">{t.programs.minPrice}</span>
                <input value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" dir="ltr" className="input rounded-2xl" placeholder="0" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-muted">{t.programs.maxPrice}</span>
                <input value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} inputMode="numeric" dir="ltr" className="input rounded-2xl" placeholder="70000" />
              </label>
            </>
          )}
          {has("scholarship") && (
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 self-end rounded-2xl border px-4 py-3 text-sm font-bold transition lg:col-span-2",
                params.get("scholarship") === "1" ? "border-gold-400 bg-gold-50 text-navy-950" : "border-line bg-white text-navy-800",
              )}
            >
              <input
                type="checkbox"
                checked={params.get("scholarship") === "1"}
                onChange={(e) => update({ scholarship: e.target.checked ? "1" : "" })}
                className="h-4 w-4 accent-gold-500"
              />
              {t.programs.onlyScholarship}
            </label>
          )}
        </div>
      )}
    </div>
  );
}
