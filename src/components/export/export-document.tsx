import { SITE } from "@/lib/constants";
import { siteUrl, toFa } from "@/lib/utils";
import { PrintToolbar } from "./print-toolbar";

const domain = () => siteUrl().replace(/^https?:\/\//, "");

/**
 * Brand watermark over the whole page. `position: fixed` makes the browser repeat it on every printed
 * page, and it is drawn with an <img> and text (not CSS backgrounds), so it survives the
 * "background graphics: off" print setting. It sits above the content at low opacity.
 */
function Watermark() {
  const label = `${SITE.name} · ${SITE.nameEn.toUpperCase()} · ${domain()}`;
  return (
    <div className="export-watermark" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-mark.png" alt="" className="export-watermark-logo" />
      <div className="export-watermark-grid">
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
    </div>
  );
}

/** A4 document shell shared by every export: toolbar (screen only), branded header, content, footer note. */
export function ExportDocument({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const date = new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date());
  return (
    <div className="export-root" dir="rtl" lang="fa">
      <PrintToolbar />
      <Watermark />
      <article className="export-page">
        <header className="flex items-center justify-between gap-6 border-b-2 border-[#c9953a] pb-5">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-mark.png" alt={SITE.name} className="h-16 w-16 object-contain" />
            <div>
              <p className="text-xl font-black text-[#06142a]">{SITE.name}</p>
              <p className="text-[11px] font-bold tracking-[0.2em] text-[#a7772c]" dir="ltr">{SITE.nameEn.toUpperCase()}</p>
            </div>
          </div>
          <div className="text-left text-xs leading-6 text-[#4b5563]" dir="ltr">
            <p className="font-bold text-[#06142a]">{domain()}</p>
            <p>{SITE.whatsappDisplay}</p>
            <p>{SITE.email}</p>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-black text-[#06142a]">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-[#4b5563]">{subtitle}</p>}
          </div>
          <p className="text-xs font-bold text-[#6b7280]">به‌روزرسانی: {date}</p>
        </div>

        <div className="mt-6">{children}</div>

        <footer className="mt-8 border-t border-[#e5e7eb] pt-4 text-[11px] leading-6 text-[#6b7280]">
          شهریه‌ها تقریبی و مربوط به دانشجویان بین‌المللی است و ممکن است تغییر کند. برای استعلام دقیق و دریافت مشاوره رایگان با
          {" "}{SITE.name}{" "}در واتساپ <bdi className="inline-block whitespace-nowrap" dir="ltr">{SITE.whatsappDisplay}</bdi> در تماس باشید. این سند توسط {SITE.name} (<bdi dir="ltr">{domain()}</bdi>) تهیه شده است.
        </footer>
      </article>
    </div>
  );
}

/** Formats USD amounts for the export tables (Persian digits and separator). */
export function usd(n: number | null | undefined) {
  if (n == null) return "—";
  return `${toFa(n.toLocaleString("en-US")).replace(/,/g, "٬")} دلار`;
}
