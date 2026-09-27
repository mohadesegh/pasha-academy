import { PageTitle } from "@/components/portal/portal-shell";
import { ApplicationsTable, appRowSelect } from "@/components/portal/applications-table";
import { ApplicationFilters } from "@/components/portal/application-filters";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildApplicationWhere } from "@/lib/filters";
import { toFa } from "@/lib/utils";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminApplicationsPage({ searchParams }: Props) {
  await requireRole("ADMIN");
  const where = buildApplicationWhere(await searchParams);
  const [rows, count] = await Promise.all([
    db.application.findMany({ where, select: appRowSelect, orderBy: { createdAt: "desc" }, take: 300 }),
    db.application.count({ where }),
  ]);
  return (
    <>
      <PageTitle title="درخواست‌ها و مدارک" lead={`${toFa(count)} درخواست`} />
      <ApplicationFilters />
      <ApplicationsTable rows={rows} basePath="/admin/applications" showAgent empty="درخواستی با این فیلتر یافت نشد." />
    </>
  );
}
