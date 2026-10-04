"use client";

import { useEffect } from "react";
import { ArrowRight, Download } from "lucide-react";

/** Screen-only bar above the document. With `?print=1` it opens the save-as-PDF dialog automatically. */
export function PrintToolbar() {
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("print")) return;
    // Wait for the Persian web font and images so the PDF never renders with fallback glyphs.
    let cancelled = false;
    Promise.all([document.fonts.ready, ...[...document.images].map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r))))]).then(() => {
      if (!cancelled) setTimeout(() => window.print(), 200);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="no-print sticky top-0 z-[60] flex items-center justify-between gap-3 border-b border-[#e5e7eb] bg-white/95 px-4 py-3 backdrop-blur">
      <button type="button" onClick={() => (history.length > 1 ? history.back() : window.close())} className="btn-outline btn-sm">
        <ArrowRight className="h-4 w-4" />
        بازگشت
      </button>
      <p className="hidden text-xs text-[#6b7280] sm:block">در پنجره چاپ، مقصد را روی «Save as PDF» بگذارید.</p>
      <button type="button" onClick={() => window.print()} className="btn-primary btn-sm">
        <Download className="h-4 w-4" />
        دانلود PDF
      </button>
    </div>
  );
}
