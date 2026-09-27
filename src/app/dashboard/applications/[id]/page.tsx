import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ApplicationDetail } from "@/components/portal/application-detail";
import { requireRole } from "@/lib/auth";
import { findApplicationFor } from "@/lib/applications";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export default async function StudentApplicationPage({ params, searchParams }: Props) {
  const user = await requireRole("STUDENT");
  const app = await findApplicationFor(user, (await params).id);
  if (!app) notFound();
  return (
    <>
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-navy-950">
        <ArrowRight className="h-4 w-4" /> بازگشت به درخواست‌ها
      </Link>
      <ApplicationDetail app={app} viewer="STUDENT" created={(await searchParams).created === "1"} />
    </>
  );
}
