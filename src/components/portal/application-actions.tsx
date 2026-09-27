"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, Save, Trash2, Upload, X } from "lucide-react";
import { Alert, postJson } from "@/components/forms/field";
import { DocumentDropzone } from "@/components/forms/document-dropzone";
import { APP_STATUSES, APP_STATUS_KEYS, DOC_KINDS, DOC_KIND_KEYS, type DocKind } from "@/lib/constants";
import { cn } from "@/lib/utils";

function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  async function run(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      start(() => router.refresh());
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return { pending, error, run };
}

/** Admin: approve / reject a single document. */
export function DocReview({ id, status }: { id: string; status: string }) {
  const { pending, error, run } = useAction();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const send = (next: string, reviewNote?: string) =>
    run(async () => {
      setBusy(true);
      try {
        await postJson(`/api/documents/${id}`, { status: next, reviewNote }, "PATCH");
        setRejecting(false);
        setNote("");
      } finally {
        setBusy(false);
      }
    });

  const loading = pending || busy;

  if (rejecting) {
    return (
      <div className="mt-3 w-full space-y-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="input text-xs"
          placeholder="دلیل رد مدرک (به دانشجو نمایش داده می‌شود)"
          autoFocus
        />
        <div className="flex gap-2">
          <button type="button" disabled={loading || !note.trim()} onClick={() => send("REJECTED", note)} className="btn btn-sm bg-crimson-500 text-white hover:bg-crimson-600">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            ثبت رد
          </button>
          <button type="button" onClick={() => setRejecting(false)} className="btn-outline btn-sm">انصراف</button>
        </div>
        {error && <p className="text-xs text-crimson-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "APPROVED" && (
        <button type="button" disabled={loading} onClick={() => send("APPROVED")} className="btn btn-sm bg-turquoise-500 text-white hover:bg-turquoise-600">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          تایید
        </button>
      )}
      {status !== "REJECTED" && (
        <button type="button" disabled={loading} onClick={() => setRejecting(true)} className="btn btn-sm border border-crimson-200 bg-white text-crimson-600 hover:bg-crimson-50">
          <X className="h-3.5 w-3.5" />
          رد
        </button>
      )}
      {status !== "PENDING" && (
        <button type="button" disabled={loading} onClick={() => send("PENDING")} className="btn-outline btn-sm" title="بازگشت به حالت در انتظار">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
      {error && <p className="w-full text-xs text-crimson-600">{error}</p>}
    </div>
  );
}

/** Owner or admin: delete a document. */
export function DocDelete({ id }: { id: string }) {
  const { pending, run } = useAction();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("این مدرک حذف شود؟")) return;
        run(() => postJson(`/api/documents/${id}`, {}, "DELETE"));
      }}
      className="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-crimson-50 hover:text-crimson-600"
      aria-label="حذف مدرک"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}

/** Upload an extra / replacement document to an existing application. */
export function UploadMore({ applicationId, suggestKind }: { applicationId: string; suggestKind?: DocKind }) {
  const router = useRouter();
  const [kind, setKind] = useState<DocKind>(suggestKind ?? "OTHER");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function submit() {
    if (!file) return;
    setPending(true);
    setMsg(null);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("kind", kind);
    const res = await fetch(`/api/applications/${applicationId}/documents`, { method: "POST", body: fd });
    const json = await res.json().catch(() => ({ ok: false, error: "خطای ارتباط با سرور" }));
    setPending(false);
    if (json.ok) {
      setFile(null);
      setMsg({ tone: "success", text: "مدرک با موفقیت بارگذاری شد" });
      router.refresh();
    } else {
      setMsg({ tone: "error", text: json.error });
    }
  }

  return (
    <div className="space-y-3">
      <select value={kind} onChange={(e) => setKind(e.target.value as DocKind)} className="input" aria-label="نوع مدرک">
        {DOC_KIND_KEYS.map((k) => <option key={k} value={k}>{DOC_KINDS[k]}</option>)}
      </select>
      <DocumentDropzone compact label={DOC_KINDS[kind]} file={file} onChange={setFile} />
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <button type="button" disabled={!file || pending} onClick={submit} className="btn-navy w-full">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        بارگذاری مدرک
      </button>
    </div>
  );
}

/** Admin: change application status and leave a note for the applicant. */
export function StatusPanel({ id, status, adminNote }: { id: string; status: string; adminNote: string | null }) {
  const { pending, error, run } = useAction();
  const [value, setValue] = useState(status);
  const [note, setNote] = useState(adminNote ?? "");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {APP_STATUS_KEYS.map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => setValue(s)}
            className={cn(
              "rounded-xl border-2 px-3 py-2 text-xs font-bold transition",
              value === s ? "border-navy-950 bg-navy-950 text-white" : "border-line bg-white text-navy-800 hover:border-navy-300",
            )}
          >
            {APP_STATUSES[s].label}
          </button>
        ))}
      </div>
      <div>
        <label htmlFor="adminNote" className="label">یادداشت برای متقاضی</label>
        <textarea id="adminNote" value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="input resize-none" placeholder="این یادداشت در پنل دانشجو / نماینده نمایش داده می‌شود" />
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      {saved && !pending && !error && <Alert tone="success">تغییرات ذخیره شد</Alert>}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setSaved(false);
          run(async () => {
            await postJson(`/api/admin/applications/${id}`, { status: value, adminNote: note }, "PATCH");
            setSaved(true);
          });
        }}
        className="btn-primary w-full"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        ذخیره وضعیت
      </button>
    </div>
  );
}
