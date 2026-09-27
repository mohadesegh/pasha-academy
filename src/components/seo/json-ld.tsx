import { SITE } from "@/lib/constants";
import { siteUrl } from "@/lib/utils";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here except for "</script>", which we escape.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": siteUrl("/#organization"),
    name: SITE.name,
    alternateName: SITE.nameEn,
    url: siteUrl("/"),
    logo: siteUrl("/icon.svg"),
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.phone,
    address: { "@type": "PostalAddress", streetAddress: SITE.addressEn, addressLocality: "Istanbul", addressCountry: "TR" },
    sameAs: [`https://instagram.com/${SITE.instagram}`],
    areaServed: ["IR", "TR"],
    knowsLanguage: ["fa", "tr", "en"],
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": siteUrl("/#website"),
    name: SITE.name,
    url: siteUrl("/"),
    inLanguage: "fa-IR",
    publisher: { "@id": siteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl("/universities")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: siteUrl(it.path) })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
