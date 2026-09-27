import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, Building, CalendarDays, ExternalLink, GraduationCap, Languages, MapPin, Users, Wallet } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { UniMonogram, UniversityCard } from "@/components/university/university-card";
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld";
import { db } from "@/lib/db";
import { getUniversityBySlug } from "@/lib/universities";
import { formatNumber, siteUrl, splitList, toFa } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  const unis = await db.university.findMany({ where: { published: true }, select: { slug: true } });
  return unis.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const u = await getUniversityBySlug((await params).slug);
  if (!u) return { title: "دانشگاه یافت نشد" };
  const title = `${u.name} (${u.nameEn}) — شرایط پذیرش و شهریه`;
  return {
    title,
    description: `${u.summary} اطلاعات رشته‌ها، شهریه، زبان تدریس و شرایط پذیرش ${u.name} در ${u.city}.`,
    alternates: { canonical: `/universities/${u.slug}` },
    openGraph: { title, description: u.summary, url: `/universities/${u.slug}` },
  };
}

export default async function UniversityPage({ params }: Props) {
  const u = await getUniversityBySlug((await params).slug);
  if (!u) notFound();

  const related = await db.university.findMany({
    where: { published: true, city: u.city, NOT: { id: u.id } },
    take: 3,
    orderBy: { featured: "desc" },
  });

  const facts = [
    { icon: MapPin, label: "شهر", value: u.city },
    { icon: Building, label: "نوع دانشگاه", value: u.type === "PUBLIC" ? "دولتی" : "خصوصی (وقفی)" },
    u.founded && { icon: CalendarDays, label: "سال تاسیس", value: toFa(u.founded) },
    u.students && { icon: Users, label: "تعداد دانشجو", value: `حدود ${formatNumber(u.students)}` },
    { icon: Languages, label: "زبان تدریس", value: splitList(u.languages).join("، ") },
    { icon: Wallet, label: "شهریه سالانه از", value: u.tuitionFrom ? `${formatNumber(u.tuitionFrom)} دلار` : "استعلام" },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string }[];

  const path = `/universities/${u.slug}`;

  return (
    <>
      <PageHero
        title={u.name}
        lead={u.summary}
        crumbs={[{ name: "دانشگاه‌ها", href: "/universities" }, { name: u.name, href: path }]}
      >
        <div className="mt-6 flex items-center gap-4">
          <UniMonogram name={u.nameEn} color={u.color} className="h-16 w-16 text-xl ring-4 ring-white/10" />
          <p className="font-bold text-white/60" dir="ltr">{u.nameEn}</p>
        </div>
      </PageHero>

      <section className="py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {facts.map((f) => (
                <StaggerItem key={f.label} className="card p-5">
                  <f.icon className="h-5 w-5 text-crimson-500" />
                  <p className="mt-3 text-xs text-muted">{f.label}</p>
                  <p className="mt-1 font-extrabold text-navy-950">{f.value}</p>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal className="prose-fa mt-12">
              <h2>درباره {u.name}</h2>
              {u.description.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
            </Reveal>

            <Reveal className="mt-10">
              <h2 className="text-xl font-extrabold text-navy-950">رشته‌ها و دانشکده‌های شاخص</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {splitList(u.programs).map((p) => (
                  <li key={p} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy-900">
                    <GraduationCap className="h-4 w-4 text-turquoise-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="mt-10 rounded-2xl border border-gold-200 bg-gold-50 p-5 text-sm leading-7 text-gold-600">
              شهریه‌ها تقریبی و مربوط به دانشجویان بین‌المللی است و ممکن است بسته به رشته، زبان تدریس و بورسیه متفاوت باشد.
              برای استعلام دقیق و به‌روز با مشاوران پاشا آکادمی تماس بگیرید.
            </Reveal>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <Reveal className="card overflow-hidden">
              <div className="h-2" style={{ background: u.color }} />
              <div className="p-6">
                <h2 className="font-extrabold text-navy-950">می‌خواهید در {u.name} درس بخوانید؟</h2>
                <p className="mt-2 text-sm leading-7 text-muted">درخواست پذیرش خود را آنلاین ثبت کنید و مدارک را آپلود کنید.</p>
                <Link href={`/dashboard/apply?type=ADMISSION&university=${u.id}`} className="btn-primary mt-5 w-full">
                  <GraduationCap className="h-4 w-4" />
                  درخواست پذیرش
                </Link>
                <Link href={`/dashboard/apply?type=DORMITORY&university=${u.id}`} className="btn-outline mt-3 w-full">
                  <BedDouble className="h-4 w-4" />
                  درخواست خوابگاه نزدیک دانشگاه
                </Link>
                {u.website && (
                  <a href={u.website} target="_blank" rel="noopener noreferrer nofollow" className="mt-5 flex items-center justify-center gap-1.5 text-sm font-bold text-turquoise-600 hover:underline">
                    وب‌سایت رسمی دانشگاه
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-white py-20">
          <div className="container-x">
            <h2 className="section-title">سایر دانشگاه‌های {u.city}</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <UniversityCard key={r.slug} u={r} />)}
            </div>
          </div>
        </section>
      )}

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollegeOrUniversity",
            name: u.name,
            alternateName: u.nameEn,
            description: u.summary,
            url: siteUrl(path),
            sameAs: u.website ? [u.website] : undefined,
            foundingDate: u.founded ? String(u.founded) : undefined,
            address: { "@type": "PostalAddress", addressLocality: u.city, addressCountry: "TR" },
          },
          breadcrumbLd([
            { name: "خانه", path: "/" },
            { name: "دانشگاه‌ها", path: "/universities" },
            { name: u.name, path },
          ]),
        ]}
      />
    </>
  );
}
