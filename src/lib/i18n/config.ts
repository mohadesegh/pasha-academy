export const LOCALES = ["fa", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fa";
export const LOCALE_COOKIE = "lang";
export const THEME_STORAGE_KEY = "theme";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export const dirFor = (locale: Locale) => (locale === "fa" ? "rtl" : "ltr");

/** Localised number formatting (Persian digits for fa). */
export function formatNum(locale: Locale, n: number) {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(n);
}

export function formatUsd(locale: Locale, n: number) {
  return locale === "fa" ? `${formatNum(locale, n)} دلار` : `$${formatNum(locale, n)}`;
}

/** Fills `{name}` placeholders in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));
}
