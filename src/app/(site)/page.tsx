import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import {
  AgentsBand,
  DormitoryHighlight,
  ProcessSection,
  SectionHeading,
  ServicesSection,
  StatsBand,
  TestimonialsSection,
  UniversitiesSection,
} from "@/components/home/sections";
import { FaqList } from "@/components/home/faq";
import { LeadForm } from "@/components/forms/lead-form";
import { Reveal } from "@/components/ui/motion";
import { JsonLd, faqLd } from "@/components/seo/json-ld";
import { getPublishedUniversities } from "@/lib/universities";
import { FAQ } from "@/data/content";
import { SITE } from "@/lib/constants";
import { Clock, PhoneCall, ShieldCheck } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} | ادامه تحصیل در ترکیه، اقامت تحصیلی و خوابگاه دانشجویی` },
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const universities = await getPublishedUniversities();
  const featured = universities.filter((u) => u.featured).slice(0, 6);

  return (
    <>
      <Hero />
      <ServicesSection />
      <StatsBand />
      <UniversitiesSection featured={featured.length ? featured : universities.slice(0, 6)} all={universities} />
      <ProcessSection />
      <DormitoryHighlight />
      <TestimonialsSection />
      <AgentsBand />

      <section className="pb-24" aria-labelledby="faq-title">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionHeading
              id="faq-title"
              center={false}
              eyebrow="سوالات متداول"
              title="پاسخ سوالات رایج درباره تحصیل در ترکیه"
              lead="سوال دیگری دارید؟ مشاوران ما در واتساپ پاسخگوی شما هستند."
            />
          </div>
          <Reveal delay={0.1}>
            <FaqList items={FAQ} />
          </Reveal>
        </div>
      </section>

      <section id="consult" className="relative overflow-hidden bg-navy-950 py-24" aria-labelledby="consult-title">
        <div className="bg-pattern absolute inset-0" aria-hidden />
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-crimson-500/20 blur-3xl" aria-hidden />
        <div className="container-x relative grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="text-white">
            <span className="eyebrow border-white/15 bg-white/5 text-gold-300">مشاوره رایگان</span>
            <h2 id="consult-title" className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              همین امروز اولین قدم را بردارید
            </h2>
            <p className="mt-5 max-w-lg leading-8 text-white/70">
              فرم را پر کنید تا مشاوران پاشا آکادمی با بررسی شرایط شما، بهترین دانشگاه‌ها و مسیر پیشنهادی را معرفی کنند.
            </p>
            <ul className="mt-8 space-y-4 text-white/80">
              <li className="flex items-center gap-3"><Clock className="h-5 w-5 text-gold-400" />پاسخگویی در کمتر از ۲۴ ساعت</li>
              <li className="flex items-center gap-3"><PhoneCall className="h-5 w-5 text-gold-400" />جلسه مشاوره تلفنی یا آنلاین رایگان</li>
              <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-gold-400" />اطلاعات شما محرمانه باقی می‌ماند</li>
            </ul>
          </Reveal>
          <Reveal delay={0.15} className="card p-6 sm:p-8">
            <LeadForm compact />
          </Reveal>
        </div>
      </section>

      <JsonLd data={faqLd(FAQ)} />
    </>
  );
}
