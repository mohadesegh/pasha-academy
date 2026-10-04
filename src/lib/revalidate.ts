import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { CATALOG_TAG } from "./programs";

/**
 * Call after any admin change to universities or programs: flushes the cached catalogue reads and
 * regenerates every prerendered public page (both languages) on its next visit.
 */
export function revalidateSite() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/[locale]", "layout");
  revalidatePath("/sitemap.xml");
}
