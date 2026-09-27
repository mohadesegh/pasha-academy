import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { safeRead } from "@/lib/universities";
import { SERVICES } from "@/data/content";
import { siteUrl } from "@/lib/utils";

// Rendered per request so the build never needs a database connection.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/universities"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: siteUrl("/dormitory"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: siteUrl("/agents"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/about"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: siteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: siteUrl("/register"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const services = SERVICES.map((s) => ({
    url: siteUrl(`/services/${s.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const universities = await safeRead(
    () => db.university.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    [],
  );

  return [
    ...staticPages,
    ...services,
    ...universities.map((u) => ({
      url: siteUrl(`/universities/${u.slug}`),
      lastModified: u.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
