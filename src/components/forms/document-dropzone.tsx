"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FileText, UploadCloud, X } from "lucide-react";
import { ACCEPT_ATTR, UPLOAD_LIMIT_BYTES } from "@/lib/constants";
import { cn, formatBytes } from "@/lib/utils";

const ALLOWED_EXT = /\.(pdf|jpe?g|png|webp)$/i;

export function validateFile(file: File): string | null {
  if (!ALLOWED_EXT.test(file.name)) return "فقط فایل PDF، JPG، PNG یا WEBP مجاز است";
  if (file.size > UPLOAD_LIMIT_BYTES) return "حجم فایل بیشتر از ۵ مگابایت است";
  if (file.size === 0) return "فایل خالی است";
  return null;
}

/** A single-file drop zone with image preview. */
export function DocumentDropzone({
  label,
  required,
  file,
  onChange,
  compact = false,
}: {
  label: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pick(f: File | undefined) {
    if (!f) return;
    const err = validateFile(f);
    setError(err);
    if (!err) onChange(f);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={`بارگذاری ${label}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={cn(
          "group relative flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition",
          compact ? "min-h-20" : "min-h-24",
          file ? "border-turquoise-300 bg-turquoise-50/60" : drag ? "border-gold-400 bg-gold-50" : "border-line bg-white hover:border-navy-300 hover:bg-navy-50/40",
          error && "border-crimson-300 bg-crimson-50/50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {file ? (
          <>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover ring-2 ring-white" />
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white text-crimson-500 ring-1 ring-line"><FileText className="h-6 w-6" /></span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-extrabold text-navy-950">
                <CheckCircle2 className="h-4 w-4 text-turquoise-500" />
                {label}
              </p>
              <p className="truncate text-xs text-muted" dir="ltr">{file.name} · {formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-muted ring-1 ring-line transition hover:bg-crimson-500 hover:text-white"
              aria-label={`حذف ${label}`}
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <motion.span
              animate={drag ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
              className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600 transition group-hover:bg-navy-950 group-hover:text-gold-300"
            >
              <UploadCloud className="h-6 w-6" />
            </motion.span>
            <div>
              <p className="text-sm font-extrabold text-navy-950">
                {label}
                {required && <span className="mr-1 text-crimson-500">*</span>}
              </p>
              <p className="text-xs text-muted">فایل را بکشید و رها کنید یا کلیک کنید — PDF / JPG / PNG تا ۵MB</p>
            </div>
          </>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-semibold text-crimson-600">{error}</p>}
    </div>
  );
}
