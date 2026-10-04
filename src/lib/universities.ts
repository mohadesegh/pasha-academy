import "server-only";
import { cache } from "react";
import { Prisma, type University } from "@prisma/client";
import { db } from "./db";
import { SEED_UNIVERSITIES } from "@/data/universities";
import { logoFor } from "./university-logos";

// Circuit breaker: when the database can't be reached, every query would otherwise wait for the
// connection timeout (~4s each, several per page). After one such failure public reads skip the
// database for a short while and use their fallback immediately, then try again.
const SKIP_DB_FOR_MS = 30_000;
// Kept on globalThis so every route bundle in the process shares it (dev mode loads modules per route).
const breaker = globalThis as unknown as { __dbDownUntil?: number };
const downUntil = () => breaker.__dbDownUntil ?? 0;

const isConnectionError = (err: unknown) =>
  err instanceof Prisma.PrismaClientInitializationError ||
  (err instanceof Prisma.PrismaClientKnownRequestError && ["P1001", "P1002", "P1017"].includes(err.code));

/**
 * Runs a read for a public page and returns `fallback` if the database is unreachable
 * (e.g. DATABASE_URL not configured yet), so marketing pages still render instead of 500ing.
 */
export async function safeRead<T>(read: () => Promise<T>, fallback: T): Promise<T> {
  if (Date.now() < downUntil()) return fallback;
  try {
    return await read();
  } catch (err) {
    if (isConnectionError(err)) {
      if (Date.now() >= downUntil()) console.error(`[db] database unreachable, using fallback data for ${SKIP_DB_FOR_MS / 1000}s:`, (err as Error).message.split("\n").filter(Boolean).pop());
      breaker.__dbDownUntil = Date.now() + SKIP_DB_FOR_MS;
    } else {
      console.error("[db] public read failed:", err);
    }
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

/** A base-catalogue university in the database's shape, for when the database can't be reached. */
export function fallbackUniversity(slug: string): University | null {
  const u = SEED_UNIVERSITIES.find((x) => x.slug === slug);
  if (!u) return null;
  return {
    ...u,
    id: u.slug,
    students: u.students ?? null,
    logo: logoFor(u),
    published: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
}

/** A missing university is a 404; an unreachable database falls back to the base catalogue. */
const UNREACHABLE = Symbol("db-unreachable");
export const getUniversityBySlug = cache(async (slug: string) => {
  const u = await safeRead<University | null | typeof UNREACHABLE>(() => db.university.findFirst({ where: { slug, published: true } }), UNREACHABLE);
  return u === UNREACHABLE ? fallbackUniversity(slug) : u;
});
