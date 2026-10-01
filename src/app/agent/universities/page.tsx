import { PanelUniversityList } from "@/components/university/panel-universities";
import { requireRole } from "@/lib/auth";

export default async function AgentUniversitiesPage() {
  await requireRole("AGENT");
  return <PanelUniversityList basePath="/agent/universities" lead="دانشگاه مناسب را پیدا کنید و مستقیم برای دانشجوی خود پرونده ثبت کنید." />;
}
