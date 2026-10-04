"use client";

import { animate, motion, useInView, useMotionValue, useTransform, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type RefObject } from "react";
import { toFa } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

// One shared scroll/resize listener, throttled to one run per frame, for every element still waiting to
// be revealed. Elements leave the set as soon as they are shown, so a fully revealed page has no listener.
const pending = new Set<() => void>();
let frame = 0;
const flush = () => {
  frame = 0;
  pending.forEach((check) => check());
};
const schedule = () => {
  if (!frame) frame = requestAnimationFrame(flush);
};
function watchPosition(check: () => void) {
  if (pending.size === 0) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }
  pending.add(check);
  return () => {
    pending.delete(check);
    if (pending.size === 0) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    }
  };
}

/**
 * True once the element has reached (or been scrolled past) the screen. IntersectionObserver alone
 * sometimes never fires (fast scrolls, jumps, some browsers), which would leave content hidden for
 * good, so the shared position check above backs it up.
 */
function useRevealed(ref: RefObject<Element | null>) {
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const [reached, setReached] = useState(false);
  useEffect(() => {
    if (inView || reached) return;
    const check = () => {
      const r = ref.current?.getBoundingClientRect();
      if (r && r.top < window.innerHeight) setReached(true);
    };
    check();
    return watchPosition(check);
  }, [ref, inView, reached]);
  return inView || reached;
}

/** Fades and lifts its children into view once, on scroll. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const Comp = motion[as];
  const ref = useRef<HTMLElement>(null);
  const shown = useRevealed(ref);
  return (
    <Comp
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={className}
      initial={{ opacity: 0, y }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </Comp>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useRevealed(ref);
  return (
    <motion.div ref={ref} className={className} variants={container} initial="hidden" animate={shown ? "show" : "hidden"}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

/** Counts up from zero when scrolled into view, rendered in Persian digits unless `latin`. */
export function Counter({ to, suffix = "", latin = false }: { to: number; suffix?: string; latin?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useRevealed(ref);
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => {
    const n = Math.round(v).toLocaleString("en-US");
    return (latin ? n : toFa(n).replace(/,/g, "٬")) + suffix;
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, { duration: 2, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, to, value]);

  return <motion.span ref={ref}>{text}</motion.span>;
}
