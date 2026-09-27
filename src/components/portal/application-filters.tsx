"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { APP_STATUSES, APP_STATUS_KEYS, APP_TYPES, APP_TYPE_KEYS } from "@/lib/constants";

export function ApplicationFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`);
  }

  // Debounced search box.
  useEffect(() => {
    if (q === (params.get("q") ?? "")) return;
    const t = setTimeout(() => update("q", q), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_200px_200px]">
      <label className="relative">
        <span className="sr-only">جستجو</span>
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} className="input pr-10" placeholder="نام، کد پیگیری، ایمیل یا تلفن" />
      </label>
      <select aria-label="وضعیت" className="input" value={params.get("status") ?? ""} onChange={(e) => update("status", e.target.value)}>
        <option value="">همه وضعیت‌ها</option>
        {APP_STATUS_KEYS.map((s) => <option key={s} value={s}>{APP_STATUSES[s].label}</option>)}
      </select>
      <select aria-label="نوع درخواست" className="input" value={params.get("type") ?? ""} onChange={(e) => update("type", e.target.value)}>
        <option value="">همه انواع</option>
        {APP_TYPE_KEYS.map((t) => <option key={t} value={t}>{APP_TYPES[t].label}</option>)}
      </select>
    </div>
  );
}
