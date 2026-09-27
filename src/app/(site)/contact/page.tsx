import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/ui/brand-icons";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal } from "@/components/ui/motion";
import { LeadForm } from "@/components/forms/lead-form";
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "تماس با ما و مشاوره رایگان",
  description: "برای مشاوره رایگان تحصیل، اقامت و خوابگاه در ترکیه با پاشا آکادمی در تماس باشید. پاسخگویی در واتساپ، تلفن و ایمیل.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const items = [
    { icon: Phone, label: "تلفن", value: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, "")}`, ltr: true },
    { icon: MessageCircle, label: "واتساپ", value: SITE.phone, href: `https://wa.me/${SITE.whatsapp}`, ltr: true },
    { icon: Mail, label: "ایمیل", value: SITE.email, href: `mailto:${SITE.email}`, ltr: true },
    { icon: InstagramIcon, label: "اینستاگرام", value: `@${SITE.instagram}`, href: `https://instagram.com/${SITE.instagram}`, ltr: true },
    { icon: MapPin, label: "آدرس دفتر", value: SITE.address },
    { icon: Clock, label: "ساعات کاری", value: "دوشنبه تا شنبه، ۹ تا ۱۸ (به وقت استانبول)" },
  ];
  return (
    <>
      <PageHero
        title="تماس با پاشا آکادمی"
        lead="سوالی دارید یا می‌خواهید مسیر تحصیلتان را شروع کنید؟ فرم زیر را پر کنید یا مستقیم با ما تماس بگیرید."
        crumbs={[{ name: "تماس با ما", href: "/contact" }]}
      />
      <section className="py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <Reveal className="space-y-4">
            {items.map((it) => {
              const content = (
                <>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy-950 text-gold-300"><it.icon className="h-5 w-5" /></span>
                  <span>
                    <span className="block text-xs text-muted">{it.label}</span>
                    <span className="block font-extrabold text-navy-950" dir={it.ltr ? "ltr" : undefined}>{it.value}</span>
                  </span>
                </>
              );
              return it.href ? (
                <a key={it.label} href={it.href} target={it.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                  {content}
                </a>
              ) : (
                <div key={it.label} className="card flex items-center gap-4 p-5">{content}</div>
              );
            })}
          </Reveal>
          <Reveal delay={0.1} className="card p-6 sm:p-10">
            <h2 id="consult" className="scroll-mt-28 text-2xl font-black text-navy-950">درخواست مشاوره رایگان</h2>
            <p className="mb-8 mt-2 text-muted">کارشناسان ما حداکثر تا ۲۴ ساعت آینده با شما تماس می‌گیرند.</p>
            <LeadForm />
          </Reveal>
        </div>
      </section>
      <JsonLd
        data={[
          breadcrumbLd([{ name: "خانه", path: "/" }, { name: "تماس با ما", path: "/contact" }]),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "تماس با پاشا آکادمی",
            mainEntity: { "@type": "Organization", name: SITE.name, telephone: SITE.phone, email: SITE.email },
          },
        ]}
      />
    </>
  );
}
