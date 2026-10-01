import { PanelUniversityList } from "@/components/university/panel-universities";
import { requireRole } from "@/lib/auth";

export default async function StudentUniversitiesPage() {
  await requireRole("STUDENT");
  return <PanelUniversityList basePath="/dashboard/universities" lead="دانشگاه‌ها را مقایسه کنید و برای دانشگاه دلخواه درخواست پذیرش ثبت کنید." />;
}
