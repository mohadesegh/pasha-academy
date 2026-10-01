import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { BarChart3, FolderUp, Headset, LayoutDashboard, Percent, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { SectionHeading } from "@/components/home/sections";
import { AuthForm } from "@/components/forms/auth-form";
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "همکاری و نمایندگی (ساب‌ایجنت)",
  description:
    "موسسات آموزشی و مشاوران تحصیلی می‌توانند نماینده پاشا آکادمی شوند و از طریق پورتال نمایندگان، پرونده دانشجویان خود را برای تحصیل، اقامت و خوابگاه در ترکیه ثبت و پیگیری کنند.",
  alternates: { canonical: "/agents" },
};

const BENEFITS = [
  { icon: LayoutDashboard, title: "پورتال اختصاصی", text: "داشبورد جداگانه برای مدیریت همه دانشجویان و پرونده‌ها." },
  { icon: FolderUp, title: "آپلود مدارک آنلاین", text: "ثبت پرونده و بارگذاری مدارک دانشجو در چند دقیقه." },
  { icon: BarChart3, title: "پیگیری لحظه‌ای", text: "وضعیت هر پرونده و نتیجه بررسی هر مدرک را ببینید." },
  { icon: Percent, title: "کمیسیون رقابتی", text: "پرداخت شفاف کمیسیون برای هر ثبت‌نام موفق." },
  { icon: Headset, title: "پشتیبانی اختصاصی", text: "کارشناس مشخص برای پاسخگویی به نمایندگان." },
  { icon: ShieldCheck, title: "اعتبار و شفافیت", text: "همکاری مستقیم با دانشگاه‌ها و خوابگاه‌های ترکیه." },
];

export default function AgentsPage() {
  return (
    <>
      <PageHero
        title="نماینده پاشا آکادمی شوید"
        lead="برای موسسات اعزام دانشجو، مشاوران تحصیلی و آموزشگاه‌های زبان — پرونده دانشجویان خود را از طریق پورتال نمایندگان ثبت و پیگیری کنید."
        crumbs={[{ name: "همکاری با ما", href: "/agents" }]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#join" className="btn-primary">ثبت درخواست نمایندگی</Link>
          <Link href="/login?as=agent" className="btn-outline">ورود نمایندگان</Link>
        </div>
      </PageHero>

      <section className="py-24">
        <div className="container-x">
          <SectionHeading eyebrow="مزایای همکاری" title="هر آنچه یک نماینده نیاز دارد" />
          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <StaggerItem key={b.title} className="card p-7 transition hover:-translate-y-1 hover:shadow-lift">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-950 text-gold-300"><b.icon className="h-6 w-6" /></span>
                <h3 className="mt-5 text-lg font-extrabold text-navy-950">{b.title}</h3>
                <p className="mt-2 leading-7 text-muted">{b.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="join" className="bg-white py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <Reveal>
            <span className="eyebrow">فرم نمایندگی</span>
            <h2 className="section-title mt-4">درخواست همکاری</h2>
            <p className="section-lead">
              پس از ثبت فرم، حساب شما ایجاد می‌شود و پس از بررسی و تایید توسط تیم پاشا آکادمی، دسترسی کامل به پورتال
              نمایندگان برایتان فعال خواهد شد.
            </p>
            <ol className="mt-8 space-y-4 text-navy-900">
              {["تکمیل فرم و ایجاد حساب", "بررسی و تماس کارشناس همکاری", "فعال‌سازی پورتال و شروع ثبت پرونده"].map((s, i) => (
                <li key={s} className="flex items-center gap-3 font-semibold">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gold-100 text-sm font-black text-gold-600">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.1} className="card p-6 sm:p-8">
            <Suspense>
              <AuthForm mode="agent" />
            </Suspense>
          </Reveal>
        </div>
      </section>
      <JsonLd data={breadcrumbLd([{ name: "خانه", path: "/" }, { name: "همکاری با ما", path: "/agents" }])} />
    </>
  );
}
