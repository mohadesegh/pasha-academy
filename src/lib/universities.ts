import "server-only";
import { cache } from "react";
import { db } from "./db";

/**
 * Runs a read for a public page and returns `fallback` if the database is unreachable
 * (e.g. DATABASE_URL not configured yet), so marketing pages still render instead of 500ing.
 */
export async function safeRead<T>(read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch (err) {
    console.error("[db] public read failed:", err);
    return fallback;
  }
}

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
  safeRead(
    () =>
      db.university.findMany({
        where: { published: true },
        select: cardSelect,
        orderBy: [{ featured: "desc" }, { name: "asc" }],
      }),
    [],
  ),
);

export const getUniversityBySlug = cache((slug: string) =>
  safeRead(() => db.university.findFirst({ where: { slug, published: true } }), null),
);
