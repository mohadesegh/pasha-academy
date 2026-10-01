import { notFound } from "next/navigation";
import { PageTitle } from "@/components/portal/portal-shell";
import { ProgramForm } from "@/components/forms/program-form";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const [p, universities] = await Promise.all([
    db.program.findUnique({ where: { id: (await params).id } }),
    db.university.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!p) notFound();
  return (
    <>
      <PageTitle title={`ویرایش ${p.name}`} lead={p.sample ? "این رشته داده نمونه است؛ با ذخیره، به داده واقعی تبدیل می‌شود." : undefined} />
      <ProgramForm initial={p} universities={universities} />
    </>
  );
}
