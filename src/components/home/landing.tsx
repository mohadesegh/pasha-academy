import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Bot, Building2, Check, Gem, Globe2, Landmark, Laptop, MessageCircle, Pill, Smile, Stethoscope, Zap,
  type LucideIcon,
} from "lucide-react";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { UniMonogram } from "@/components/university/university-card";
import { SampleBadge, cityName, programName, universityName, whatsappLink } from "@/components/programs/program-list";
import { PROGRAM_DEGREES, type ProgramDegree } from "@/lib/constants";
import { fill, formatNum, formatUsd, type Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { featuredUniversities, marqueeUniversities, scholarshipExample } from "@/lib/programs";
import { cn } from "@/lib/utils";

type L = { locale: Locale; t: Dict };
type Example = NonNullable<Awaited<ReturnType<typeof scholarshipExample>>>;

const ICONS: Record<string, LucideIcon> = { Stethoscope, Smile, Laptop, Bot, Pill, Building2, Globe2, Landmark, Zap };
const TONES: Record<string, string> = {
  rose: "from-rose-100/80 to-rose-50/40 dark:from-rose-500/10 dark:to-transparent",
  teal: "from-teal-100/80 to-teal-50/40 dark:from-teal-500/10 dark:to-transparent",
  violet: "from-violet-100/80 to-violet-50/40 dark:from-violet-500/10 dark:to-transparent",
  fuchsia: "from-fuchsia-100/80 to-fuchsia-50/40 dark:from-fuchsia-500/10 dark:to-transparent",
  emerald: "from-emerald-100/80 to-emerald-50/40 dark:from-emerald-500/10 dark:to-transparent",
  amber: "from-amber-100/80 to-amber-50/40 dark:from-amber-500/10 dark:to-transparent",
};

const arrowFor = (locale: Locale) => (locale === "fa" ? ArrowLeft : ArrowRight);
const pct = (locale: Locale) => (locale === "fa" ? "٪" : "%");

/** Centered kicker + title + lead, accaco-style. */
export function Heading({ kicker, title, lead }: { kicker: string; title: string; lead?: string }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-3xl text-center">
      <p className="kicker">{kicker}</p>
      <h2 className="mt-3 text-3xl font-black leading-tight text-navy-950 sm:text-5xl">{title}</h2>
      {lead && <p className="mt-5 leading-8 text-muted">{lead}</p>}
    </Reveal>
  );
}

