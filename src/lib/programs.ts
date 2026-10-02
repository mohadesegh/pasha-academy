import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { safeRead } from "./universities";
import { PROGRAM_DEGREE_KEYS, PROGRAM_LANGUAGE_KEYS } from "./constants";
import { logoFor } from "./university-logos";
import { SEED_UNIVERSITIES, samplePrograms } from "@/data/universities";

export const PAGE_SIZE = 25;

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

export async function searchPrograms(f: ProgramFilters, orderBy?: Prisma.ProgramOrderByWithRelationInput[]) {
  const where = buildProgramWhere(f);
  const page = Math.max(1, Number(f.page) || 1);
  const order: Prisma.ProgramOrderByWithRelationInput[] =
    orderBy ??
    (f.sort === "expensive" ? [{ tuition: "desc" }] : f.sort === "name" ? [{ name: "asc" }] : [{ tuition: "asc" }]);
  return safeRead(
    async () => {
      const [rows, total] = await Promise.all([
        db.program.findMany({ where, select: programSelect, orderBy: order, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
        db.program.count({ where }),
      ]);
      return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
    },
    { rows: [] as ProgramRow[], total: 0, page: 1, pages: 1 },
  );
}

/** Options for the filter dropdowns (only values that actually exist). */
export async function programFilterOptions() {
  return safeRead(
    async () => {
      const [universities, faculties] = await Promise.all([
        db.university.findMany({
          where: { published: true, offerings: { some: { active: true } } },
          select: { id: true, name: true, nameEn: true, city: true },
          orderBy: { name: "asc" },
        }),
        db.program.findMany({ where: { active: true, faculty: { not: null } }, select: { faculty: true }, distinct: ["faculty"], orderBy: { faculty: "asc" } }),
      ]);
      return {
        universities,
        cities: [...new Set(universities.map((u) => u.city))],
        faculties: faculties.map((f) => f.faculty!).filter(Boolean),
      };
    },
    { universities: [], cities: [], faculties: [] as string[] },
  );
}

export async function scholarshipStats() {
  return safeRead(
    async () => {
      const where = { active: true, scholarshipPrice: { not: null }, university: { published: true } };
      const [agg, unis] = await Promise.all([
        db.program.aggregate({ where, _count: true, _min: { scholarshipPrice: true } }),
        db.program.findMany({ where, select: { universityId: true }, distinct: ["universityId"] }),
      ]);
      return { seats: agg._count, universities: unis.length, from: agg._min.scholarshipPrice ?? 0 };
    },
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
