import { PageTitle } from "@/components/portal/portal-shell";
import { EMPTY_UNIVERSITY, UniversityForm } from "@/components/forms/university-form";
import { requireRole } from "@/lib/auth";

export default async function NewUniversityPage() {
  await requireRole("ADMIN");
  return (
    <>
      <PageTitle title="افزودن دانشگاه" />
      <UniversityForm initial={EMPTY_UNIVERSITY} />
    </>
  );
}
