"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { postJson } from "@/components/forms/field";
import { cn } from "@/lib/utils";

export function AgentStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);

  async function change(next: string) {
    setValue(next);
    setError(null);
    try {
      await postJson(`/api/admin/agents/${id}`, { agentStatus: next }, "PATCH");
      start(() => router.refresh());
    } catch (e) {
      setValue(status);
      setError((e as Error).message);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select aria-label="وضعیت نماینده" value={value} onChange={(e) => change(e.target.value)} className="input w-40 py-2 text-xs">
        <option value="PENDING">در انتظار تایید</option>
        <option value="APPROVED">فعال</option>
        <option value="SUSPENDED">غیرفعال</option>
      </select>
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
      {error && <span className="text-xs text-crimson-600">{error}</span>}
    </div>
  );
}

export function LeadToggle({ id, handled }: { id: string; handled: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        await postJson(`/api/admin/leads/${id}`, { handled: !handled }, "PATCH");
        start(() => router.refresh());
      }}
      className={cn(
        "btn btn-sm",
        handled ? "bg-turquoise-50 text-turquoise-600 ring-1 ring-turquoise-300/60" : "bg-navy-950 text-white hover:bg-navy-800",
      )}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      {handled ? "پیگیری شد" : "علامت پیگیری"}
    </button>
  );
}
