import type { Metadata } from "next";
import { Compass, HeartHandshake, Eye, Target } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { StatsBand } from "@/components/home/sections";
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "درباره پاشا آکادمی",
  description:
    "پاشا آکادمی با تیمی از مشاوران ایرانی و ترک در استانبول، دانشجویان را در مسیر ادامه تحصیل، اقامت و اسکان در ترکیه همراهی می‌کند.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: Eye, title: "شفافیت", text: "همه هزینه‌ها، مراحل و وضعیت پرونده از ابتدا برای شما روشن است." },
  { icon: HeartHandshake, title: "همراهی", text: "از ایران تا ترکیه و تا پایان سال اول تحصیل کنار شما هستیم." },
  { icon: Target, title: "تخصص", text: "تیمی که سال‌ها در دانشگاه‌ها و ادارات ترکیه تجربه دارد." },
  { icon: Compass, title: "مسیر درست", text: "پیشنهاد بر اساس آینده شغلی شما، نه صرفا پذیرش سریع." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="درباره پاشا آکادمی"
        lead="ما باور داریم هر دانشجویی لایق یک شروع مطمئن است. پاشا آکادمی پلی است میان آرزوی تحصیل در خارج و زندگی واقعی دانشجویی در ترکیه."
        crumbs={[{ name: "درباره ما", href: "/about" }]}
      />
      <section className="py-24">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal className="prose-fa">
            <h2>داستان ما</h2>
            <p>
              پاشا آکادمی توسط گروهی از فارغ‌التحصیلان ایرانی دانشگاه‌های ترکیه تاسیس شد؛ کسانی که خودشان سختی‌های پیدا کردن
              دانشگاه مناسب، گرفتن اقامت و پیدا کردن خوابگاه را تجربه کرده بودند.
            </p>
            <p>
              امروز با دفتر مرکزی در استانبول و همکاران در آنکارا و ازمیر، صدها دانشجو را هر سال در مسیر ادامه تحصیل
              همراهی می‌کنیم؛ از مقطع کارشناسی تا دکتری، در دانشگاه‌های دولتی و خصوصی.
            </p>
            <p>
              با پنل آنلاین پاشا آکادمی، دانشجویان و نمایندگان ما می‌توانند مدارک را آپلود کنند و وضعیت پرونده را در هر لحظه
              ببینند — بدون تماس‌های مکرر و بدون سردرگمی.
            </p>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-4">
            {VALUES.map((v, i) => (
              <StaggerItem key={v.title} className={`card p-6 ${i % 2 ? "translate-y-8" : ""}`}>
                <v.icon className="h-8 w-8 text-crimson-500" />
                <h3 className="mt-4 font-extrabold text-navy-950">{v.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{v.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      <div className="pb-24"><StatsBand /></div>
      <JsonLd data={breadcrumbLd([{ name: "خانه", path: "/" }, { name: "درباره ما", path: "/about" }])} />
    </>
  );
}
