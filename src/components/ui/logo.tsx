import Link from "next/link";
import { cn } from "@/lib/utils";

/** Crescent-and-star inspired monogram + wordmark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("h-10 w-10", className)}>
      <rect width="48" height="48" rx="14" fill="#0b2340" />
      <circle cx="21" cy="24" r="12" fill="#deaf52" />
      <circle cx="25.5" cy="24" r="9.6" fill="#0b2340" />
      <path d="M33.5 19.5l1.4 3.3 3.6.3-2.7 2.3.8 3.5-3.1-1.9-3.1 1.9.8-3.5-2.7-2.3 3.6-.3z" fill="#e30a17" />
    </svg>
  );
}

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)} aria-label="پاشا آکادمی — صفحه اصلی">
      <LogoMark className="transition-transform duration-500 group-hover:rotate-[-8deg]" />
      <span className="flex flex-col leading-none">
        <span className={cn("text-lg font-black", light ? "text-white" : "text-navy-950")}>پاشا آکادمی</span>
        <span className={cn("mt-1 text-[10px] font-bold tracking-[0.2em]", light ? "text-gold-300" : "text-gold-500")}>
          PASHA ACADEMY
        </span>
      </span>
    </Link>
  );
}
