import type { Metadata } from "next";
import Link from "next/link";
import { BedDouble, Bus, Camera, FileCheck2, FileUp, ShieldCheck, Upload, Utensils, Wifi, WashingMachine } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHeading } from "@/components/home/sections";
import { FaqList } from "@/components/home/faq";
import { JsonLd, breadcrumbLd, faqLd } from "@/components/seo/json-ld";
import { DOC_KINDS, REQUIRED_DOCS, TURKEY_CITIES } from "@/lib/constants";
import { SERVICES } from "@/data/content";
import { toFa } from "@/lib/utils";

export const metadata: Metadata = {
  title: "خوابگاه دانشجویی در ترکیه — رزرو آنلاین",
  description:
    "رزرو آنلاین خوابگاه دانشجویی در استانبول، آنکارا، ازمیر و سایر شهرهای ترکیه. ثبت درخواست، آپلود مدارک و پیگیری وضعیت در پنل کاربری پاشا آکادمی.",
  alternates: { canonical: "/dormitory" },
};

const TYPES = [
  { title: "خوابگاه خصوصی", text: "خوابگاه‌های خواهران و برادران با امنیت ۲۴ ساعته، غذا و سرویس رفت‌وآمد.", price: "از ۲۵۰$ ماهانه" },
  { title: "رزیدنس دانشجویی", text: "اتاق‌های مدرن با حمام اختصاصی، فضای مطالعه و باشگاه ورزشی.", price: "از ۴۵۰$ ماهانه" },
  { title: "آپارتمان اشتراکی", text: "آپارتمان مبله نزدیک دانشگاه به صورت اشتراکی با دانشجویان دیگر.", price: "از ۳۰۰$ ماهانه" },
];

const AMENITIES = [
  { icon: ShieldCheck, label: "امنیت ۲۴ ساعته" },
  { icon: Wifi, label: "اینترنت پرسرعت" },
  { icon: Utensils, label: "صبحانه و شام" },
  { icon: WashingMachine, label: "لباسشویی" },
  { icon: Bus, label: "نزدیک مترو و دانشگاه" },
  { icon: Camera, label: "دوربین مداربسته" },
];

const service = SERVICES.find((s) => s.slug === "student-dormitory")!;

export default function DormitoryPage() {
  const required = REQUIRED_DOCS.DORMITORY;
  return (
    <>
      <PageHero
        title="خوابگاه دانشجویی در ترکیه"
        lead="قبل از سفر، محل اقامت امن و نزدیک به دانشگاه خود را قطعی کنید. درخواست را آنلاین ثبت کنید و مدارک را همین‌جا آپلود کنید."
        crumbs={[{ name: "خوابگاه", href: "/dormitory" }]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard/apply?type=DORMITORY" className="btn-primary px-8 py-4 text-base">
            <Upload className="h-5 w-5" />
            ثبت درخواست و آپلود مدارک
          </Link>
          <Link href="/login" className="btn-outline px-8 py-4 text-base">پیگیری درخواست</Link>
        </div>
      </PageHero>

      <section className="py-24">
        <div className="container-x">
          <SectionHeading eyebrow="انواع اسکان" title="گزینه‌ای مناسب هر بودجه" lead="قیمت‌ها تقریبی است و به شهر، منطقه و نوع اتاق بستگی دارد." />
          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {TYPES.map((t, i) => (
              <StaggerItem key={t.title} className="card group relative overflow-hidden p-7 transition hover:-translate-y-1 hover:shadow-lift">
                <span className="absolute -left-6 -top-6 text-8xl font-black text-sand-200 transition group-hover:text-gold-100">{toFa(i + 1)}</span>
                <BedDouble className="relative h-9 w-9 text-gold-500" />
                <h3 className="relative mt-5 text-xl font-extrabold text-navy-950">{t.title}</h3>
                <p className="relative mt-3 leading-7 text-muted">{t.text}</p>
                <p className="relative mt-6 inline-block rounded-full bg-navy-950 px-4 py-1.5 text-sm font-bold text-gold-300">{t.price}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-14 flex flex-wrap justify-center gap-3">
            {AMENITIES.map((a) => (
              <span key={a.label} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-bold text-navy-900 shadow-soft">
                <a.icon className="h-4 w-4 text-turquoise-500" />
                {a.label}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy-950 py-24 text-white">
        <div className="bg-pattern absolute inset-0" aria-hidden />
        <div className="container-x relative grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="eyebrow border-white/15 bg-white/5 text-gold-300">آپلود مدارک</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">مدارک لازم برای درخواست خوابگاه</h2>
            <p className="mt-5 leading-8 text-white/70">
              فایل‌ها را به صورت PDF یا عکس (JPG / PNG) و حداکثر ۵ مگابایت آپلود کنید. مدارک شما به صورت امن ذخیره می‌شود و فقط
              کارشناسان پاشا آکادمی به آن دسترسی دارند. نتیجه بررسی هر مدرک را در پنل خود می‌بینید.
            </p>
            <Link href="/dashboard/apply?type=DORMITORY" className="btn-gold mt-8">
              <FileUp className="h-4 w-4" />
              شروع آپلود مدارک
            </Link>
          </Reveal>
          <Stagger className="space-y-3">
            {required.map((k) => (
              <StaggerItem key={k} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-400 text-navy-950"><FileCheck2 className="h-5 w-5" /></span>
                <div>
                  <p className="font-extrabold">{DOC_KINDS[k]}</p>
                  <p className="text-xs text-white/60">الزامی — PDF، JPG یا PNG</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="py-24">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading center={false} eyebrow="شهرها" title="در کدام شهرها خوابگاه داریم؟" />
            <Reveal className="mt-8 flex flex-wrap gap-3">
              {TURKEY_CITIES.map((c) => (
                <span key={c} className="rounded-2xl bg-white px-5 py-3 font-bold text-navy-900 shadow-soft ring-1 ring-line">{c}</span>
              ))}
            </Reveal>
          </div>
          <div>
            <SectionHeading center={false} eyebrow="سوالات متداول" title="سوالات رایج درباره خوابگاه" />
            <div className="mt-8"><FaqList items={service.faq} /></div>
          </div>
        </div>
      </section>

      <JsonLd data={[faqLd(service.faq), breadcrumbLd([{ name: "خانه", path: "/" }, { name: "خوابگاه", path: "/dormitory" }])]} />
    </>
  );
}
