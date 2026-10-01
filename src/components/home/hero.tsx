"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Award, BadgeCheck, BedDouble, Check, GraduationCap, MessageCircle } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { useLocale } from "@/components/i18n/locale-provider";
import { SITE } from "@/lib/constants";

const ease = [0.22, 1, 0.36, 1] as const;

/** Light, accaco-style hero: headline + CTAs on one side, the golden emblem in orbit on the other. */
export function Hero() {
  const { locale, t } = useLocale();
  const Arrow = locale === "fa" ? ArrowLeft : ArrowRight;
  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(t.common.whatsappGeneral)}`;
  const chips = [
    { icon: GraduationCap, text: t.hero.orbit[0], pos: "top-[12%] ltr:left-[4%] rtl:right-[4%]", delay: 0.6 },
    { icon: Award, text: t.hero.orbit[1], pos: "top-[48%] ltr:right-0 rtl:left-0", delay: 0.8 },
    { icon: BedDouble, text: t.hero.orbit[2], pos: "bottom-[8%] ltr:left-[12%] rtl:right-[12%]", delay: 1 },
  ];

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40">
      <div className="absolute -top-40 left-1/2 -z-10 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-gold-200/40 blur-3xl dark:bg-gold-500/10" aria-hidden />
      <div className="bg-pattern-dark absolute inset-0 -z-10 opacity-60 dark:opacity-0" aria-hidden />

      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <motion.span
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-surface px-4 py-1.5 text-xs font-bold text-navy-900 shadow-soft dark:border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold-500" />
            {t.hero.eyebrow}
          </motion.span>

          <h1 className="mt-6 text-4xl font-black leading-[1.3] text-navy-950 sm:text-6xl lg:text-[4.2rem]">
            {t.hero.title.map((line, i) => (
              <motion.span
                key={line}
                className={`block ${i === t.hero.title.length - 1 ? "text-gradient" : ""}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.1, ease }}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="mt-6 max-w-xl text-lg leading-9 text-muted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease }}
          >
            {t.hero.lead}
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease }}
          >
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary px-7 py-4 text-base">
              {t.hero.ctaPrimary}
              <Arrow className="h-5 w-5" />
            </a>
            <Link href="/programs" className="btn-navy px-7 py-4 text-base">
              {t.hero.ctaSecondary}
            </Link>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-outline px-6 py-4 text-base">
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
              {t.hero.ctaWhatsapp}
            </a>
          </motion.div>

          <motion.ul
            className="mt-8 flex max-w-xl flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-navy-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
          >
            {t.hero.checklist.map((c) => (
              <li key={c} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-gold-500" strokeWidth={3} />
                {c}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Emblem in orbit */}
        <div className="relative mx-auto aspect-square w-full max-w-[480px]" aria-hidden>
          {[100, 78, 56].map((size, i) => (
            <motion.div
              key={size}
              className="absolute inset-0 m-auto rounded-full border border-gold-400/30 dark:border-gold-400/20"
              style={{ width: `${size}%`, height: `${size}%` }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, rotate: i % 2 ? -360 : 360 }}
              transition={{ opacity: { duration: 0.8, delay: 0.2 + i * 0.1 }, scale: { duration: 0.8, delay: 0.2 + i * 0.1 }, rotate: { duration: 50 + i * 15, repeat: Infinity, ease: "linear" } }}
            >
              <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-gold-400 shadow-[0_0_16px_rgba(222,175,82,0.9)]" />
            </motion.div>
          ))}
          <motion.div
            className="absolute inset-0 m-auto grid h-[42%] w-[42%] place-items-center rounded-full bg-surface shadow-lift ring-1 ring-gold-300/50"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3, ease }}
          >
            <LogoMark className="h-[78%] w-[78%] drop-shadow-[0_10px_24px_rgba(201,149,58,0.45)]" />
          </motion.div>

          {chips.map((c) => (
            <motion.div
              key={c.text}
              className={`absolute ${c.pos}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: c.delay, ease }}
            >
              <div className="animate-float flex items-center gap-2.5 rounded-2xl border border-white/70 bg-surface/90 px-4 py-3 shadow-lift backdrop-blur dark:border-white/10" style={{ animationDelay: `${c.delay}s` }}>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-950 text-gold-300">
                  <c.icon className="h-4 w-4" />
                </span>
                <span className="flex items-center gap-1 text-sm font-extrabold text-navy-950">
                  {c.text}
                  <BadgeCheck className="h-4 w-4 text-gold-500" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
