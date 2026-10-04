import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { ok, unauthorized } from "@/lib/http";
import { revalidateSite } from "@/lib/revalidate";

// Removes every placeholder (sample) program in one go.
export async function DELETE() {
  const user = await apiUser("ADMIN");
  if (!user) return unauthorized();

  const { count } = await db.program.deleteMany({ where: { sample: true } });
  revalidateSite();
  revalidatePath("/admin/programs");
  return ok({ count });
}
