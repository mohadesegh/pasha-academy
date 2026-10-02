"use client";

import { animate, motion, useInView, useMotionValue, useTransform, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type RefObject } from "react";
import { toFa } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * True once the element has reached the screen. IntersectionObserver alone sometimes never fires
 * (fast scrolls, jumps, some browsers), which would leave content hidden for good, so a scroll/resize
 * position check backs it up.
 */
function useRevealed(ref: RefObject<Element | null>) {
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const [reached, setReached] = useState(false);
  useEffect(() => {
    if (reached) return;
    const check = () => {
      const r = ref.current?.getBoundingClientRect();
      if (r && r.top < window.innerHeight && r.bottom > 0) setReached(true);
      // Already scrolled past it: show it too.
      else if (r && r.bottom <= 0) setReached(true);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [ref, reached]);
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
