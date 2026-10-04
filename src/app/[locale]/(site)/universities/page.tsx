import type { Metadata } from "next";
import { Suspense } from "react";
import { FileDown } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { UniversityExplorer } from "@/components/university/university-explorer";
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld";
import { db } from "@/lib/db";
import { safeRead } from "@/lib/universities";
import { siteUrl } from "@/lib/utils";
import { SEED_UNIVERSITIES } from "@/data/universities";
import { logoFor } from "@/lib/university-logos";

// Prerendered (one copy per language) and refreshed at most hourly; admin edits refresh it immediately
// via revalidateSite(). Without a database at build time the fallback catalogue is used.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "معرفی دانشگاه‌های ترکیه",
  description:
    "لیست دانشگاه‌های خصوصی ترکیه در استانبول، آنکارا و ازمیر همراه با رشته‌ها، زبان تدریس، شهریه تقریبی و شرایط پذیرش دانشجویان ایرانی.",
  alternates: { canonical: "/universities" },
};

export default async function UniversitiesPage() {
  const rows = await safeRead(
    () =>
      db.university.findMany({
        where: { published: true },
        select: { slug: true, name: true, nameEn: true, city: true, type: true, tuitionFrom: true, languages: true, summary: true, color: true, logo: true, programs: true },
        orderBy: [{ featured: "desc" }, { name: "asc" }],
      }),
    [],
  );
  // Fall back to the base catalogue when the DB is unavailable or empty, so the list is never blank.
  const universities = (rows.length > 0 ? rows : SEED_UNIVERSITIES).map((u) => ({ ...u, logo: logoFor(u) }));

  return (
    <>
      <PageHero
        title="دانشگاه‌های ترکیه"
        lead="دانشگاه مناسب خود را بر اساس شهر، نوع دانشگاه و رشته پیدا کنید. شهریه‌ها تقریبی و مربوط به دانشجویان بین‌المللی است."
        crumbs={[{ name: "دانشگاه‌ها", href: "/universities" }]}
      >
        <a href="/export/universities?print=1" target="_blank" rel="noopener" className="btn-outline mt-6 inline-flex">
          <FileDown className="h-4 w-4" />
          دریافت PDF لیست دانشگاه‌ها
        </a>
      </PageHero>
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
