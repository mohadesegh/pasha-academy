"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, GraduationCap, Menu, Moon, Sun, UserRound, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useLocale } from "@/components/i18n/locale-provider";
import { LOCALE_COOKIE, THEME_STORAGE_KEY } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/** Dark / light switch; the choice is remembered in localStorage (read before paint in the root layout). */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useLocale();
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* storage blocked — the toggle still works for this page view */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? t.nav.toLight : t.nav.toDark}
      title={dark ? t.nav.toLight : t.nav.toDark}
      className={cn("grid h-10 w-10 place-items-center rounded-full bg-navy-950 text-gold-300 transition hover:scale-105", className)}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

/** Switches fa ⇄ en through the `lang` cookie and re-renders the server components. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, t } = useLocale();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${locale === "fa" ? "en" : "fa"}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
      aria-label={t.nav.switchLangLabel}
      className={cn("grid h-10 min-w-10 place-items-center rounded-full bg-navy-950 px-3 text-xs font-black text-white transition hover:scale-105", className)}
    >
      {locale === "fa" ? "EN" : "فا"}
    </button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [panelHref, setPanelHref] = useState<string | null>(null);

  const NAV = [
    { href: "/programs", label: t.nav.programs },
    { href: "/universities", label: t.nav.universities },
    { href: "/scholarships", label: t.nav.scholarships },
    { href: "/services", label: t.nav.services },
    { href: "/agents", label: t.nav.agents },
    { href: "/contact", label: t.nav.contact },
  ];

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setPanelHref(d.loggedIn ? d.panel : null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={cn(
          "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-full border px-3 transition-all duration-300 sm:px-4",
          "border-white/70 bg-surface/80 backdrop-blur-xl dark:border-white/10",
          scrolled || open ? "shadow-lift" : "shadow-soft",
        )}
      >
        <Logo markClassName="h-12 w-12" />

        <nav aria-label={t.nav.mainMenu} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition",
                    isActive(item.href) ? "bg-navy-950 text-white" : "text-navy-900 hover:bg-sand-200",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {panelHref ? (
            <Link href={panelHref} className="btn-outline btn-sm hidden sm:inline-flex">
              <UserRound className="h-4 w-4" />
              {t.nav.panel}
            </Link>
          ) : (
            <>
              <Link href="/login?as=student" className="btn-outline btn-sm hidden whitespace-nowrap xl:inline-flex">
                <GraduationCap className="h-4 w-4" />
                {t.nav.studentLogin}
              </Link>
              <Link href="/login?as=agent" className="btn-outline btn-sm hidden whitespace-nowrap xl:inline-flex">
                <Briefcase className="h-4 w-4" />
                {t.nav.agentLogin}
              </Link>
            </>
          )}
          <LanguageToggle />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-navy-950 hover:bg-sand-200 lg:hidden"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label={t.nav.mainMenu}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card mx-auto mt-2 max-w-7xl overflow-hidden p-3 lg:hidden"
          >
            <ul className="flex flex-col">
              {[{ href: "/", label: t.nav.home }, ...NAV].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-2xl px-4 py-3 font-bold",
                      isActive(item.href) ? "bg-navy-950 text-white" : "text-navy-900 hover:bg-sand-100",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-3 grid grid-cols-2 gap-2">
                {panelHref ? (
                  <Link href={panelHref} className="btn-outline col-span-2">{t.nav.panel}</Link>
                ) : (
                  <>
                    <Link href="/login?as=student" className="btn-outline">{t.nav.studentLogin}</Link>
                    <Link href="/login?as=agent" className="btn-outline">{t.nav.agentLogin}</Link>
                  </>
                )}
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
