import { notFound } from "next/navigation";
import { PageTitle } from "@/components/portal/portal-shell";
import { UniversityForm } from "@/components/forms/university-form";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function EditUniversityPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const u = await db.university.findUnique({ where: { id: (await params).id } });
  if (!u) notFound();
  return (
    <>
      <PageTitle title={`ویرایش ${u.name}`} />
      <UniversityForm initial={u} />
    </>
  );
}
