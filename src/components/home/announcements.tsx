"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { fill, formatNum } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const INTERVAL = 5000;

/** Auto-rotating strip of the important announcements; swipe, arrows or dots to navigate. */
export function AnnouncementsSlider() {
  const { locale, t } = useLocale();
  const items = t.announcements.items;
  const n = items.length;
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  // Bumped on resume so the progress bar restarts together with the fresh timer.
  const [cycle, setCycle] = useState(0);
  const pause = () => setPaused(true);
  const resume = () => {
    setPaused(false);
    setCycle((c) => c + 1);
  };

  const go = useCallback((delta: number) => setState(([i]) => [(i + delta + n) % n, delta]), [n]);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => go(1), INTERVAL);
    return () => clearTimeout(id);
  }, [paused, index, go]);

  // In RTL "next" slides in from the left.
  const sign = locale === "fa" ? -1 : 1;
  const Prev = locale === "fa" ? ChevronRight : ChevronLeft;
  const Next = locale === "fa" ? ChevronLeft : ChevronRight;
  const Arrow = locale === "fa" ? ArrowLeft : ArrowRight;
  const item = items[index];

  // Swipe switches as soon as the threshold is passed, without dragging the text along first.
  const swiped = useRef(false);
  function onPan(_: unknown, info: PanInfo) {
    if (swiped.current || Math.abs(info.offset.x) < 40 || Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
    swiped.current = true;
    go(info.offset.x * sign < 0 ? 1 : -1);
  }

  return (
    <section className="relative z-10 pb-6" aria-label={t.announcements.label}>
      <div className="container-x">
        <div
          className="relative overflow-hidden rounded-[1.5rem] border sm:rounded-[2rem] border-white/70 bg-surface shadow-soft dark:border-white/10"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
          role="region"
          aria-roledescription="carousel"
        >
          {/* Mobile/tablet: header + arrows on top, full-width body, then CTA. Desktop: one row. */}
          <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3 p-4 sm:gap-y-4 sm:p-6 lg:grid-cols-[auto_1fr_auto_auto] lg:gap-x-6 lg:p-5">
            <div className="flex items-center gap-3 lg:order-1">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-950 text-gold-300 sm:h-12 sm:w-12 sm:rounded-2xl">
                <Megaphone className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <div>
                <p className="text-sm font-black text-navy-950">{t.announcements.label}</p>
                <p className="text-xs font-bold text-muted" aria-live="polite">
                  {formatNum(locale, index + 1)} {locale === "fa" ? "از" : "/"} {formatNum(locale, n)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:order-4">
              <button type="button" onClick={() => go(-1)} aria-label={t.announcements.prev} className="grid h-9 w-9 place-items-center rounded-full bg-navy-50 text-navy-950 transition hover:bg-navy-100 sm:h-10 sm:w-10">
                <Prev className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label={t.announcements.next} className="grid h-9 w-9 place-items-center rounded-full bg-navy-50 text-navy-950 transition hover:bg-navy-100 sm:h-10 sm:w-10">
                <Next className="h-5 w-5" />
              </button>
            </div>

            <div className="relative col-span-2 min-h-[118px] overflow-hidden border-t border-navy-100 pt-3 sm:min-h-[92px] sm:pt-4 lg:order-2 lg:col-span-1 lg:min-h-[64px] lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0 dark:border-white/10">
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.div
                  key={index}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ x: `${d * sign * 40}%`, opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (d: number) => ({ x: `${-d * sign * 40}%`, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 220, damping: 28 }}
                  onPanStart={() => (swiped.current = false)}
                  onPan={onPan}
                  className="touch-pan-y select-none"
                >
                  <span className="inline-block rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-black text-gold-600 lg:hidden dark:text-gold-300">
                    {item.tag}
                  </span>
                  <div className="mt-2 flex items-center gap-2 lg:mt-0">
                    <span className="hidden shrink-0 rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-black text-gold-600 lg:inline-block dark:text-gold-300">
                      {item.tag}
                    </span>
                    <h3 className="line-clamp-2 text-[15px] font-black leading-7 text-navy-950 sm:text-lg lg:line-clamp-1">{item.title}</h3>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-muted sm:text-sm sm:leading-7 lg:line-clamp-1">{item.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <Link href={item.href} className="btn-navy col-span-2 w-full justify-center px-5 py-2.5 text-sm sm:w-auto sm:justify-self-start lg:order-3 lg:col-span-1">
              {t.announcements.more}
              <Arrow className="h-4 w-4" />
            </Link>
          </div>

          {/* Progress segments double as dots */}
          <div className="flex gap-1.5 px-4 pb-4 sm:px-6 lg:px-5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setState(([cur]) => [i, i >= cur ? 1 : -1])}
                aria-label={fill(t.showcase.goTo, { n: formatNum(locale, i + 1) })}
                aria-current={i === index}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy-100 dark:bg-white/10"
              >
                <span
                  key={i === index ? `${index}-${cycle}` : i}
                  className={cn(
                    "block h-full rounded-full bg-gold-400",
                    i < index ? "w-full" : i === index ? "animate-[announce-progress_5s_linear_forwards]" : "w-0",
                  )}
                  style={i === index ? { animationPlayState: paused ? "paused" : "running" } : undefined}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
