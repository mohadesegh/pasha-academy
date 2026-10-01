import { PanelUniversityDetail } from "@/components/university/panel-universities";
import { requireRole } from "@/lib/auth";

type Props = { params: Promise<{ slug: string }> };

export default async function AgentUniversityPage({ params }: Props) {
  await requireRole("AGENT");
  return (
    <PanelUniversityDetail
      slug={(await params).slug}
      basePath="/agent/universities"
      applyBase="/agent/new"
      applyLabel="ثبت پرونده برای این دانشگاه"
    />
  );
}
