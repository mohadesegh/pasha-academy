"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { useLocale } from "@/components/i18n/locale-provider";
import { SITE } from "@/lib/constants";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const DISMISS_KEY = "pasha-install-dismissed";

/** Contact buttons + "install app" pill, pinned to the viewport on every page. */
export function FloatingDock() {
  const { t } = useLocale();
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {}
    if (standalone || dismissed) return;
    setShowInstall(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPrompt);
    };
    const onInstalled = () => setShowInstall(false);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!prompt) {
      setHint((h) => !h);
      return;
    }
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    if (outcome === "accepted") setShowInstall(false);
  }

  function dismiss() {
    setShowInstall(false);
    setHint(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  return (
    <>
      <div className="fixed bottom-5 right-4 z-40 flex flex-col gap-3 sm:right-5">
        <a
          href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(t.common.whatsappGeneral)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.dock.whatsapp}
          title={t.dock.whatsapp}
          className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition hover:scale-105"
        >
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40" aria-hidden />
          <WhatsAppIcon className="h-7 w-7" />
        </a>
        <a
          href={`https://instagram.com/${SITE.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.dock.instagram}
          title={t.dock.instagram}
          className="grid h-14 w-14 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_110%,#fdf497_0%,#fd5949_45%,#d6249f_60%,#285AEB_90%)] text-white shadow-lift transition hover:scale-105"
        >
          <InstagramIcon className="h-7 w-7" />
        </a>
      </div>

      {showInstall && (
        <div className="fixed bottom-5 left-4 z-40 sm:left-5">
          {hint && (
            <div role="status" className="mb-3 w-64 rounded-2xl bg-[#06142a] p-4 text-xs leading-6 text-white shadow-lift">
              <p className="flex items-center gap-2 font-black">
                <Share className="h-4 w-4 text-gold-300" />
                {t.dock.installTitle}
              </p>
              <p className="mt-1 text-white/75">{t.dock.installHint}</p>
            </div>
          )}
          <div className="flex items-center gap-1 rounded-full bg-[#06142a] py-2 pe-2 ps-2 text-white shadow-lift">
            <button
              type="button"
              onClick={dismiss}
              aria-label={t.dock.close}
              className="grid h-8 w-8 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <button type="button" onClick={install} className="flex items-center gap-2 rounded-full py-1 pe-1 ps-2 text-sm font-black">
              {t.dock.install}
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gold-400 text-[#06142a]">
                <Download className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
