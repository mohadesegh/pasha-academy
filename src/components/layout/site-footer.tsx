import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/ui/brand-icons";
import { Logo } from "@/components/ui/logo";
import { SITE } from "@/lib/constants";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = dictionaries[locale];
  const explore = [
    { href: "/programs", label: t.nav.programs },
    { href: "/scholarships", label: t.nav.scholarships },
    { href: "/universities", label: t.nav.universities },
    { href: "/services", label: t.nav.services },
    { href: "/dormitory", label: t.nav.dormitory },
  ];
  const quick = [
    { href: "/agents", label: t.nav.agents },
    { href: "/login?as=student", label: t.nav.studentLogin },
    { href: "/login?as=agent", label: t.nav.agentLogin },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white/75">
      <div className="bg-pattern absolute inset-0 opacity-50" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-gold-600 via-gold-300 to-gold-600" aria-hidden />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light markClassName="h-14 w-14" />
          <p className="mt-5 text-sm leading-7">{t.footer.about}</p>
          <div className="mt-6 flex gap-3">
            <a href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-gold-400 hover:text-navy-950">
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-gold-400 hover:text-navy-950">
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h2 className="mb-5 font-extrabold text-white">{t.footer.services}</h2>
          <ul className="space-y-3 text-sm">
            {explore.map((l) => (
              <li key={l.href}><Link href={l.href} className="transition hover:text-gold-300">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-5 font-extrabold text-white">{t.footer.quick}</h2>
          <ul className="space-y-3 text-sm">
            {quick.map((l) => (
              <li key={l.href}><Link href={l.href} className="transition hover:text-gold-300">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-5 font-extrabold text-white">{t.footer.contact}</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-gold-400" />{locale === "fa" ? SITE.address : SITE.addressEn}</li>
            <li className="flex gap-3"><MessageCircle className="h-5 w-5 shrink-0 text-gold-400" /><a href={`https://wa.me/${SITE.whatsapp}`} dir="ltr">{SITE.whatsappDisplay}</a></li>
            <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-gold-400" /><a href={`tel:${SITE.phone.replace(/\s/g, "")}`} dir="ltr">{SITE.phone}</a></li>
            <li className="flex gap-3"><Mail className="h-5 w-5 shrink-0 text-gold-400" /><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.nameEn}. {t.footer.rights}</p>
          <p className="text-white/50">Istanbul · Türkiye</p>
        </div>
      </div>
    </footer>
  );
}
