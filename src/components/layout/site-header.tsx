"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, UserRound, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "خانه" },
  { href: "/services", label: "خدمات" },
  { href: "/universities", label: "دانشگاه‌ها" },
  { href: "/dormitory", label: "خوابگاه" },
  { href: "/agents", label: "همکاری با ما" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [panelHref, setPanelHref] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setPanelHref(d.loggedIn ? d.panel : null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const solid = scrolled || open;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid ? "border-b border-line/70 bg-white/85 shadow-soft backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="container-x flex h-20 items-center justify-between gap-6">
        <Logo light={!solid} />

        <nav aria-label="منوی اصلی" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    solid ? "text-navy-900 hover:bg-navy-50" : "text-white/85 hover:bg-white/10 hover:text-white",
                    isActive(item.href) && (solid ? "text-crimson-500" : "text-white"),
                  )}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute inset-x-0 -bottom-0.5 mx-auto h-1 w-1 rounded-full bg-gold-400"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={panelHref ?? "/login"}
            className={cn("hidden sm:inline-flex btn btn-sm", solid ? "btn-outline" : "btn-ghost-light")}
          >
            <UserRound className="h-4 w-4" />
            {panelHref ? "پنل کاربری" : "ورود / ثبت‌نام"}
          </Link>
          <Link href="/contact#consult" className="btn-primary btn-sm hidden md:inline-flex">
            مشاوره رایگان
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn("grid h-11 w-11 place-items-center rounded-full lg:hidden", solid ? "text-navy-950" : "text-white")}
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="منوی موبایل"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-white lg:hidden"
          >
            <ul className="container-x flex flex-col py-4">
              {NAV.map((item, i) => (
                <motion.li key={item.href} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-xl px-4 py-3 font-semibold",
                      isActive(item.href) ? "bg-navy-50 text-crimson-500" : "text-navy-900",
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
              <li className="mt-3 grid grid-cols-2 gap-2">
                <Link href={panelHref ?? "/login"} className="btn-outline">
                  {panelHref ? "پنل کاربری" : "ورود"}
                </Link>
                <Link href="/contact#consult" className="btn-primary">
                  مشاوره رایگان
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
