"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { postJson } from "@/components/forms/field";

export function DeleteSamplesButton({ count }: { count: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!confirm(`همه ${count.toLocaleString("fa-IR")} رشته نمونه حذف شوند؟ این کار قابل بازگشت نیست.`)) return;
    setPending(true);
    try {
      await postJson("/api/admin/programs/samples", {}, "DELETE");
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <button type="button" onClick={onClick} disabled={pending} className="btn btn-sm border border-crimson-200 bg-white text-crimson-600 hover:bg-crimson-50">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      حذف همه رشته‌های نمونه
    </button>
  );
}
