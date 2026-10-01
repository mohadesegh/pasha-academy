import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.nameEn}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    dir: "rtl",
    lang: "fa",
    background_color: "#fdfbf7",
    theme_color: "#0b2340",
    icons: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
  };
}
