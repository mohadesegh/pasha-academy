import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { SITE } from "@/lib/constants";
import { siteUrl } from "@/lib/utils";
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
  themeColor: "#0b2340",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
