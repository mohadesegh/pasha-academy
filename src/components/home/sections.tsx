import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileUp, Handshake, Quote, ShieldCheck, Upload, Users } from "lucide-react";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { ServiceIcon, accentStyles } from "@/components/ui/service-icon";
import { UniMonogram, UniversityCard, type UniversityCardData } from "@/components/university/university-card";
import { PROCESS, SERVICES, STATS, TESTIMONIALS } from "@/data/content";
import { toFa } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  id,
  center = true,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  id?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={id} className="section-title mt-4">{title}</h2>
      {lead && <p className="section-lead">{lead}</p>}
    </Reveal>
  );
}

export function ServicesSection() {
  return (
    <section className="relative py-24" aria-labelledby="services-title">
      <div className="container-x">
        <SectionHeading
          id="services-title"
          eyebrow="خدمات پاشا آکادمی"
          title="هر آنچه برای تحصیل در ترکیه نیاز دارید"
          lead="از روز اول مشاوره تا روزی که کارت اقامت در دست شماست، یک تیم متخصص همراه شماست."
        />
        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <StaggerItem key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="group card relative flex h-full flex-col overflow-hidden p-7 transition duration-300 hover:-translate-y-2 hover:shadow-lift"
              >
                <span className={`pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${accentStyles[s.accent].glow} to-transparent opacity-0 blur-2xl transition duration-500 group-hover:opacity-100`} />
                <ServiceIcon icon={s.icon} accent={s.accent} />
                <h3 className="mt-7 text-lg font-extrabold text-navy-950">{s.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted">{s.short}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-crimson-500">
                  جزئیات خدمت
                  <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function StatsBand() {
  return (
    <section className="container-x" aria-label="آمار پاشا آکادمی">
      <Reveal className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-navy-900 via-navy-800 to-navy-950 px-6 py-12 text-white shadow-lift sm:px-12">
        <div className="bg-pattern absolute inset-0" aria-hidden />
        <dl className="relative grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col text-center">
              <dt className="order-2 mt-2 text-sm text-white/60">{s.label}</dt>
              <dd className="text-4xl font-black text-gold-300 sm:text-5xl">
                <Counter to={s.value} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}

export function UniversitiesSection({ featured, all }: { featured: UniversityCardData[]; all: UniversityCardData[] }) {
  const loop = [...all, ...all];
  return (
    <section className="py-24" aria-labelledby="unis-title">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            id="unis-title"
            center={false}
            eyebrow="دانشگاه‌های همکار"
            title="برترین دانشگاه‌های خصوصی ترکیه"
            lead="اطلاعات کامل، رشته‌ها، شهریه تقریبی و شرایط پذیرش هر دانشگاه را ببینید."
          />
          <Reveal>
            <Link href="/universities" className="btn-outline">
              همه دانشگاه‌ها
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </div>

      {/* Infinite logo marquee */}
      <div className="relative mt-12 overflow-hidden py-3 [mask-image:linear-gradient(to_left,transparent,black_10%,black_90%,transparent)]" aria-hidden>
        <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
          {loop.map((u, i) => (
            <div key={`${u.slug}-${i}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-3 shadow-soft">
              <UniMonogram name={u.nameEn} color={u.color} className="h-10 w-10 rounded-xl text-sm" />
              <span className="whitespace-nowrap text-sm font-bold text-navy-900">{u.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container-x">
        <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((u) => (
            <StaggerItem key={u.slug}>
              <UniversityCard u={u} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function ProcessSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24" aria-labelledby="process-title">
      <div className="bg-pattern-dark absolute inset-0" aria-hidden />
      <div className="container-x relative">
        <SectionHeading id="process-title" eyebrow="مسیر شما" title="چهار قدم تا شروع تحصیل در ترکیه" />
        <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <li className="absolute right-[12%] left-[12%] top-8 hidden h-0.5 list-none bg-gradient-to-l from-crimson-500 via-gold-400 to-turquoise-500 md:block" aria-hidden role="presentation" />
          {PROCESS.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.15} className="relative text-center">
              <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-navy-950 text-2xl font-black text-gold-300 shadow-lift ring-8 ring-white">
                {toFa(i + 1)}
              </span>
              <h3 className="mt-6 text-lg font-extrabold text-navy-950">{p.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{p.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function DormitoryHighlight() {
  const points = ["فرم آنلاین در کمتر از ۵ دقیقه", "آپلود امن پاسپورت، عکس و نامه پذیرش", "پیگیری لحظه‌ای وضعیت در پنل کاربری", "قرارداد رسمی قابل ارائه به اداره مهاجرت"];
  return (
    <section className="py-24" aria-labelledby="dorm-title">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative rounded-3xl bg-gradient-to-br from-gold-100 via-sand-100 to-turquoise-50 p-8 sm:p-10">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-navy-950">درخواست خوابگاه</p>
                <span className="rounded-full bg-turquoise-50 px-3 py-1 text-xs font-bold text-turquoise-600">در حال بررسی</span>
              </div>
              <ul className="mt-5 space-y-3">
                {["صفحه اول پاسپورت", "عکس پرسنلی", "نامه پذیرش دانشگاه"].map((d, i) => (
                  <li key={d} className="flex items-center justify-between rounded-xl border border-line bg-sand-50 px-4 py-3 text-sm">
                    <span className="flex items-center gap-2 font-semibold text-navy-900"><FileUp className="h-4 w-4 text-navy-400" />{d}</span>
                    {i < 2 ? <CheckCircle2 className="h-5 w-5 text-turquoise-500" /> : <span className="h-2 w-2 animate-pulse rounded-full bg-gold-400" />}
                  </li>
                ))}
              </ul>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-sand-200">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-l from-turquoise-400 to-turquoise-600" />
              </div>
            </div>
            <div className="card absolute -bottom-6 -left-4 flex items-center gap-3 p-4 animate-float sm:-left-8">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-crimson-500 text-white"><ShieldCheck className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-extrabold text-navy-950">مدارک شما امن است</p>
                <p className="text-xs text-muted">فقط کارشناسان پاشا دسترسی دارند</p>
              </div>
            </div>
          </div>
        </Reveal>
        <div className="order-1 lg:order-2">
          <SectionHeading
            id="dorm-title"
            center={false}
            eyebrow="خوابگاه دانشجویی"
            title="خوابگاهت را قبل از سفر، آنلاین رزرو کن"
            lead="در استانبول، آنکارا، ازمیر و سایر شهرها، خوابگاه‌های امن و نزدیک دانشگاه را برایتان پیدا می‌کنیم. کافی است درخواست ثبت کنید و مدارک را آپلود کنید."
          />
          <Stagger className="mt-8 space-y-3">
            {points.map((p) => (
              <StaggerItem key={p} className="flex items-center gap-3 font-semibold text-navy-900">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-turquoise-500" />
                {p}
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-3">
            <Link href="/dashboard/apply?type=DORMITORY" className="btn-primary">
              <Upload className="h-4 w-4" />
              ثبت درخواست و آپلود مدارک
            </Link>
            <Link href="/dormitory" className="btn-outline">اطلاعات بیشتر</Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-24 text-white" aria-labelledby="testimonials-title">
      <div className="bg-pattern absolute inset-0" aria-hidden />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow border-white/15 bg-white/5 text-gold-300">تجربه دانشجویان</span>
          <h2 id="testimonials-title" className="mt-4 text-3xl font-black sm:text-4xl">آن‌ها مسیرشان را با ما شروع کردند</h2>
        </Reveal>
        <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-gold-400/40 hover:bg-white/10">
                <Quote className="h-8 w-8 text-gold-400" />
                <blockquote className="mt-4 flex-1 text-sm leading-7 text-white/80">{t.text}</blockquote>
                <figcaption className="mt-6 border-t border-white/10 pt-4">
                  <p className="font-extrabold">{t.name}</p>
                  <p className="text-xs text-gold-300">{t.role}</p>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function AgentsBand() {
  return (
    <section className="py-24" aria-labelledby="agents-title">
      <div className="container-x">
        <Reveal className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold-300 via-gold-400 to-gold-500 p-10 sm:p-14">
          <div className="bg-pattern-dark absolute inset-0" aria-hidden />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-navy-950/10 px-3 py-1 text-xs font-bold text-navy-950">
                <Handshake className="h-4 w-4" /> همکاری با موسسات و مشاوران
              </span>
              <h2 id="agents-title" className="mt-4 text-3xl font-black text-navy-950 sm:text-4xl">نماینده (ساب‌ایجنت) پاشا آکادمی شوید</h2>
              <p className="mt-4 max-w-xl leading-8 text-navy-950/75">
                موسسات آموزشی و مشاوران تحصیلی می‌توانند از طریق پورتال اختصاصی نمایندگان، پرونده دانشجویان خود را ثبت،
                مدارک را آپلود و وضعیت هر پرونده را لحظه‌به‌لحظه پیگیری کنند.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/agents" className="btn-navy py-4">
                <Users className="h-4 w-4" />
                درخواست نمایندگی
              </Link>
              <Link href="/login" className="btn border border-navy-950/20 bg-white/40 py-4 text-navy-950 hover:bg-white/60">
                ورود به پورتال نمایندگان
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
