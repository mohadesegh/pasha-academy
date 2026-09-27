import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ApplicationDetail } from "@/components/portal/application-detail";
import { requireRole } from "@/lib/auth";
import { findApplicationFor } from "@/lib/applications";

export default async function AdminApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("ADMIN");
  const app = await findApplicationFor(user, (await params).id);
  if (!app) notFound();
  return (
    <>
      <Link href="/admin/applications" className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-navy-950">
        <ArrowRight className="h-4 w-4" /> بازگشت به درخواست‌ها
      </Link>
      <ApplicationDetail app={app} viewer="ADMIN" />
    </>
  );
}
