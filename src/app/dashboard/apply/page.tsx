import { PageTitle } from "@/components/portal/portal-shell";
import { ApplicationForm } from "@/components/forms/application-form";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { APP_TYPE_KEYS, type AppType } from "@/lib/constants";

type Props = { searchParams: Promise<{ type?: string; university?: string }> };

export default async function ApplyPage({ searchParams }: Props) {
  const user = await requireRole("STUDENT");
  const sp = await searchParams;
  const type = APP_TYPE_KEYS.includes(sp.type as AppType) ? (sp.type as AppType) : "DORMITORY";
  const universities = await db.university.findMany({
    where: { published: true },
    select: { id: true, name: true, city: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageTitle title="ثبت درخواست جدید" lead="فرم را تکمیل کنید و مدارک لازم را بارگذاری کنید. نتیجه بررسی در پنل شما نمایش داده می‌شود." />
      <ApplicationForm
        universities={universities}
        initialType={type}
        initialUniversityId={universities.some((u) => u.id === sp.university) ? sp.university : ""}
        defaults={{ name: user.name, email: user.email, phone: user.phone ?? "" }}
        successBase="/dashboard/applications"
      />
    </>
  );
}
