import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const faDigits = "۰۱۲۳۴۵۶۷۸۹";
export function toFa(value: string | number) {
  return String(value).replace(/\d/g, (d) => faDigits[Number(d)]);
}

export function formatNumber(n: number) {
  return toFa(n.toLocaleString("en-US"));
}

export function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(d));
}

export function formatDateTime(d: Date | string) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${toFa(bytes)} B`;
  if (bytes < 1024 * 1024) return `${toFa((bytes / 1024).toFixed(0))} KB`;
  return `${toFa((bytes / 1024 / 1024).toFixed(1))} MB`;
}

export function trackingCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `PA-${out}`;
}

export function splitList(value: string | null | undefined) {
  return (value ?? "")
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}
