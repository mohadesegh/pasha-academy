"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/config";
import { dictionaries, type Dict } from "@/lib/i18n/dictionaries";

const LocaleContext = createContext<{ locale: Locale; t: Dict }>({ locale: "fa", t: dictionaries.fa });

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={{ locale, t: dictionaries[locale] }}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
