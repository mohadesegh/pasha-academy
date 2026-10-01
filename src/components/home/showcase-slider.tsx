"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { Building2, Check, ChevronLeft, ChevronRight, Gem, GraduationCap, Handshake, Languages, type LucideIcon } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { useLocale } from "@/components/i18n/locale-provider";
import { fill, formatNum } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Optional poster artwork per slide (same order as the dictionary slides).
 * Put a portrait image (≈ 9:16, e.g. 1080×1920) in /public/images/showcase/ and reference it here;
 * slides without an image render the built-in branded poster instead.
 */
const POSTERS: (string | null)[] = [null, null, null, null, null];

const ICONS: Record<string, LucideIcon> = { Gem, GraduationCap, Building2, Handshake, Languages };

const TONES = {
  navy: { card: "bg-gradient-to-b from-[#0f2d51] via-[#0b2340] to-[#06142a] text-white", kicker: "text-gold-300", sub: "text-white/70", chip: "bg-white/10 text-white", icon: "bg-gold-400 text-navy-950", cta: "bg-gold-400 text-navy-950" },
  cream: { card: "bg-gradient-to-b from-[#fbf6ec] via-[#f3e9d6] to-[#e9dcc2] text-[#06142a]", kicker: "text-[#a7772c]", sub: "text-[#0b2340]/70", chip: "bg-[#ffffff]/70 text-[#0b2340]", icon: "bg-[#06142a] text-gold-300", cta: "bg-[#06142a] text-white" },
  gold: { card: "bg-gradient-to-b from-[#eac677] via-[#deaf52] to-[#c9953a] text-[#06142a]", kicker: "text-[#0b2340]", sub: "text-[#06142a]/75", chip: "bg-[#ffffff]/40 text-[#06142a]", icon: "bg-[#06142a] text-gold-300", cta: "bg-[#06142a] text-white" },
} as const;

// Posters keep fixed colours (arbitrary values) so the dark theme overrides never touch them.
/**
 * 3D poster stage: the active card faces the viewer, its neighbours swing out almost edge-on
 * (inner edge towards the viewer) like the side walls of a corridor.
 */
export function ShowcaseSlider() {
  const { locale, t } = useLocale();
  const slides = t.showcase.slides;
  const n = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [wide, setWide] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const go = useCallback((delta: number) => setActive((a) => (a + delta + n) % n), [n]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), 5000);
    return () => clearInterval(id);
  }, [paused, go]);

  // Shortest signed distance on the ring, so the deck loops seamlessly.
  const offsetOf = (i: number) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  // Geometry is computed in LTR; in RTL "next" should come in from the left, so flip the axis.
  const dirSign = locale === "fa" ? -1 : 1;

  function onDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) < 60) return;
    go(info.offset.x < 0 ? dirSign : -dirSign);
  }

  const Prev = locale === "fa" ? ChevronRight : ChevronLeft;
  const Next = locale === "fa" ? ChevronLeft : ChevronRight;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <motion.div
        className="relative mx-auto h-[560px] max-w-6xl touch-pan-y select-none sm:h-[700px] lg:h-[760px]"
        style={{ perspective: 1600 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={onDragEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label={t.showcase.title}
      >
        {slides.map((s, i) => {
          const off = offsetOf(i);
          const abs = Math.abs(off);
          const x = off * dirSign;
          const tone = TONES[s.tone as keyof typeof TONES] ?? TONES.navy;
          const Icon = ICONS[s.icon] ?? Gem;
          const poster = POSTERS[i];
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 h-[500px] w-[280px] sm:h-[640px] sm:w-[370px] lg:h-[700px] lg:w-[410px]"
              style={{ zIndex: 10 - abs, transformStyle: "preserve-3d" }}
              initial={false}
              animate={{
                x: `calc(-50% + ${x * (wide ? 118 : 60)}%)`,
                y: "-50%",
                // Inner edge swings towards the viewer, outer edge away.
                rotateY: x === 0 ? 0 : x > 0 ? 80 : -80,
                scale: abs === 0 ? 1 : 0.92,
                opacity: abs > 1 ? 0 : 1,
                filter: abs === 0 ? "brightness(1)" : "brightness(0.8)",
              }}
              transition={{ type: "spring", stiffness: 110, damping: 22 }}
              aria-hidden={off !== 0}
              onClick={() => off !== 0 && setActive(i)}
            >
              <article
                className={cn(
                  "relative h-full w-full overflow-hidden rounded-[2.6rem] shadow-[0_40px_80px_-25px_rgba(6,20,42,0.55)] ring-1 ring-black/5",
                  off !== 0 && "cursor-pointer",
                  !poster && tone.card,
                )}
              >
                {poster ? (
                  <Image src={poster} alt={s.title} fill sizes="(min-width: 1024px) 410px, (min-width: 640px) 370px, 280px" className="object-cover" priority={i === 0} />
                ) : (
                  <div className="flex h-full flex-col p-6 sm:p-9">
                    <div className="flex items-center justify-between">
                      <LogoMark className="h-10 w-10" />
                      <span className={cn("text-[10px] font-black tracking-[0.25em]", tone.kicker)}>PASHA ACADEMY</span>
                    </div>
                    <p className={cn("mt-10 text-[10px] font-black tracking-[0.25em]", tone.kicker)}>{s.kicker}</p>
                    <h3 className="mt-3 text-3xl font-black leading-tight sm:text-5xl sm:leading-[1.15]">{s.title}</h3>
                    <p className={cn("mt-4 text-sm leading-7 sm:text-base sm:leading-8", tone.sub)}>{s.subtitle}</p>
                    <span className={cn("mt-6 grid h-16 w-16 place-items-center rounded-3xl shadow-lg", tone.icon)}>
                      <Icon className="h-8 w-8" />
                    </span>
                    <ul className="mt-auto space-y-2">
                      {s.points.map((p) => (
                        <li key={p} className={cn("flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold backdrop-blur", tone.chip)}>
                          <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={s.href}
                      tabIndex={off === 0 ? 0 : -1}
                      className={cn("mt-5 rounded-full py-3 text-center text-sm font-black transition hover:opacity-90", tone.cta)}
                      onClick={(e) => off !== 0 && e.preventDefault()}
                    >
                      {s.cta}
                    </Link>
                  </div>
                )}
              </article>
              {/* Soft floor reflection under the active card */}
              {off === 0 && <div className="absolute -bottom-6 left-1/2 h-6 w-3/4 -translate-x-1/2 rounded-full bg-navy-950/20 blur-xl" aria-hidden />}
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button type="button" onClick={() => go(-1)} aria-label={t.showcase.prev} className="grid h-11 w-11 place-items-center rounded-full bg-surface text-navy-950 shadow-soft transition hover:scale-105">
          <Prev className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={fill(t.showcase.goTo, { n: formatNum(locale, i + 1) })}
              aria-current={i === active}
              className={cn("h-2 rounded-full transition-all", i === active ? "w-8 bg-gold-400" : "w-2 bg-navy-200 hover:bg-navy-300")}
            />
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label={t.showcase.next} className="grid h-11 w-11 place-items-center rounded-full bg-surface text-navy-950 shadow-soft transition hover:scale-105">
          <Next className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