export function UniversityMarquee({ universities, locale, t }: L & { universities: Awaited<ReturnType<typeof marqueeUniversities>> }) {
  if (universities.length === 0) return null;
  const loop = [...universities, ...universities];
  return (
    <section aria-label={t.marquee.label} className="relative overflow-hidden py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-sand-50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-sand-50 to-transparent" />
      <ul className="animate-marquee flex w-max gap-4" dir="rtl">
        {loop.map((u, i) => (
          <li key={`${u.slug}-${i}`} aria-hidden={i >= universities.length}>
            <Link href={`/universities/${u.slug}`} className="card flex h-16 min-w-52 items-center gap-3 px-5 transition hover:shadow-lift" tabIndex={i >= universities.length ? -1 : 0}>
              <UniMonogram name={u.nameEn} color={u.color} className="h-9 w-9 rounded-xl text-[11px]" />
              <span className="whitespace-nowrap text-sm font-extrabold text-navy-900">{universityName(u, locale)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StatsSection({ locale, t }: L) {
  return (
    <section className="py-20">
      <div className="container-x">
        <Heading kicker={t.stats.eyebrow} title={t.stats.title} />
        <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {t.stats.items.map((s) => (
            <StaggerItem key={s.label} className="card p-7 text-center">
              <p className="text-4xl font-black text-navy-950 sm:text-5xl" dir="ltr">
                <Counter to={s.value} suffix={s.suffix} latin={locale === "en"} />
              </p>
              <p className="mt-3 text-sm font-bold text-muted">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function RoadmapSection({ locale, t, whatsapp }: L & { whatsapp: string }) {
  const Arrow = arrowFor(locale);
  return (
    <section className="py-20">
      <div className="container-x">
        <Heading kicker={t.roadmap.eyebrow} title={t.roadmap.title} lead={t.roadmap.lead} />
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-gold-100/60 via-sand-100 to-sand-50 p-5 ring-1 ring-white/60 sm:p-8 dark:from-gold-500/10 dark:ring-white/5">
          <div className="absolute inset-x-16 top-[4.6rem] hidden h-0.5 bg-gradient-to-l from-gold-300 via-gold-400 to-gold-300 lg:block" aria-hidden />
          <Stagger className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.roadmap.steps.map((s, i) => {
              const external = s.href === "whatsapp";
              const cls = cn("btn btn-sm mt-6 w-full justify-between", i === 0 ? "bg-navy-950 text-white hover:bg-navy-800" : "border border-line bg-white text-navy-900 hover:bg-sand-100");
              return (
                <StaggerItem key={s.title} className="card flex flex-col p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-500 text-lg font-black text-navy-950 shadow-glow">
                    {formatNum(locale, i + 1)}
                  </span>
                  <h3 className="mt-5 text-lg font-black text-navy-950">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-7 text-muted">{s.text}</p>
                  {external ? (
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={cls}>{s.cta}<Arrow className="h-4 w-4" /></a>
                  ) : (
                    <Link href={s.href} className={cls}>{s.cta}<Arrow className="h-4 w-4" /></Link>
                  )}
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

export function GoldenScholarship({ locale, t, example, whatsapp }: L & { example: Example | null; whatsapp: string }) {
  const degree = example ? PROGRAM_DEGREES[example.program.degree as ProgramDegree]?.[locale] : "";
  const k = (n: number) => (locale === "fa" ? formatUsd(locale, n) : `$${(n / 1000).toFixed(1)}K`);
  return (
    <section className="py-20">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gold-100 via-sand-50 to-sand-100 p-6 ring-1 ring-gold-200/70 sm:p-12 dark:from-gold-500/10 dark:via-sand-100 dark:to-sand-50 dark:ring-gold-500/20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-1.5 text-xs font-black tracking-widest text-navy-900 shadow-soft">
                <span className="h-2 w-2 rounded-full bg-gold-500" />
                {t.special.eyebrow}
              </span>
              <div className="mt-6 flex items-center gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-3xl bg-surface shadow-soft"><Gem className="h-8 w-8 text-gold-500" /></span>
                <div>
                  <h2 className="text-4xl font-black text-navy-950 sm:text-5xl">{t.special.title}</h2>
                  <p className="mt-1 font-bold text-gold-600">{t.special.subtitle}</p>
                </div>
              </div>
              <p className="mt-6 leading-8 text-navy-900/80">{t.special.text}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {t.special.features.map((f) => (
                  <div key={f.title} className="card p-5">
                    <p className="font-black text-navy-950">{fill(f.title, { percent: formatNum(locale, example?.savingPercent ?? 60) })}</p>
                    <p className="mt-1 text-sm leading-7 text-muted">{f.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/scholarships" className="btn-navy">{t.special.ctaList}</Link>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-outline">{t.special.ctaConsult}</a>
              </div>
            </Reveal>

            {example && (
              <Reveal delay={0.15} className="relative">
                <span className="absolute -top-4 z-10 rounded-full bg-surface px-4 py-1.5 text-xs font-black text-gold-600 shadow-soft ltr:right-8 rtl:left-8">{t.special.badge}</span>
                <div className="card space-y-4 p-5 sm:p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-3xl bg-sand-100 p-5">
                      <p className="text-xs font-bold text-muted">{t.special.regular}</p>
                      <p className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">{k(example.termly)}</p>
                      <p className="mt-3 text-xs leading-6 text-muted">{fill(t.special.regularNote, { years: formatNum(locale, example.program.durationYears), degree })}</p>
                    </div>
                    <div className="rounded-3xl border-2 border-gold-400 bg-gold-50 p-5">
                      <p className="text-xs font-bold text-gold-600">{t.special.scholarship}</p>
                      <p className="mt-2 text-3xl font-black text-navy-950 sm:text-4xl">{k(example.scholarship)}</p>
                      <p className="mt-3 text-xs leading-6 text-muted">{t.special.scholarshipNote}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-3xl bg-navy-950 p-6 text-white">
                    <div>
                      <p className="text-xs font-bold tracking-widest text-gold-300">{t.special.advantage}</p>
                      <p className="mt-2 text-xl font-black leading-snug">{t.special.advantageText}</p>
                    </div>
                    <p className="text-5xl font-black text-gold-300 sm:text-6xl" dir="ltr">{formatNum(locale, example.savingPercent)}{pct(locale)}</p>
                  </div>
                  <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    {fill(t.special.example, { program: programName(example.program, locale), university: universityName(example.program.university, locale) })}
                    {example.program.sample && <SampleBadge t={t} />}
                  </p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedUniversities({ locale, t, universities }: L & { universities: Awaited<ReturnType<typeof featuredUniversities>> }) {
  const Arrow = arrowFor(locale);
  return (
    <section className="py-20">
      <div className="container-x">
        <Heading kicker={t.featured.eyebrow} title={t.featured.title} lead={t.featured.lead} />
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {universities.map((u) => (
            <StaggerItem key={u.id}>
              <Link href={`/universities/${u.slug}`} className="card group flex h-full flex-col p-6 transition hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-navy-950">{locale === "fa" ? u.name : u.nameEn}</h3>
                    <p className="mt-0.5 text-xs font-bold text-gold-600">#{cityName(u.city, locale)}</p>
                  </div>
                  <UniMonogram name={u.nameEn} color={u.color} className="h-12 w-12 text-sm" />
                </div>
                {locale === "fa" && <p className="mt-4 line-clamp-2 text-sm leading-7 text-muted">{u.summary}</p>}
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted">{t.featured.tuition}</dt>
                    <dd className="font-black text-navy-950">
                      {u.minTuition != null ? `${formatUsd(locale, u.minTuition)} – ${formatUsd(locale, u.maxTuition!)}` : "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted">{t.featured.programs}</dt>
                    <dd className="font-bold text-navy-950">{formatNum(locale, u.programCount)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted">{t.featured.scholarshipSeats}</dt>
                    <dd className={cn("font-bold", u.seatCount ? "text-gold-600" : "text-muted")}>{u.seatCount ? formatNum(locale, u.seatCount) : "—"}</dd>
                  </div>
                </dl>
                <div className="mt-auto flex items-center justify-between border-t border-line pt-4 text-sm font-extrabold text-gold-600">
                  <span className="mt-4">{t.featured.profile}</span>
                  <span className="mt-4 grid h-8 w-8 place-items-center rounded-full bg-gold-100 transition group-hover:bg-gold-400 group-hover:text-navy-950"><Arrow className="h-4 w-4" /></span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-10 text-center">
          <Link href="/universities" className="btn-outline">{t.featured.viewAll}</Link>
        </div>
      </div>
    </section>
  );
}

export function PopularMajors({ locale, t }: L) {
  const Arrow = arrowFor(locale);
  return (
    <section className="py-20">
      <div className="container-x">
        <Heading kicker={t.majors.eyebrow} title={t.majors.title} lead={t.majors.lead} />
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {t.majors.items.map((m) => {
            const Icon = ICONS[m.icon] ?? Laptop;
            return (
              <StaggerItem key={m.name}>
                <Link
                  href={`/programs?q=${encodeURIComponent(m.query)}`}
                  className={cn("group flex h-full flex-col rounded-3xl bg-gradient-to-br p-6 ring-1 ring-white/70 transition hover:-translate-y-1 hover:shadow-lift dark:ring-white/5", TONES[m.tone])}
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface shadow-soft"><Icon className="h-6 w-6 text-navy-800" /></span>
                    <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-extrabold text-navy-800">{m.tag}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-black text-navy-950">{m.name}</h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between"><dt className="text-muted">{t.majors.duration}</dt><dd className="font-black text-navy-950">{fill(t.common.years, { n: formatNum(locale, m.years) })}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">{t.majors.difficulty}</dt><dd className="font-black text-navy-950">{m.difficulty}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">{t.majors.outlook}</dt><dd className="font-black text-gold-600">{m.outlook}</dd></div>
                  </dl>
                  <span className="mt-6 flex items-center justify-between border-t border-navy-950/10 pt-4 text-sm font-extrabold text-navy-900">
                    {t.majors.cta}
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-surface transition group-hover:bg-navy-950 group-hover:text-white"><Arrow className="h-4 w-4" /></span>
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

export function PartnerNetwork({ t }: L) {
  return (
    <section className="py-20">
      <div className="container-x">
        <Heading kicker={t.partner.eyebrow} title={t.partner.title} lead={t.partner.lead} />
        <Stagger className="grid gap-5 md:grid-cols-3">
          {t.partner.items.map((p) => {
            const Icon = ICONS[p.icon] ?? Globe2;
            return (
              <StaggerItem key={p.title} className="card p-8">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-navy-950 text-gold-300"><Icon className="h-7 w-7" /></span>
                <h3 className="mt-6 text-xl font-black text-navy-950">{p.title}</h3>
                <p className="mt-3 leading-8 text-muted">{p.text}</p>
              </StaggerItem>
            );
          })}
        </Stagger>
        <div className="mt-10 text-center">
          <Link href="/agents" className="btn-navy px-8">{t.partner.cta}</Link>
        </div>
      </div>
    </section>
  );
}

export function PaymentPlans({ locale, t, example }: L & { example: Example | null }) {
  if (!example) return null;
  const degree = PROGRAM_DEGREES[example.program.degree as ProgramDegree]?.[locale] ?? "";
  const plans = [
    { key: "termly", ...t.plans.termly, price: example.termly, href: "/programs", featured: false },
    { key: "scholarship", ...t.plans.scholarship, price: example.scholarship, href: "/scholarships", featured: true },
    { key: "cash", ...t.plans.cash, price: example.cash, href: "/programs", featured: false },
  ];
  return (
    <section className="py-20">
      <div className="container-x">
        <Heading
          kicker={t.plans.eyebrow}
          title={t.plans.title}
          lead={fill(t.plans.lead, { years: formatNum(locale, example.program.durationYears), degree })}
        />
        <Stagger className="grid items-center gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <StaggerItem key={p.key}>
              <div className={cn("card relative flex flex-col p-8", p.featured && "border-2 border-gold-400 shadow-lift lg:scale-105")}>
                {"badge" in p && p.badge && (
                  <span className="absolute -top-4 rounded-full bg-gold-400 px-4 py-1.5 text-xs font-black text-navy-950 shadow-glow ltr:left-8 rtl:right-8">{p.badge}</span>
                )}
                <h3 className="text-xl font-black text-navy-950">{p.title}</h3>
                <p className="mt-3 text-4xl font-black text-navy-950 sm:text-5xl">{formatUsd(locale, p.price)}</p>
                <p className="mt-4 text-sm leading-7 text-muted">{p.text}</p>
                <ul className="mt-6 space-y-3 text-sm font-bold text-navy-900">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2">
                      <span className={cn("grid h-5 w-5 place-items-center rounded-full", p.featured ? "bg-gold-400 text-navy-950" : "bg-sand-200 text-navy-800")}><Check className="h-3 w-3" strokeWidth={3} /></span>
                      {pt}
                    </li>
                  ))}
                </ul>
                <Link href={p.href} className={cn("btn mt-8 w-full py-3.5", p.featured ? "bg-gold-400 text-navy-950 hover:bg-gold-300" : "bg-navy-950 text-white hover:bg-navy-800")}>{p.cta}</Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        {example.program.sample && <p className="mt-8 text-center text-xs font-bold text-gold-600">{t.common.sampleNotice}</p>}
      </div>
    </section>
  );
}

export function FinalCta({ t, whatsapp }: L & { whatsapp: string }) {
  return (
    <section className="pb-24 pt-10">
      <div className="container-x">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-navy-950 px-6 py-14 text-center text-white sm:px-12">
          <div className="bg-pattern absolute inset-0 opacity-60" aria-hidden />
          <div className="relative">
            <h2 className="text-3xl font-black sm:text-5xl">{t.cta.title}</h2>
            <p className="mx-auto mt-5 max-w-xl leading-8 text-white/70">{t.cta.text}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-primary px-8 py-4 text-base"><MessageCircle className="h-5 w-5" />{t.cta.primary}</a>
              <Link href="/register" className="btn-ghost-light px-8 py-4 text-base">{t.cta.secondary}</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export { whatsappLink };
