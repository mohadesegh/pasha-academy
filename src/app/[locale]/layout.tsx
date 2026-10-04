import { notFound } from "next/navigation";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { FloatingDock } from "@/components/layout/floating-dock";
import { LOCALES, dirFor, isLocale } from "@/lib/i18n/config";

// Only the two languages exist; each public page is prerendered once per language.
export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <LocaleProvider locale={locale}>
      {/* The root <html> is shared and defaults to Persian; switch it before anything paints. */}
      {locale !== "fa" && (
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang="${locale}";document.documentElement.dir="${dirFor(locale)}"` }} />
      )}
      {children}
      <FloatingDock />
    </LocaleProvider>
  );
}
