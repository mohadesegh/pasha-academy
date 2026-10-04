import "server-only";
import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { db } from "./db";
import { safeRead } from "./universities";
import { PROGRAM_DEGREE_KEYS, PROGRAM_LANGUAGE_KEYS } from "./constants";
import { logoFor } from "./university-logos";
import { SEED_UNIVERSITIES, samplePrograms } from "@/data/universities";

export const PAGE_SIZE = 25;

/** Cache tag for everything derived from universities/programs; admin edits call revalidateSite() to flush it. */
export const CATALOG_TAG = "catalog";

/**
 * Cached database read for pages that render per request (filters in the query string).
 * The key must describe every input. A failed read throws out of the cache, so a database
 * outage is never cached: safeRead() falls back for that one request only.
 */
function cachedRead<T>(key: unknown[], read: () => Promise<T>) {
  return unstable_cache(read, key.map((k) => JSON.stringify(k ?? null)), { revalidate: 3600, tags: [CATALOG_TAG] })();
}

/** Total cost of a degree paid term by term, including one preparatory language year. */
export function termlyTotal(p: { tuition: number; durationYears: number; prepFee: number | null }) {
  return p.tuition * p.durationYears + (p.prepFee ?? 0);
}

export type ProgramFilters = {
  q?: string;
  city?: string;
  university?: string;
  degree?: string;
  faculty?: string;
  language?: string;
  min?: string;
  max?: string;
  scholarship?: string;
  sort?: string;
  page?: string;
};

export function buildProgramWhere(f: ProgramFilters): Prisma.ProgramWhereInput {
  const where: Prisma.ProgramWhereInput = { active: true, university: { published: true } };
  if (f.city) where.university = { published: true, city: f.city };
  if (f.university) where.universityId = f.university;
  if (f.degree && (PROGRAM_DEGREE_KEYS as string[]).includes(f.degree)) where.degree = f.degree;
  if (f.language && (PROGRAM_LANGUAGE_KEYS as string[]).includes(f.language)) where.language = f.language;
  if (f.faculty) where.faculty = f.faculty;
  const min = Number(f.min);
  const max = Number(f.max);
  if (f.min && Number.isFinite(min)) where.tuition = { ...(where.tuition as object), gte: min };
  if (f.max && Number.isFinite(max) && max > 0) where.tuition = { ...(where.tuition as object), lte: max };
  if (f.scholarship === "1") where.scholarshipPrice = { not: null };
  const q = f.q?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
      { faculty: { contains: q, mode: "insensitive" } },
      { university: { name: { contains: q, mode: "insensitive" } } },
      { university: { nameEn: { contains: q, mode: "insensitive" } } },
    ];
  }
  return where;
}

const programSelect = {
  id: true,
  name: true,
  nameEn: true,
  faculty: true,
  degree: true,
  language: true,
  durationYears: true,
  tuition: true,
  cashTotal: true,
  deposit: true,
  prepFee: true,
  scholarshipPrice: true,
  sample: true,
  university: { select: { id: true, slug: true, name: true, nameEn: true, city: true, color: true, website: true } },
} as const;

export type ProgramRow = Prisma.ProgramGetPayload<{ select: typeof programSelect }>;

/**
 * The sample catalogue in the database's row shape, for when the database is unreachable or has no
 * programs yet — the same fallback the calculator uses, so the list is never empty. University ids are slugs.
 */
const sampleRows = (): ProgramRow[] =>
  SEED_UNIVERSITIES.flatMap((u) =>
    samplePrograms(u).map((p, i) => ({
      ...p,
      id: `${u.slug}-${i}`,
      university: { id: u.slug, slug: u.slug, name: u.name, nameEn: u.nameEn, city: u.city, color: u.color, website: u.website },
    })),
  );

