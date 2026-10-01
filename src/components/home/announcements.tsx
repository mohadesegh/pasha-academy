"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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

  function onDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) < 50) return;
    go(info.offset.x * sign < 0 ? 1 : -1);
  }

  return (
    <section className="relative z-10 -mt-8 pb-6" aria-label={t.announcements.label}>
      <div className="container-x">
        <div
          className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-surface shadow-soft dark:border-white/10"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
          role="region"
          aria-roledescription="carousel"
        >
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
            <div className="flex shrink-0 items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy-950 text-gold-300">
                <Megaphone className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-black text-navy-950">{t.announcements.label}</p>
                <p className="text-xs font-bold text-muted" aria-live="polite">
                  {formatNum(locale, index + 1)} / {formatNum(locale, n)}
                </p>
              </div>
            </div>

            <div className="relative min-h-[92px] flex-1 overflow-hidden sm:min-h-[64px] sm:border-s sm:border-navy-100 sm:ps-6 dark:sm:border-white/10">
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
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={onDragEnd}
                  className="touch-pan-y select-none"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-black text-gold-600 dark:text-gold-300">
                      {item.tag}
                    </span>
                    <h3 className="text-base font-black text-navy-950 sm:text-lg">{item.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-7 text-muted">{item.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3">
              <Link href={item.href} className="btn-navy px-5 py-2.5 text-sm">
                {t.announcements.more}
                <Arrow className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => go(-1)} aria-label={t.announcements.prev} className="grid h-10 w-10 place-items-center rounded-full bg-navy-50 text-navy-950 transition hover:bg-navy-100">
                  <Prev className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label={t.announcements.next} className="grid h-10 w-10 place-items-center rounded-full bg-navy-50 text-navy-950 transition hover:bg-navy-100">
                  <Next className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress segments double as dots */}
          <div className="flex gap-1.5 px-4 pb-4 sm:px-5">
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
