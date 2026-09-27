import Link from "next/link";
import { ArrowLeft, Languages, MapPin, Wallet } from "lucide-react";
import { cn, formatNumber, splitList } from "@/lib/utils";

export type UniversityCardData = {
  slug: string;
  name: string;
  nameEn: string;
  city: string;
  type: string;
  tuitionFrom: number | null;
  languages: string;
  summary: string;
  color: string;
};

export function UniMonogram({ name, color, className }: { name: string; color: string; className?: string }) {
  const initials = name
    .replace(/\(.*\)/, "")
    .split(/\s+/)
    .filter((w) => !["University", "of"].includes(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-black tracking-tight text-white shadow-soft", className)}
      style={{ background: `linear-gradient(135deg, ${color}, #06142a)` }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function UniversityCard({ u }: { u: UniversityCardData }) {
  return (
    <Link
      href={`/universities/${u.slug}`}
      className="group card relative flex h-full flex-col overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <span
        className="absolute inset-x-0 top-0 h-1 origin-right scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: u.color }}
        aria-hidden
      />
      <div className="flex items-start gap-4">
        <UniMonogram name={u.nameEn} color={u.color} />
        <div className="min-w-0">
          <h3 className="font-extrabold text-navy-950 transition group-hover:text-crimson-500">{u.name}</h3>
          <p className="mt-0.5 truncate text-xs text-muted" dir="ltr">{u.nameEn}</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-7 text-muted">{u.summary}</p>
      <div className="mb-6 mt-5 flex flex-wrap gap-2 text-xs font-semibold text-navy-800">
        <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-3 py-1.5"><MapPin className="h-3.5 w-3.5 text-crimson-500" />{u.city}</span>
        <span className={cn("rounded-full px-3 py-1.5", u.type === "PUBLIC" ? "bg-turquoise-50 text-turquoise-600" : "bg-gold-50 text-gold-600")}>
          {u.type === "PUBLIC" ? "دولتی" : "خصوصی"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-3 py-1.5"><Languages className="h-3.5 w-3.5 text-turquoise-500" />{splitList(u.languages).join(" / ")}</span>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted">
          <Wallet className="h-4 w-4 text-gold-500" />
          {u.tuitionFrom ? <>شهریه از <b className="text-navy-950">{formatNumber(u.tuitionFrom)}$</b></> : "شهریه: استعلام"}
        </span>
        <ArrowLeft className="h-5 w-5 text-navy-300 transition group-hover:-translate-x-1 group-hover:text-crimson-500" />
      </div>
    </Link>
  );
}