/** In-memory equivalent of buildProgramWhere + orderBy over the sample catalogue. */
function filterSamplePrograms(f: ProgramFilters, order: Prisma.ProgramOrderByWithRelationInput[]) {
  const q = f.q?.trim().toLowerCase();
  const min = Number(f.min);
  const max = Number(f.max);
  const all = sampleRows().filter((p) => {
    if (f.city && p.university.city !== f.city) return false;
    if (f.university && p.university.id !== f.university) return false;
    if (f.degree && (PROGRAM_DEGREE_KEYS as string[]).includes(f.degree) && p.degree !== f.degree) return false;
    if (f.language && (PROGRAM_LANGUAGE_KEYS as string[]).includes(f.language) && p.language !== f.language) return false;
    if (f.faculty && p.faculty !== f.faculty) return false;
    if (f.min && Number.isFinite(min) && p.tuition < min) return false;
    if (f.max && Number.isFinite(max) && max > 0 && p.tuition > max) return false;
    if (f.scholarship === "1" && p.scholarshipPrice == null) return false;
    if (q && ![p.name, p.nameEn, p.faculty, p.university.name, p.university.nameEn].some((v) => v?.toLowerCase().includes(q))) return false;
    return true;
  });
  const [key, dir] = Object.entries(order[0] ?? { tuition: "asc" })[0] as [keyof ProgramRow, "asc" | "desc"];
  all.sort((a, b) => {
    const x = a[key], y = b[key];
    const d = typeof x === "string" && typeof y === "string" ? x.localeCompare(y, "fa") : Number(x ?? 0) - Number(y ?? 0);
    return dir === "desc" ? -d : d;
  });
  return all;
}

function searchSamplePrograms(f: ProgramFilters, order: Prisma.ProgramOrderByWithRelationInput[]) {
  const all = filterSamplePrograms(f, order);
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(f.page) || 1), pages);
  return { rows: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: all.length, page, pages };
}

/** False when the database is unreachable or holds no visible programs — the public lists then use the sample catalogue. */
function hasPrograms() {
  return safeRead(
    () => cachedRead(["hasPrograms"], async () => (await db.program.count({ where: { active: true, university: { published: true } } })) > 0),
    false,
  );
}

const defaultOrder = (f: ProgramFilters): Prisma.ProgramOrderByWithRelationInput[] =>
  f.sort === "expensive" ? [{ tuition: "desc" }] : f.sort === "name" ? [{ name: "asc" }] : [{ tuition: "asc" }];

/** Most rows a single PDF export may hold. */
export const EXPORT_LIMIT = 1000;

/** Every program matching the filters (no paging, capped at EXPORT_LIMIT) for the PDF export, plus the uncapped total. */
export async function exportPrograms(f: ProgramFilters) {
  const where = buildProgramWhere(f);
  const order = defaultOrder(f);
  if (!(await hasPrograms())) {
    const all = filterSamplePrograms(f, order);
    return { rows: all.slice(0, EXPORT_LIMIT), total: all.length };
  }
  return safeRead(
    () => cachedRead(["exportPrograms", where, order], async () => {
      const [rows, total] = await Promise.all([
        db.program.findMany({ where, select: programSelect, orderBy: order, take: EXPORT_LIMIT }),
        db.program.count({ where }),
      ]);
      return { rows, total };
    }),
    { rows: [] as ProgramRow[], total: 0 },
  );
}

