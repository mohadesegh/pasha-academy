import "server-only";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import { dictionaries } from "./dictionaries";

/**
 * The language comes from the `[locale]` route segment (the middleware rewrites every public URL
 * to `/fa/...` or `/en/...` based on the `lang` cookie). Nothing here reads cookies, so the public
 * pages can be prerendered and served statically.
 */
export async function localeFrom(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

export async function getDict(params: Promise<{ locale: string }>) {
  const locale = await localeFrom(params);
  return { locale, t: dictionaries[locale] };
}
