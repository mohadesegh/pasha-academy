import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileText, Upload } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { ServiceIcon } from "@/components/ui/service-icon";
import { FaqList } from "@/components/home/faq";
import { LeadForm } from "@/components/forms/lead-form";
import { JsonLd, breadcrumbLd, faqLd } from "@/components/seo/json-ld";
import { SERVICES } from "@/data/content";
import { SITE } from "@/lib/constants";
import { siteUrl, toFa } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return {};
  return {
    title: s.title,
    description: s.short,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { title: s.title, description: s.short, url: `/services/${s.slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) notFound();
  const others = SERVICES.filter((x) => x.slug !== s.slug);

  return (
    <>
      <PageHero
        title={s.title}
        lead={s.short}
        crumbs={[{ name: "خدمات", href: "/services" }, { name: s.title, href: `/services/${s.slug}` }]}
      >
        <div className="btn-group mt-8">
          {s.applyType && (
            <Link href={`/dashboard/apply?type=${s.applyType}`} className="btn-primary">
              <Upload className="h-4 w-4" />
              ثبت درخواست آنلاین
            </Link>
          )}
          <Link href="#consult" className="btn-outline">مشاوره رایگان</Link>
        </div>
      </PageHero>

      <section className="py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <Reveal className="prose-fa">
              <p className="text-lg">{s.intro}</p>
            </Reveal>

            <Reveal>
              <h2 className="mt-12 text-2xl font-black text-navy-950">چه کارهایی برای شما انجام می‌دهیم؟</h2>
            </Reveal>
            <Stagger className="mt-6 grid gap-4 sm:grid-cols-2">
              {s.features.map((f) => (
                <StaggerItem key={f} className="card flex items-start gap-3 p-5">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-turquoise-500" />
                  <span className="font-semibold text-navy-900">{f}</span>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal>
              <h2 className="mt-14 text-2xl font-black text-navy-950">مراحل انجام کار</h2>
            </Reveal>
            <ol className="relative mt-8 space-y-8 border-r-2 border-dashed border-gold-300 pr-8">
              {s.steps.map((st, i) => (
                <Reveal as="li" key={st.title} delay={i * 0.1} className="relative">
                  <span className="absolute -right-[3.1rem] grid h-10 w-10 place-items-center rounded-full bg-navy-950 font-black text-gold-300 ring-4 ring-sand-50">
                    {toFa(i + 1)}
                  </span>
                  <h3 className="text-lg font-extrabold text-navy-950">{st.title}</h3>
                  <p className="mt-1 leading-8 text-muted">{st.text}</p>
                </Reveal>
              ))}
            </ol>

            <Reveal>
              <h2 className="mt-14 text-2xl font-black text-navy-950">سوالات متداول</h2>
            </Reveal>
            <div className="mt-6"><FaqList items={s.faq} /></div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <Reveal className="card p-6">
              <h2 className="flex items-center gap-2 font-extrabold text-navy-950">
                <FileText className="h-5 w-5 text-crimson-500" />
                مدارک مورد نیاز
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm text-navy-900">
                {s.documents.map((d) => (
                  <li key={d} className="flex items-start gap-2 leading-6">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                    {d}
                  </li>
                ))}
              </ul>
              {s.documentsNote && (
                <p className="mt-4 rounded-xl bg-gold-50 p-3 text-xs font-semibold leading-6 text-gold-600">{s.documentsNote}</p>
              )}
              {s.applyType && (
                <Link href={`/dashboard/apply?type=${s.applyType}`} className="btn-primary mt-6 w-full">
                  آپلود مدارک و ثبت درخواست
                </Link>
              )}
            </Reveal>
            <Reveal className="card p-6">
              <h2 className="font-extrabold text-navy-950">سایر خدمات</h2>
              <ul className="mt-4 space-y-3">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/services/${o.slug}`} className="group flex items-center gap-3">
                      <ServiceIcon icon={o.icon} accent={o.accent} className="h-10 w-10 rounded-xl ring-4 [&_svg]:h-5 [&_svg]:w-5" />
                      <span className="flex-1 text-sm font-bold text-navy-900 group-hover:text-crimson-500">{o.title}</span>
                      <ArrowLeft className="h-4 w-4 text-navy-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </aside>
        </div>
      </section>

      <section id="consult" className="bg-white py-20">
        <div className="container-x max-w-3xl">
          <Reveal className="text-center">
            <h2 className="section-title">مشاوره رایگان برای {s.title}</h2>
            <p className="section-lead">اطلاعات تماس خود را بگذارید تا کارشناسان ما با شما تماس بگیرند.</p>
          </Reveal>
          <Reveal delay={0.1} className="card mt-10 p-6 sm:p-8">
            <LeadForm />
          </Reveal>
        </div>
      </section>

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: s.title,
            description: s.intro,
            serviceType: s.title,
            areaServed: { "@type": "Country", name: "Turkey" },
            provider: { "@type": "EducationalOrganization", name: SITE.name, url: siteUrl("/") },
            url: siteUrl(`/services/${s.slug}`),
          },
          faqLd(s.faq),
          breadcrumbLd([
            { name: "خانه", path: "/" },
            { name: "خدمات", path: "/services" },
            { name: s.title, path: `/services/${s.slug}` },
          ]),
        ]}
      />
    </>
  );
}
