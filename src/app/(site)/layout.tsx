import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd, organizationLd, websiteLd } from "@/components/seo/json-ld";

// No cookies are read here so marketing pages can be statically generated;
// the header asks /api/auth/me for the login state on the client.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
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
      <SiteFooter />
      <JsonLd data={[organizationLd(), websiteLd()]} />
    </>
  );
}
