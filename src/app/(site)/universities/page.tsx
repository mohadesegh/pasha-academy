import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { UniversityExplorer } from "@/components/university/university-explorer";
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "معرفی دانشگاه‌های ترکیه",
  description:
    "لیست کامل دانشگاه‌های دولتی و خصوصی ترکیه در استانبول، آنکارا و ازمیر همراه با رشته‌ها، زبان تدریس، شهریه تقریبی و شرایط پذیرش دانشجویان ایرانی.",
  alternates: { canonical: "/universities" },
};

export default async function UniversitiesPage() {
  const universities = await db.university.findMany({
    where: { published: true },
    select: { slug: true, name: true, nameEn: true, city: true, type: true, tuitionFrom: true, languages: true, summary: true, color: true, programs: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHero
        title="دانشگاه‌های ترکیه"
        lead="دانشگاه مناسب خود را بر اساس شهر، نوع دانشگاه و رشته پیدا کنید. شهریه‌ها تقریبی و مربوط به دانشجویان بین‌المللی است."
        crumbs={[{ name: "دانشگاه‌ها", href: "/universities" }]}
      />
      <section className="pb-24 pt-4">
        <div className="container-x">
          <Suspense>
            <UniversityExplorer universities={universities} />
          </Suspense>
        </div>
      </section>
      <JsonLd
        data={[
          breadcrumbLd([{ name: "خانه", path: "/" }, { name: "دانشگاه‌ها", path: "/universities" }]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "دانشگاه‌های ترکیه",
            itemListElement: universities.map((u, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: siteUrl(`/universities/${u.slug}`),
              name: u.name,
            })),
          },
        ]}
      />
    </>
  );
}
