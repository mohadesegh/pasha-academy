import { PageTitle } from "@/components/portal/portal-shell";
import { ApplicationForm } from "@/components/forms/application-form";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { APP_TYPE_KEYS, type AppType } from "@/lib/constants";

type Props = { searchParams: Promise<{ type?: string }> };

export default async function AgentNewApplicationPage({ searchParams }: Props) {
  await requireRole("AGENT");
  const sp = await searchParams;
  const universities = await db.university.findMany({
    where: { published: true },
    select: { id: true, name: true, city: true },
    orderBy: { name: "asc" },
  });
  return (
    <>
      <PageTitle title="ثبت پرونده دانشجو" lead="اطلاعات دانشجو را وارد و مدارک او را بارگذاری کنید." />
      <ApplicationForm
        forAgent
        universities={universities}
        initialType={APP_TYPE_KEYS.includes(sp.type as AppType) ? (sp.type as AppType) : "ADMISSION"}
        successBase="/agent/applications"
      />
    </>
  );
}
