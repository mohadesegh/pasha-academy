import Link from "next/link";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { InstagramIcon } from "@/components/ui/brand-icons";
import { Logo } from "@/components/ui/logo";
import { SITE } from "@/lib/constants";
import { SERVICES } from "@/data/content";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white/75">
      <div className="bg-pattern absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-crimson-500 via-gold-400 to-turquoise-500" aria-hidden />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-5 text-sm leading-7">{SITE.description}</p>
          <div className="mt-6 flex gap-3">
            <a href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="اینستاگرام" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-gold-400 hover:text-navy-950">
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="واتساپ" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-gold-400 hover:text-navy-950">
              <Send className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h2 className="mb-5 font-extrabold text-white">خدمات</h2>
          <ul className="space-y-3 text-sm">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="transition hover:text-gold-300">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-5 font-extrabold text-white">دسترسی سریع</h2>
          <ul className="space-y-3 text-sm">
            <li><Link href="/universities" className="transition hover:text-gold-300">معرفی دانشگاه‌های ترکیه</Link></li>
            <li><Link href="/dormitory" className="transition hover:text-gold-300">درخواست خوابگاه</Link></li>
            <li><Link href="/agents" className="transition hover:text-gold-300">پورتال نمایندگان (ساب‌ایجنت)</Link></li>
            <li><Link href="/login" className="transition hover:text-gold-300">ورود به پنل</Link></li>
            <li><Link href="/about" className="transition hover:text-gold-300">درباره پاشا آکادمی</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-5 font-extrabold text-white">ارتباط با ما</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-gold-400" />{SITE.address}</li>
            <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-gold-400" /><a href={`tel:${SITE.phone.replace(/\s/g, "")}`} dir="ltr">{SITE.phone}</a></li>
            <li className="flex gap-3"><Mail className="h-5 w-5 shrink-0 text-gold-400" /><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.nameEn}. تمامی حقوق محفوظ است.</p>
          <p className="text-white/50">استانبول · آنکارا · ازمیر</p>
        </div>
      </div>
    </footer>
  );
}
