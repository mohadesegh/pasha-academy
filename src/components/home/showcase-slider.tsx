"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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
  // Card width in px for the current breakpoint (mirrors the w-[...] classes below), so offsets are whole pixels.
  const [cardW, setCardW] = useState(410);

  useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const sync = () => setCardW(lg.matches ? 410 : sm.matches ? 370 : 280);
    sync();
    sm.addEventListener("change", sync);
    lg.addEventListener("change", sync);
    return () => {
      sm.removeEventListener("change", sync);
      lg.removeEventListener("change", sync);
    };
  }, []);
  // Neighbours tuck in just behind the active card on every screen size, so the deck reads as a turning ring.
  const spread = Math.round(cardW * (cardW > 280 ? 0.74 : 0.6));

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

  // Swipe: change slide as soon as the finger passes the threshold; the stage itself never moves with the finger.
  const swiped = useRef(false);
  const lastSwipe = useRef(0);
  function onPan(_: unknown, info: PanInfo) {
    if (swiped.current || Math.abs(info.offset.x) < 40 || Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
    swiped.current = true;
    lastSwipe.current = Date.now();
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
        className="relative mx-auto h-[600px] max-w-6xl touch-pan-y select-none sm:h-[700px] lg:h-[760px]"
        style={{ perspective: 1600 }}
        onPanStart={() => (swiped.current = false)}
        onPan={onPan}
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
              // Centred with inset/margin (not translate -50%) and moved in whole pixels: once the active card
              // settles its transform is "none", so the browser paints its text crisply instead of as a 3D bitmap.
              className="absolute inset-0 m-auto h-[540px] w-[280px] sm:h-[640px] sm:w-[370px] lg:h-[700px] lg:w-[410px]"
              style={{ zIndex: 10 - abs }}
              initial={false}
              animate={{
                x: x * spread,
                // Inner edge swings towards the viewer, outer edge away.
                rotateY: x === 0 ? 0 : x > 0 ? 80 : -80,
                scale: abs === 0 ? 1 : 0.92,
                opacity: abs > 1 ? 0 : 1,
              }}
              transition={{ type: "spring", stiffness: 110, damping: 22 }}
              aria-hidden={off !== 0}
              // A mouse swipe ends with a click on whichever card is under the pointer; ignore that one.
              onClick={() => off !== 0 && Date.now() - lastSwipe.current > 300 && setActive(i)}
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
                  <div className="flex h-full flex-col p-6 sm:p-8 lg:p-9">
                    {/* Top row: slide icon + brand mark */}
                    <div className="flex shrink-0 items-center justify-between">
                      <span className={cn("grid h-12 w-12 place-items-center rounded-2xl shadow-lg sm:h-14 sm:w-14", tone.icon)}>
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                      </span>
                      <LogoMark className="h-9 w-9 opacity-90 sm:h-10 sm:w-10" />
                    </div>

                    {/* Label chip, title and subtitle flow together; the block keeps a fixed minimum height so the bottom lines up */}
                    <div className="mt-6 min-h-[200px] shrink-0 sm:mt-8 sm:min-h-[230px]">
                      <span className={cn("inline-block rounded-full px-3 py-1 font-black", locale === "fa" ? "text-xs" : "text-[10px] tracking-[0.2em]", tone.chip, tone.kicker)}>
                        {s.kicker}
                      </span>
                      <h3 className="mt-3 line-clamp-2 text-[1.9rem] font-black leading-[1.25] sm:text-[2.6rem]">{s.title}</h3>
                      <p className={cn("mt-3 line-clamp-3 text-sm leading-7 sm:text-base sm:leading-8", tone.sub)}>{s.subtitle}</p>
                    </div>

                    {/* Points + CTA pinned to the bottom */}
                    <ul className="mt-auto shrink-0 space-y-1.5 pt-4 sm:space-y-2">
                      {s.points.map((p) => (
                        <li key={p} className={cn("flex h-9 items-center gap-2.5 rounded-2xl px-4 text-xs font-bold sm:h-11 sm:text-[13px]", tone.chip)}>
                          <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
                          <span className="truncate">{p}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={s.href}
                      tabIndex={off === 0 ? 0 : -1}
                      className={cn("mt-4 flex h-12 shrink-0 items-center justify-center rounded-full sm:mt-5 text-sm font-black transition hover:opacity-90 sm:h-13", tone.cta)}
                      onClick={(e) => off !== 0 && e.preventDefault()}
                    >
                      {s.cta}
                    </Link>
                  </div>
                )}
                <div className={cn("pointer-events-none absolute inset-0 bg-[#06142a] transition-opacity duration-500", abs === 0 ? "opacity-0" : "opacity-25")} aria-hidden />
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
