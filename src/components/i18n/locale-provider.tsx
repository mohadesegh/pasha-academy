"use client";

import { createContext, useContext, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { dirFor, type Locale } from "@/lib/i18n/config";
import { dictionaries, type Dict } from "@/lib/i18n/dictionaries";

const LocaleContext = createContext<{ locale: Locale; t: Dict }>({ locale: "fa", t: dictionaries.fa });

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  // Keep the shared <html> element in sync when the language changes without a full reload.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dirFor(locale);
  }, [locale]);
  return (
    <LocaleContext.Provider value={{ locale, t: dictionaries[locale] }}>
      {/* Honour the OS "reduce motion" setting for every framer-motion animation. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
