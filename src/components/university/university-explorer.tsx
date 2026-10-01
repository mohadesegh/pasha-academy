"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SearchX } from "lucide-react";
import { UniversityCard, type UniversityCardData } from "./university-card";
import { cn, splitList, toFa } from "@/lib/utils";

type Uni = UniversityCardData & { programs: string };

/** `hrefBase` lets the portals keep users inside their panel; `inPanel` drops the hero overlap. */
export function UniversityExplorer({
  universities,
  hrefBase = "/universities",
  inPanel = false,
}: {
  universities: Uni[];
  hrefBase?: string;
  inPanel?: boolean;
}) {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [city, setCity] = useState("all");
  const [type, setType] = useState<"all" | "PUBLIC" | "PRIVATE">("all");

  const cities = useMemo(() => [...new Set(universities.map((u) => u.city))], [universities]);
  // Only offer the public / private toggle when both kinds are actually listed.
  const hasBothTypes = useMemo(() => new Set(universities.map((u) => u.type)).size > 1, [universities]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return universities.filter((u) => {
      if (city !== "all" && u.city !== city) return false;
      if (type !== "all" && u.type !== type) return false;
      if (!term) return true;
      const hay = [u.name, u.nameEn, u.city, u.summary, ...splitList(u.programs)].join(" ").toLowerCase();
      return hay.includes(term);
    });
  }, [universities, q, city, type]);

  const chip = (active: boolean) =>
    cn(
      "rounded-full px-4 py-2 text-sm font-bold transition",
      active ? "bg-navy-950 text-white shadow-soft" : "bg-white text-navy-800 ring-1 ring-line hover:ring-navy-300",
    );

  return (
    <div>
      <div className={cn("card relative z-10 space-y-5 p-5 sm:p-6", !inPanel && "-mt-16")}>
        <label className="relative block">
          <span className="sr-only">جستجوی دانشگاه یا رشته</span>
          <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="نام دانشگاه یا رشته (مثلا: پزشکی، کامپیوتر، معماری)..."
            className="input py-4 pr-12 text-base"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="ml-2 text-sm font-bold text-muted">شهر:</span>
          <button type="button" className={chip(city === "all")} onClick={() => setCity("all")}>همه</button>
          {cities.map((c) => (
            <button type="button" key={c} className={chip(city === c)} onClick={() => setCity(c)}>{c}</button>
          ))}
        </div>
        {hasBothTypes && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="ml-2 text-sm font-bold text-muted">نوع:</span>
          {([["all", "همه"], ["PUBLIC", "دولتی"], ["PRIVATE", "خصوصی"]] as const).map(([v, l]) => (
            <button type="button" key={v} className={chip(type === v)} onClick={() => setType(v)}>{l}</button>
          ))}
        </div>
        )}
      </div>

      <p className="mt-8 text-sm text-muted" aria-live="polite">
        {toFa(results.length)} دانشگاه یافت شد
      </p>

      {results.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 py-16 text-center text-muted">
          <SearchX className="h-12 w-12 text-navy-200" />
          <p className="font-bold">دانشگاهی با این مشخصات پیدا نشد.</p>
        </div>
      ) : (
        <motion.ul layout className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {results.map((u) => (
              <motion.li
                key={u.slug}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <UniversityCard u={u} href={`${hrefBase}/${u.slug}`} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
