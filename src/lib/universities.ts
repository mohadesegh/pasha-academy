import "server-only";
import { cache } from "react";
import { db } from "./db";

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  nameEn: true,
  city: true,
  type: true,
  tuitionFrom: true,
  languages: true,
  summary: true,
  color: true,
  featured: true,
} as const;

export const getPublishedUniversities = cache(() =>
  db.university.findMany({
    where: { published: true },
    select: cardSelect,
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  }),
);

export const getUniversityBySlug = cache((slug: string) =>
  db.university.findFirst({ where: { slug, published: true } }),
);