export async function searchPrograms(f: ProgramFilters, orderBy?: Prisma.ProgramOrderByWithRelationInput[]) {
  const where = buildProgramWhere(f);
  const page = Math.max(1, Number(f.page) || 1);
  const order = orderBy ?? defaultOrder(f);
  if (!(await hasPrograms())) return searchSamplePrograms(f, order);
  return safeRead(
    () => cachedRead(["searchPrograms", where, order, page], async () => {
      const [rows, total] = await Promise.all([
        db.program.findMany({ where, select: programSelect, orderBy: order, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
        db.program.count({ where }),
      ]);
      return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
    }),
    { rows: [] as ProgramRow[], total: 0, page: 1, pages: 1 },
  );
}

/** Options for the filter dropdowns (only values that actually exist). */
export async function programFilterOptions() {
  if (!(await hasPrograms())) {
    const universities = SEED_UNIVERSITIES.map((u) => ({ id: u.slug, name: u.name, nameEn: u.nameEn, city: u.city })).sort((a, b) => a.name.localeCompare(b.name, "fa"));
    return {
      universities,
      cities: [...new Set(universities.map((u) => u.city))],
      faculties: [...new Set(sampleRows().flatMap((p) => p.faculty ?? []))].sort((a, b) => a.localeCompare(b, "fa")),
      names: [...new Map(sampleRows().map((p) => [p.name, { name: p.name, nameEn: p.nameEn }])).values()],
    };
  }
  return safeRead(
    () => cachedRead(["programFilterOptions"], async () => {
      const [universities, faculties, names] = await Promise.all([
        db.university.findMany({
          where: { published: true, offerings: { some: { active: true } } },
          select: { id: true, name: true, nameEn: true, city: true },
          orderBy: { name: "asc" },
        }),
        db.program.findMany({ where: { active: true, faculty: { not: null } }, select: { faculty: true }, distinct: ["faculty"], orderBy: { faculty: "asc" } }),
        // Distinct program names feed the search box's type-ahead suggestions.
        db.program.findMany({ where: { active: true, university: { published: true } }, select: { name: true, nameEn: true }, distinct: ["name"], orderBy: { name: "asc" } }),
      ]);
      return {
        universities,
        cities: [...new Set(universities.map((u) => u.city))],
        faculties: faculties.map((f) => f.faculty!).filter(Boolean),
        names,
      };
    }),
    { universities: [], cities: [], faculties: [] as string[], names: [] as { name: string; nameEn: string | null }[] },
  );
}

export async function scholarshipStats() {
  if (!(await hasPrograms())) {
    const seats = sampleRows().filter((p) => p.scholarshipPrice != null);
    return { seats: seats.length, universities: new Set(seats.map((p) => p.university.id)).size, from: Math.min(...seats.map((p) => p.scholarshipPrice!)) };
  }
  return safeRead(
    () => cachedRead(["scholarshipStats"], async () => {
      const where = { active: true, scholarshipPrice: { not: null }, university: { published: true } };
      const [agg, unis] = await Promise.all([
        db.program.aggregate({ where, _count: true, _min: { scholarshipPrice: true } }),
        db.program.findMany({ where, select: { universityId: true }, distinct: ["universityId"] }),
      ]);
      return { seats: agg._count, universities: unis.length, from: agg._min.scholarshipPrice ?? 0 };
    }),
    { seats: 0, universities: 0, from: 0 },
  );
}

/** Compact rows for the client-side tuition calculator. */
export async function calculatorPrograms() {
  const rows = await safeRead(
    () =>
      db.program.findMany({
        where: { active: true, university: { published: true } },
        select: {
          id: true, universityId: true, name: true, nameEn: true, degree: true, language: true,
          durationYears: true, tuition: true, prepFee: true, cashTotal: true, scholarshipPrice: true, sample: true,
        },
        orderBy: [{ name: "asc" }],
      }),
    [],
  );
  if (rows.length > 0) return rows;

  // No programs (DB unavailable or not imported yet): use the sample catalogue so the calculator still works.
  // Programs are linked to the DB university ids when those exist, otherwise to the slug (the fallback university id).
  const idBySlug = new Map(
    (await safeRead(() => db.university.findMany({ where: { published: true }, select: { id: true, slug: true } }), [])).map((u) => [u.slug, u.id]),
  );
  return SEED_UNIVERSITIES.flatMap((u) =>
    samplePrograms(u).map((p, i) => ({
      id: `${u.slug}-${i}`,
      universityId: idBySlug.get(u.slug) ?? u.slug,
      name: p.name,
      nameEn: p.nameEn as string | null,
      degree: p.degree,
      language: p.language,
      durationYears: p.durationYears,
      tuition: p.tuition,
      prepFee: p.prepFee as number | null,
      cashTotal: p.cashTotal as number | null,
      scholarshipPrice: p.scholarshipPrice as number | null,
      sample: true,
    })),
  ).sort((a, b) => a.name.localeCompare(b.name, "fa"));
}
export type CalcProgram = Awaited<ReturnType<typeof calculatorPrograms>>[number];

/**
 * The bachelor program with the biggest scholarship saving — used as the worked example
 * in the home page's scholarship and payment comparison sections.
 */
export async function scholarshipExample() {
  const rows = await safeRead(
    () =>
      db.program.findMany({
        where: { active: true, degree: "BACHELOR", scholarshipPrice: { not: null }, cashTotal: { not: null }, university: { published: true } },
        select: { ...programSelect },
        take: 200,
      }),
    [] as ProgramRow[],
  );
  if (rows.length === 0) return null;
  // A typical (median-priced) program reads more honestly than the most extreme one.
  const sorted = rows
    .map((p) => ({ p, total: termlyTotal(p) }))
    .sort((a, b) => a.total - b.total);
  const { p, total } = sorted[Math.floor(sorted.length / 2)];
  const scholarship = p.scholarshipPrice!;
  return {
    program: p,
    termly: total,
    cash: p.cashTotal!,
    scholarship,
    savingPercent: Math.round((1 - scholarship / total) * 100),
  };
}

/** Featured universities with tuition range and counts computed from their programs. */
export async function featuredUniversities(take = 6) {
  const rows = await safeRead(
    async () => {
      const unis = await db.university.findMany({
        where: { published: true },
        select: { id: true, slug: true, name: true, nameEn: true, city: true, color: true, logo: true, summary: true, featured: true },
        orderBy: [{ featured: "desc" }, { name: "asc" }],
        take,
      });
      const stats = await db.program.groupBy({
        by: ["universityId"],
        where: { active: true, universityId: { in: unis.map((u) => u.id) } },
        _min: { tuition: true },
        _max: { tuition: true },
        _count: true,
      });
      const seats = await db.program.groupBy({
        by: ["universityId"],
        where: { active: true, scholarshipPrice: { not: null }, universityId: { in: unis.map((u) => u.id) } },
        _count: true,
      });
      return unis.map((u) => {
        const s = stats.find((x) => x.universityId === u.id);
        return {
          ...u,
          minTuition: s?._min.tuition ?? null,
          maxTuition: s?._max.tuition ?? null,
          programCount: s?._count ?? 0,
          seatCount: seats.find((x) => x.universityId === u.id)?._count ?? 0,
        };
      });
    },
    [],
  );
  if (rows.length > 0) return rows.map((u) => ({ ...u, logo: logoFor(u) }));
  // DB unavailable or empty: show the base catalogue (starting tuition only) so the section is never blank.
  return [...SEED_UNIVERSITIES]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, take)
    .map((u) => ({
      id: u.slug, slug: u.slug, name: u.name, nameEn: u.nameEn, city: u.city, color: u.color, summary: u.summary, featured: u.featured,
      logo: logoFor(u),
      minTuition: u.tuitionFrom as number | null,
      maxTuition: null as number | null,
      programCount: 0,
      seatCount: 0,
    }));
}

type MarqueeUniversity = { id: string; slug: string; name: string; nameEn: string; color: string; logo: string | null; href?: string };

/** Shown when the database is unreachable or has no universities yet, so the logo row never disappears. */
const FALLBACK_UNIVERSITIES: MarqueeUniversity[] = SEED_UNIVERSITIES.map((u) => ({
  id: u.slug, slug: u.slug, name: u.name, nameEn: u.nameEn, color: u.color, logo: logoFor(u), href: "/universities",
}));

export async function marqueeUniversities(): Promise<MarqueeUniversity[]> {
  const rows = await safeRead<MarqueeUniversity[]>(
    () => db.university.findMany({ where: { published: true }, select: { id: true, slug: true, name: true, nameEn: true, color: true, logo: true }, orderBy: { name: "asc" } }),
    [],
  );
  return rows.length > 0 ? rows.map((u) => ({ ...u, logo: logoFor(u) })) : FALLBACK_UNIVERSITIES;
}
