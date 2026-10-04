import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd, organizationLd, websiteLd } from "@/components/seo/json-ld";
import { localeFrom } from "@/lib/i18n/server";

// No cookies are read here (the language comes from the [locale] segment) so marketing pages are prerendered;
// the header asks /api/auth/me for the login state on the client.
export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = await localeFrom(params);
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        پرش به محتوای اصلی
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter locale={locale} />
      <JsonLd data={[organizationLd(), websiteLd()]} />
    </>
  );
}
