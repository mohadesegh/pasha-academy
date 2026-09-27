import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal } from "@/components/ui/motion";
import { ServiceIcon } from "@/components/ui/service-icon";
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld";
import { SERVICES } from "@/data/content";

export const metadata: Metadata = {
  title: "خدمات تحصیل در ترکیه",
  description:
    "خدمات پاشا آکادمی: اخذ پذیرش از دانشگاه‌های ترکیه، اقامت تحصیلی (ایکامت)، رزرو خوابگاه دانشجویی و استقبال و استقرار در ترکیه.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title="خدمات ما برای تحصیل در ترکیه"
        lead="یک همراه مطمئن برای تمام مراحل؛ از انتخاب دانشگاه تا استقرار کامل در شهر محل تحصیل."
        crumbs={[{ name: "خدمات", href: "/services" }]}
      />
      <section className="py-20">
        <div className="container-x space-y-8">
          {SERVICES.map((s, i) => (
            <Reveal key={s.slug} delay={0.05}>
              <article className="card grid gap-8 p-8 md:grid-cols-[auto_1fr_auto] md:items-center">
                <ServiceIcon icon={s.icon} accent={s.accent} className="h-16 w-16" />
                <div>
                  <h2 className="text-2xl font-black text-navy-950">{s.title}</h2>
                  <p className="mt-3 leading-8 text-muted">{s.short}</p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {s.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm font-semibold text-navy-900">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-turquoise-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={`/services/${s.slug}`} className={i === 0 ? "btn-primary" : "btn-outline"}>
                  جزئیات و ثبت درخواست
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <JsonLd data={breadcrumbLd([{ name: "خانه", path: "/" }, { name: "خدمات", path: "/services" }])} />
    </>
  );
}
