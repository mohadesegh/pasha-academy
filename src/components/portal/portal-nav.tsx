"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  Building2,
  FilePlus2,
  FolderKanban,
  GraduationCap,
  Globe,
  Inbox,
  LayoutDashboard,
  Menu,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = { LayoutDashboard, FolderKanban, FilePlus2, Users, Building2, GraduationCap, Inbox, BedDouble, Globe };
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; exact?: boolean };

function Links({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {items.map((it) => {
        const Icon = ICONS[it.icon];
        const active = it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(`${it.href}/`);
        return (
          <li key={it.href}>
            <Link
              href={it.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition",
                active ? "text-navy-950" : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              {active && (
                <motion.span layoutId="portal-active" className="absolute inset-0 rounded-xl bg-gold-300" transition={{ type: "spring", stiffness: 400, damping: 35 }} />
              )}
              <Icon className="relative h-5 w-5" />
              <span className="relative">{it.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function PortalNav({ items, header, footer }: { items: NavItem[]; header: React.ReactNode; footer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-72 flex-col bg-navy-950 p-5 lg:flex">
        <div className="bg-pattern pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative">{header}</div>
        <nav className="relative mt-8 flex-1" aria-label="منوی پنل">
          <Links items={items} />
        </nav>
        <div className="relative">{footer}</div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-navy-950 px-4 py-3 lg:hidden">
        {header}
        <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center text-white" aria-label="باز کردن منو">
          <Menu />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-navy-950 p-5 lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <div className="flex items-center justify-between">
                {header}
                <button type="button" onClick={() => setOpen(false)} className="text-white" aria-label="بستن منو"><X /></button>
              </div>
              <nav className="mt-8 flex-1" aria-label="منوی پنل">
                <Links items={items} onNavigate={() => setOpen(false)} />
              </nav>
              {footer}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
