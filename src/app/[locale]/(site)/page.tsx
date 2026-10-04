import type { Metadata } from "next";
import { Clock, PhoneCall, ShieldCheck } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { TuitionCalculator } from "@/components/home/tuition-calculator";
import { ShowcaseSlider } from "@/components/home/showcase-slider";
import { AnnouncementsSlider } from "@/components/home/announcements";
import {
  FeaturedUniversities,
  FinalCta,
  GoldenScholarship,
  Heading,
  PartnerNetwork,
  PaymentPlans,
  PopularMajors,
  RoadmapSection,
  StatsSection,
  UniversityMarquee,
} from "@/components/home/landing";
import { whatsappLink } from "@/components/programs/program-list";
import { FaqList } from "@/components/home/faq";
import { LeadForm } from "@/components/forms/lead-form";
import { Reveal } from "@/components/ui/motion";
import { JsonLd, faqLd } from "@/components/seo/json-ld";
import { SITE } from "@/lib/constants";
import { getDict } from "@/lib/i18n/server";
import { calculatorPrograms, featuredUniversities, marqueeUniversities, scholarshipExample } from "@/lib/programs";

// Prerendered (one copy per language) and refreshed at most hourly; admin edits refresh it immediately
// via revalidateSite(). Without a database at build time the fallback catalogue is used.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, t } = await getDict(params);
  return {
    title: { absolute: locale === "fa" ? `${SITE.name} | تحصیل در ترکیه، بورسیه و پذیرش دانشگاه` : `${t.common.brand} | Study in Türkiye` },
    description: t.hero.lead,
    alternates: { canonical: "/" },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, t } = await getDict(params);
  const [marquee, calcPrograms, example, featured] = await Promise.all([
    marqueeUniversities(),
    calculatorPrograms(),
    scholarshipExample(),
    featuredUniversities(6),
  ]);
  const wa = whatsappLink(t.common.whatsappGeneral);
  const l = { locale, t };

  return (
    <>
      <Hero />
      <UniversityMarquee universities={marquee} {...l} />
      <AnnouncementsSlider />

      <section className="overflow-hidden py-20">
        <div className="container-x">
          <Heading kicker={t.showcase.eyebrow} title={t.showcase.title} />
          <ShowcaseSlider />
        </div>
      </section>

      <section className="py-20">
        <div className="container-x">
          <Reveal>
            <TuitionCalculator universities={marquee} programs={calcPrograms} />
          </Reveal>
        </div>
      </section>

      <StatsSection {...l} />
      <RoadmapSection {...l} whatsapp={wa} />
      <GoldenScholarship {...l} example={example} whatsapp={wa} />
      <FeaturedUniversities {...l} universities={featured} />
      <PopularMajors {...l} />
      <PartnerNetwork {...l} />
      <PaymentPlans {...l} example={example} />

      <section className="py-20" aria-labelledby="faq-title">
        <div className="container-x max-w-4xl">
          <Heading kicker={t.faq.eyebrow} title={t.faq.title} />
          <Reveal delay={0.1}>
            <FaqList items={t.faq.items} />
          </Reveal>
        </div>
      </section>

      {locale === "fa" ? (
        <section id="consult" className="pb-24 pt-10" aria-labelledby="consult-title">
          <div className="container-x">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-navy-950 p-6 sm:p-12">
              <div className="bg-pattern absolute inset-0 opacity-60" aria-hidden />
              <div className="relative grid items-center gap-12 lg:grid-cols-2">
                <Reveal className="text-white">
                  <span className="eyebrow border-white/15 bg-white/5 text-gold-300">مشاوره رایگان</span>
                  <h2 id="consult-title" className="mt-4 text-3xl font-black leading-tight sm:text-4xl">همین امروز اولین قدم را بردارید</h2>
                  <p className="mt-5 max-w-lg leading-8 text-white/70">
                    فرم را پر کنید تا مشاوران پاشا آکادمی با بررسی شرایط شما، بهترین دانشگاه‌ها و بورسیه متناسب با بودجه‌تان را معرفی کنند.
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
            </div>
          </div>
        </section>
      ) : (
        <FinalCta {...l} whatsapp={wa} />
      )}

      <JsonLd data={faqLd(t.faq.items)} />
    </>
  );
}
