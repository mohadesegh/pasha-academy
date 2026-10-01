import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { SITE } from "@/lib/constants";
import { siteUrl } from "@/lib/utils";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { FloatingDock } from "@/components/layout/floating-dock";
import { THEME_STORAGE_KEY, dirFor } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "تحصیل در ترکیه",
    "ادامه تحصیل در ترکیه",
    "پذیرش دانشگاه ترکیه",
    "اقامت تحصیلی ترکیه",
    "خوابگاه دانشجویی استانبول",
    "دانشگاه‌های ترکیه",
    "پاشا آکادمی",
    "study in Turkey",
  ],
  authors: [{ name: SITE.nameEn }],
  creator: SITE.nameEn,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#f6efe3",
  width: "device-width",
  initialScale: 1,
};

// Runs before paint so a saved dark theme never flashes light.
const themeScript = `try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={dirFor(locale)} className={vazir.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <LocaleProvider locale={locale}>
          {children}
          <FloatingDock />
        </LocaleProvider>
      </body>
    </html>
  );
}
