import { PageTitle } from "@/components/portal/portal-shell";
import { EMPTY_PROGRAM, ProgramForm } from "@/components/forms/program-form";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function NewProgramPage({ searchParams }: { searchParams: Promise<{ university?: string }> }) {
  await requireRole("ADMIN");
  const [universities, { university }] = await Promise.all([
    db.university.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    searchParams,
  ]);
  return (
    <>
      <PageTitle title="افزودن رشته" />
      <ProgramForm initial={{ ...EMPTY_PROGRAM, universityId: university ?? "" }} universities={universities} />
    </>
  );
}
