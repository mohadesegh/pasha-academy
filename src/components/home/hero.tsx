"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowLeft, BadgeCheck, BedDouble, GraduationCap, IdCard, Sparkles, Star } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const CARDS = [
  { icon: GraduationCap, title: "نامه پذیرش صادر شد", sub: "دانشگاه فنی استانبول — مهندسی کامپیوتر", tone: "bg-crimson-500", pos: "top-4 right-0 sm:right-6", depth: 30, delay: 0.5 },
  { icon: BedDouble, title: "خوابگاه رزرو شد", sub: "شیشلی، استانبول — اتاق دو نفره", tone: "bg-gold-400", pos: "top-[46%] left-0 lg:-left-12", depth: -40, delay: 0.7 },
  { icon: IdCard, title: "کارت اقامت تحصیلی", sub: "Öğrenci İkamet İzni — تایید شد", tone: "bg-turquoise-500", pos: "bottom-2 right-4 sm:right-14", depth: 22, delay: 0.9 },
];

function Parallax({ sx, sy, depth, className, children, ...rest }: {
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  depth: number;
  className?: string;
  children: React.ReactNode;
} & React.ComponentProps<typeof motion.div>) {
  const x = useTransform(sx, (v) => v * depth);
  const y = useTransform(sy, (v) => v * depth);
  return (
    <motion.div className={className} style={{ x, y }} {...rest}>
      {children}
    </motion.div>
  );
}

const HEADLINE = ["آینده‌ات", "را", "در", "ترکیه", "بساز"];

export function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 15 });
  const sy = useSpring(my, { stiffness: 60, damping: 15 });

  function onMove(e: React.MouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <section onMouseMove={onMove} className="relative isolate overflow-hidden bg-navy-950 pb-24 pt-32 text-white lg:pb-32 lg:pt-40">
      <div className="bg-pattern absolute inset-0 -z-10" aria-hidden />
      <motion.div
        aria-hidden
        className="absolute -right-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-crimson-500/25 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-52 -left-32 -z-10 h-[560px] w-[560px] rounded-full bg-turquoise-500/20 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-navy-950 to-transparent" aria-hidden />

      <div className="container-x grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <motion.span
            className="eyebrow border-white/15 bg-white/5 text-gold-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            مشاوره تخصصی تحصیل، اقامت و خوابگاه در ترکیه
          </motion.span>

          <h1 className="mt-6 text-5xl font-black leading-[1.25] sm:text-6xl lg:text-7xl">
            {HEADLINE.map((w, i) => (
              <motion.span
                key={i}
                className={`ml-3 inline-block ${w === "ترکیه" ? "text-gradient" : ""}`}
                initial={{ opacity: 0, y: 40, rotateX: -60 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease }}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="mt-6 max-w-xl text-lg leading-9 text-white/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease }}
          >
            از انتخاب بهترین دانشگاه دولتی یا خصوصی تا رزرو خوابگاه و گرفتن کارت اقامت؛ پاشا آکادمی تمام مسیر
            تحصیل شما در ترکیه را هموار می‌کند — شفاف، سریع و کاملا آنلاین.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease }}
          >
            <Link href="/contact#consult" className="btn-primary px-8 py-4 text-base">
              دریافت مشاوره رایگان
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/universities" className="btn-ghost-light px-8 py-4 text-base">
              مشاهده دانشگاه‌ها
            </Link>
          </motion.div>

          <motion.div
            className="mt-12 flex flex-wrap items-center gap-6 text-sm text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex -space-x-3 space-x-reverse">
              {["#e30a17", "#deaf52", "#129f98", "#4a78b0"].map((c, i) => (
                <span key={i} className="grid h-10 w-10 place-items-center rounded-full border-2 border-navy-950 text-xs font-black" style={{ background: c }}>
                  {["س", "ا", "ن", "م"][i]}
                </span>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 text-gold-400">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-1">بیش از ۲۴۰۰ دانشجوی موفق در ترکیه</p>
            </div>
          </motion.div>
        </div>

        {/* Visual */}
        <div className="relative mx-auto h-[440px] w-full max-w-lg sm:h-[500px]" aria-hidden>
          <motion.div
            className="absolute inset-0 m-auto h-[340px] w-[340px] rounded-full border border-dashed border-gold-400/30 sm:h-[420px] sm:w-[420px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {["استانبول", "آنکارا", "ازمیر", "آنتالیا"].map((city, i) => (
              <span
                key={city}
                className="absolute rounded-full border border-white/10 bg-navy-800/80 px-3 py-1 text-xs font-bold text-gold-200 backdrop-blur"
                style={{
                  top: `${50 - 50 * Math.cos((i * Math.PI) / 2)}%`,
                  left: `${50 + 50 * Math.sin((i * Math.PI) / 2)}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {city}
              </span>
            ))}
          </motion.div>

          <Parallax
            sx={sx}
            sy={sy}
            depth={-20}
            className="absolute inset-0 m-auto grid h-52 w-52 place-items-center rounded-[2.5rem] bg-gradient-to-br from-navy-700 to-navy-900 shadow-lift ring-1 ring-white/10"
            initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3, ease }}
          >
            <svg viewBox="0 0 100 100" className="h-32 w-32">
              <mask id="hero-crescent">
                <rect width="100" height="100" fill="white" />
                <circle cx="53" cy="50" r="22" fill="black" />
              </mask>
              <circle cx="43" cy="50" r="27" fill="#deaf52" mask="url(#hero-crescent)" />
              <path d="M70 40l3 7.4 8 .6-6.1 5.2 1.9 7.8-6.8-4.2-6.8 4.2 1.9-7.8L59 48l8-.6z" fill="#e30a17" />
            </svg>
          </Parallax>

          {CARDS.map((c) => (
            <Parallax
              key={c.title}
              sx={sx}
              sy={sy}
              depth={c.depth}
              className={`absolute ${c.pos} w-64 sm:w-72`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: c.delay, ease }}
            >
              <div className="animate-float flex items-center gap-3 rounded-2xl border border-white/15 bg-navy-800/85 p-4 shadow-lift backdrop-blur-xl" style={{ animationDelay: `${c.delay}s` }}>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${c.tone} text-white`}>
                  <c.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-sm font-extrabold">
                    {c.title}
                    <BadgeCheck className="h-4 w-4 text-turquoise-300" />
                  </p>
                  <p className="truncate text-xs text-white/60">{c.sub}</p>
                </div>
              </div>
            </Parallax>
          ))}
        </div>
      </div>
    </section>
  );
}
