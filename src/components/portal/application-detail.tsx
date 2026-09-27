import { AlertTriangle, CalendarDays, Download, ExternalLink, FileText, History, ImageIcon, MessageSquareText, PartyPopper } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { DocDelete, DocReview, StatusPanel, UploadMore } from "./application-actions";
import type { ApplicationWithRelations } from "@/lib/applications";
import { APP_STATUSES, APP_TYPES, DOC_KINDS, DOC_STATUSES, REQUIRED_DOCS, type AppType, type DocKind } from "@/lib/constants";
import { formatBytes, formatDate, formatDateTime } from "@/lib/utils";
import type { Role } from "@/lib/session";

export function ApplicationDetail({ app, viewer, created }: { app: ApplicationWithRelations; viewer: Role; created?: boolean }) {
  const isAdmin = viewer === "ADMIN";
  const closed = app.status === "APPROVED" || app.status === "REJECTED";
  const type = app.type as AppType;

  const uploadedKinds = new Set(app.documents.filter((d) => d.status !== "REJECTED").map((d) => d.kind));
  const missing = REQUIRED_DOCS[type]?.filter((k) => !uploadedKinds.has(k)) ?? [];
  const rejected = app.documents.filter((d) => d.status === "REJECTED");

  const info: [string, string | null | undefined][] = [
    ["نام متقاضی", app.studentName],
    ["ایمیل", app.studentEmail],
    ["تلفن", app.studentPhone],
    ["ملیت", app.nationality],
    ["شماره پاسپورت", app.passportNo],
    ["تاریخ تولد", app.birthDate],
    ["دانشگاه", app.university?.name],
    ["مقطع", app.degree],
    ["رشته", app.program],
    ["شهر خوابگاه", app.dormCity],
    ["نوع اتاق", app.roomType],
    ["تاریخ ورود", app.moveInDate],
  ];
  if (isAdmin && app.agent) info.push(["ثبت‌شده توسط نماینده", `${app.agent.companyName ?? app.agent.name} (${app.agent.email})`]);
  if (isAdmin && app.student) info.push(["حساب دانشجو", app.student.email]);

  return (
    <div className="space-y-6">
      {created && (
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-l from-turquoise-500 to-turquoise-600 p-5 text-white shadow-lift">
          <PartyPopper className="h-8 w-8 shrink-0" />
          <div>
            <p className="font-extrabold">درخواست شما با موفقیت ثبت شد!</p>
            <p className="text-sm text-white/85">کد پیگیری: <b dir="ltr">{app.code}</b> — نتیجه بررسی مدارک در همین صفحه نمایش داده می‌شود.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">{APP_TYPES[type]?.label ?? app.type}</p>
          <h1 className="mt-1 text-2xl font-black text-navy-950">{app.studentName}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="rounded-lg bg-sand-100 px-2 py-0.5 font-mono font-bold text-navy-900" dir="ltr">{app.code}</span>
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" />{formatDate(app.createdAt)}</span>
          </p>
        </div>
        <StatusBadge map={APP_STATUSES} value={app.status} />
      </div>

      {!isAdmin && app.adminNote && (
        <div className="flex gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-5">
          <MessageSquareText className="h-5 w-5 shrink-0 text-gold-600" />
          <div>
            <p className="font-extrabold text-navy-950">پیام کارشناس پاشا آکادمی</p>
            <p className="mt-1 whitespace-pre-line leading-7 text-navy-900/80">{app.adminNote}</p>
          </div>
        </div>
      )}

      {!isAdmin && !closed && (missing.length > 0 || rejected.length > 0) && (
        <div className="flex gap-3 rounded-2xl border border-crimson-200 bg-crimson-50 p-5 text-crimson-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="text-sm leading-7">
            <p className="font-extrabold">اقدام لازم</p>
            {rejected.length > 0 && <p>برخی مدارک رد شده‌اند؛ دلیل را ببینید و نسخه صحیح را بارگذاری کنید.</p>}
            {missing.length > 0 && <p>مدارک الزامی ناقص: {missing.map((k) => DOC_KINDS[k]).join("، ")}</p>}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Documents */}
          <section className="card p-6">
            <h2 className="text-lg font-extrabold text-navy-950">مدارک بارگذاری‌شده</h2>
            {app.documents.length === 0 ? (
              <p className="mt-4 text-sm text-muted">هنوز مدرکی بارگذاری نشده است.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {app.documents.map((d) => {
                  const isImage = d.mimeType.startsWith("image/");
                  const Icon = isImage ? ImageIcon : FileText;
                  const canDelete = isAdmin || (!closed && d.status !== "APPROVED");
                  return (
                    <li key={d.id} className="rounded-2xl border border-line bg-sand-50/60 p-4">
                      <div className="flex flex-wrap items-center gap-4">
                        {isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/api/documents/${d.id}/file`} alt={DOC_KINDS[d.kind as DocKind] ?? d.kind} className="h-14 w-14 rounded-xl object-cover ring-1 ring-line" loading="lazy" />
                        ) : (
                          <span className="grid h-14 w-14 place-items-center rounded-xl bg-white text-crimson-500 ring-1 ring-line"><Icon className="h-6 w-6" /></span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-navy-950">{DOC_KINDS[d.kind as DocKind] ?? d.kind}</p>
                          <p className="truncate text-xs text-muted" dir="ltr">{d.originalName} · {formatBytes(d.size)}</p>
                        </div>
                        <StatusBadge map={DOC_STATUSES} value={d.status} />
                        <div className="flex items-center gap-1">
                          <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-navy-50 hover:text-navy-900" aria-label="مشاهده">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <a href={`/api/documents/${d.id}/file?download=1`} className="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-navy-50 hover:text-navy-900" aria-label="دانلود">
                            <Download className="h-4 w-4" />
                          </a>
                          {canDelete && <DocDelete id={d.id} />}
                        </div>
                      </div>
                      {d.reviewNote && (
                        <p className="mt-3 rounded-xl bg-crimson-50 px-3 py-2 text-xs font-semibold text-crimson-700">
                          یادداشت کارشناس: {d.reviewNote}
                        </p>
                      )}
                      {isAdmin && (
                        <div className="mt-3 border-t border-line pt-3">
                          <DocReview id={d.id} status={d.status} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Info */}
          <section className="card p-6">
            <h2 className="text-lg font-extrabold text-navy-950">اطلاعات درخواست</h2>
            <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {info.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="border-b border-dashed border-line pb-3">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="mt-1 font-bold text-navy-950">{v}</dd>
                </div>
              ))}
            </dl>
            {app.notes && (
              <div className="mt-5 rounded-xl bg-sand-100 p-4 text-sm leading-7 text-navy-900">
                <p className="mb-1 font-bold">توضیحات متقاضی:</p>
                {app.notes}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          {isAdmin && (
            <section className="card p-6">
              <h2 className="mb-4 text-lg font-extrabold text-navy-950">مدیریت وضعیت</h2>
              <StatusPanel id={app.id} status={app.status} adminNote={app.adminNote} />
            </section>
          )}

          {!closed && (
            <section className="card p-6">
              <h2 className="mb-4 text-lg font-extrabold text-navy-950">{isAdmin ? "افزودن مدرک" : "بارگذاری / اصلاح مدرک"}</h2>
              <UploadMore applicationId={app.id} suggestKind={(rejected[0]?.kind ?? missing[0]) as DocKind | undefined} />
            </section>
          )}

          <section className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-950"><History className="h-5 w-5 text-gold-500" />تاریخچه</h2>
            <ol className="relative mt-5 space-y-5 border-r-2 border-line pr-5">
              {app.events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -right-[1.65rem] top-1.5 h-3 w-3 rounded-full bg-gold-400 ring-4 ring-white" />
                  <p className="text-sm font-semibold leading-6 text-navy-950">{e.message}</p>
                  <p className="mt-0.5 text-xs text-muted">{e.actor} · {formatDateTime(e.createdAt)}</p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
