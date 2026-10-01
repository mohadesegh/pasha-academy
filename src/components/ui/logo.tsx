"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

/** Golden winged-lion emblem (transparent PNG, reads on both light and navy backgrounds). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo-mark.png"
      alt=""
      aria-hidden
      width={256}
      height={256}
      priority
      // No class merging here (cn is plain clsx), so the default size only applies when none is given.
      className={cn("object-contain", className ?? "h-11 w-11")}
    />
  );
}

export function Logo({ light = false, className, markClassName }: { light?: boolean; className?: string; markClassName?: string }) {
  const { locale } = useLocale();
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)} aria-label={locale === "fa" ? "پاشا آکادمی — صفحه اصلی" : "Pasha Academy — home"}>
      <LogoMark className={cn("transition-transform duration-500 group-hover:scale-110", markClassName ?? "h-11 w-11")} />
      <span className="flex flex-col whitespace-nowrap leading-none">
        <span className={cn("text-lg font-black", light ? "text-white" : "text-navy-950")}>{locale === "fa" ? "پاشا آکادمی" : "Pasha Academy"}</span>
        <span className={cn("mt-1 text-[10px] font-bold tracking-[0.2em]", light ? "text-gold-300" : "text-gold-500")}>
          PASHA ACADEMY
        </span>
      </span>
    </Link>
  );
}
