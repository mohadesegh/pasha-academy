import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UNIVERSITY_LOGOS } from "../src/lib/university-logos";
import { SEED_UNIVERSITIES as universities, samplePrograms } from "../src/data/universities";

const db = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@pasha-academy.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";

  await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "مدیر سیستم",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });

  await db.user.upsert({
    where: { email: "agent@demo.com" },
    update: {},
    create: {
      name: "نماینده نمونه",
      email: "agent@demo.com",
      phone: "09120000000",
      passwordHash: await bcrypt.hash("Agent@12345", 10),
      role: "AGENT",
      agentStatus: "APPROVED",
      companyName: "موسسه آموزشی نمونه",
      city: "تهران",
    },
  });

  await db.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      name: "دانشجوی نمونه",
      email: "student@demo.com",
      phone: "09350000000",
      passwordHash: await bcrypt.hash("Student@12345", 10),
      role: "STUDENT",
    },
  });

  // No longer offered: hide them from the site (unpublished, not deleted, so existing applications keep their link).
  await db.university.updateMany({ where: { slug: { in: ["koc-university", "sabanci-university"] } }, data: { published: false } });

  let programCount = 0;
  for (const u of universities) {
    const data = { ...u, logo: UNIVERSITY_LOGOS[u.slug] ?? null };
    const saved = await db.university.upsert({ where: { slug: u.slug }, update: data, create: data });
    // Only sample rows are replaced, so real programs entered by the admin survive a re-seed.
    await db.program.deleteMany({ where: { universityId: saved.id, sample: true } });
    const rows = samplePrograms(u);
    await db.program.createMany({ data: rows.map((r) => ({ ...r, universityId: saved.id })) });
    programCount += rows.length;
  }

  console.log(
    `Seeded admin (${adminEmail}), demo agent, demo student, ${universities.length} universities and ${programCount} SAMPLE programs.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
