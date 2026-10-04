"use client";

import { upload, uploadPresigned } from "@vercel/blob/client";
import { UPLOAD_LIMIT_BYTES } from "./constants";

/** Replace multipart file bodies with private Blob references before calling our API. */
export async function prepareUploads(form: FormData, onProgress?: (percent: number) => void) {
  const response = await fetch("/api/uploads", { cache: "no-store" });
  const config = await response.json();
  if (!response.ok) throw new Error(config.error ?? "خطا در آماده‌سازی بارگذاری");
  if (!config.cloud) return;
  const entries = [...form.entries()].filter((entry): entry is [string, File] => entry[1] instanceof File && entry[1].size > 0);
  const replacements = new Map<string, string[]>();
  for (let i = 0; i < entries.length; i++) {
    const [key, file] = entries[i];
    if (file.size > UPLOAD_LIMIT_BYTES) throw new Error("حجم هر فایل حداکثر ۵ مگابایت است");
    const blob = await (config.presigned ? uploadPresigned : upload)(`staging/${config.userId}/${crypto.randomUUID()}`, file, {
      access: "private", handleUploadUrl: "/api/uploads", contentType: file.type || "application/octet-stream",
      onUploadProgress: ({ percentage }) => onProgress?.(Math.round((i + percentage / 100) / entries.length * 95)),
    });
    replacements.set(key, [...(replacements.get(key) ?? []), JSON.stringify({ pathname: blob.pathname, name: file.name })]);
  }
  for (const [key, values] of replacements) {
    form.delete(key);
    for (const value of values) form.append(key, value);
  }
}
