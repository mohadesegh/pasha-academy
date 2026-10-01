import Link from "next/link";
import { Plus } from "lucide-react";
import { PageTitle } from "@/components/portal/portal-shell";
import { ApplicationsTable, appRowSelect } from "@/components/portal/applications-table";
import { ApplicationFilters } from "@/components/portal/application-filters";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildApplicationWhere } from "@/lib/filters";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AgentApplicationsPage({ searchParams }: Props) {
  const user = await requireRole("AGENT");
  const sp = await searchParams;
  const rows = await db.application.findMany({
    where: { ...buildApplicationWhere(sp), agentId: user.id },
    select: appRowSelect,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <>
      <PageTitle title="پرونده‌های دانشجویان" action={<Link href="/agent/new" className="btn-primary"><Plus className="h-4 w-4" />ثبت پرونده</Link>} />
      <ApplicationFilters />
      <ApplicationsTable rows={rows} basePath="/agent/applications" empty="پرونده‌ای با این فیلتر یافت نشد." />
    </>
  );
}
