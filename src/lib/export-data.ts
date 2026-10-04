import "server-only";
import { db } from "./db";
import { PROGRAM_DEGREE_KEYS } from "./constants";
import { SEED_UNIVERSITIES, samplePrograms } from "@/data/universities";
import { getUniversityBySlug, safeRead } from "./universities";

/** Data for the printable / PDF exports. Falls back to the base catalogue like the public pages. */

export type ExportUniversity = {
  slug: string;
  name: string;
  nameEn: string;
  city: string;
  languages: string;
  tuitionFrom: number | null;
  programCount: number;
};

export async function exportUniversities(): Promise<ExportUniversity[]> {
  const rows = await safeRead(
    () =>
      db.university.findMany({
        where: { published: true },
        select: {
          slug: true, name: true, nameEn: true, city: true, languages: true, tuitionFrom: true,
          _count: { select: { offerings: { where: { active: true } } } },
        },
        orderBy: [{ featured: "desc" }, { name: "asc" }],
      }),
    [],
  );
  if (rows.length > 0) return rows.map(({ _count, ...u }) => ({ ...u, programCount: _count.offerings }));
  return SEED_UNIVERSITIES.map((u) => ({
    slug: u.slug, name: u.name, nameEn: u.nameEn, city: u.city, languages: u.languages, tuitionFrom: u.tuitionFrom,
    programCount: samplePrograms(u).length,
  }));
}

export type ExportProgram = {
  name: string;
  degree: string;
  language: string;
  durationYears: number;
  tuition: number;
  cashTotal: number | null;
  scholarshipPrice: number | null;
  sample: boolean;
};

const degreeRank = (d: string) => {
  const i = (PROGRAM_DEGREE_KEYS as readonly string[]).indexOf(d);
  return i < 0 ? 99 : i;
};

/** One university and its active programs, ordered by degree then name. Null if the university doesn't exist. */
export async function exportUniversityPrograms(slug: string) {
  const u = await getUniversityBySlug(slug);
  if (!u) return null;
  // A fallback university (database unreachable) has its slug as id; use the sample catalogue for it.
  const fromDb = u.id !== u.slug;
  const programs: ExportProgram[] = fromDb
    ? await safeRead(
        () =>
          db.program.findMany({
            where: { universityId: u.id, active: true },
            select: { name: true, degree: true, language: true, durationYears: true, tuition: true, cashTotal: true, scholarshipPrice: true, sample: true },
          }),
        [],
      )
    : samplePrograms(u);
  programs.sort((a, b) => degreeRank(a.degree) - degreeRank(b.degree) || a.name.localeCompare(b.name, "fa"));
  return { university: u, programs };
}
