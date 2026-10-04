import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SEED_UNIVERSITIES } from "../src/data/universities";
import { UNIVERSITY_LOGOS } from "../src/lib/university-logos";

const db = new PrismaClient();
async function bootstrap() {
  if (!await db.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } })) {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12 || password === "Admin@12345") {
      throw new Error("First deployment requires ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 12 characters.");
    }
    if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
      throw new Error("ADMIN_EMAIL already belongs to a non-admin; choose a different email.");
    }
    await db.user.create({ data: { name: "مدیر سیستم", email, passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" } });
  }
  // No demo users or sample tuition prices. Redeploys never overwrite admin edits.
  for (const university of SEED_UNIVERSITIES) {
    await db.university.upsert({
      where: { slug: university.slug }, update: {},
      create: { ...university, logo: UNIVERSITY_LOGOS[university.slug] ?? null },
    });
  }
  console.log("Production database initialized; existing data preserved.");
}
bootstrap().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
