import { PanelUniversityDetail } from "@/components/university/panel-universities";
import { requireRole } from "@/lib/auth";

type Props = { params: Promise<{ slug: string }> };

export default async function StudentUniversityPage({ params }: Props) {
  await requireRole("STUDENT");
  return (
    <PanelUniversityDetail
      slug={(await params).slug}
      basePath="/dashboard/universities"
      applyBase="/dashboard/apply"
      applyLabel="درخواست پذیرش از این دانشگاه"
    />
  );
}
