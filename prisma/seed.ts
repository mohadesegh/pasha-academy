import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UNIVERSITY_LOGOS } from "../src/lib/university-logos";
import { SEED_UNIVERSITIES as universities } from "../src/data/universities";

const db = new PrismaClient();

// ---------------------------------------------------------------------------
// SAMPLE program catalogue. Every row is stored with `sample: true` and shown with a
// "sample" label on the site until the real price list is imported from the admin panel.
// Prices are derived from each university's starting tuition and are NOT real quotes.
// ---------------------------------------------------------------------------
type Catalog = { name: string; nameEn: string; faculty: string; degree: string; years: number; factor: number; medical?: boolean };

const CATALOG: Catalog[] = [
  { name: "پزشکی", nameEn: "Medicine", faculty: "دانشکده پزشکی", degree: "BACHELOR", years: 6, factor: 3.2, medical: true },
  { name: "دندانپزشکی", nameEn: "Dentistry", faculty: "دانشکده دندانپزشکی", degree: "BACHELOR", years: 5, factor: 2.6, medical: true },
  { name: "داروسازی", nameEn: "Pharmacy", faculty: "دانشکده داروسازی", degree: "BACHELOR", years: 5, factor: 1.8, medical: true },
  { name: "پرستاری", nameEn: "Nursing", faculty: "دانشکده علوم سلامت", degree: "BACHELOR", years: 4, factor: 0.9, medical: true },
  { name: "فیزیوتراپی", nameEn: "Physiotherapy", faculty: "دانشکده علوم سلامت", degree: "BACHELOR", years: 4, factor: 1.0, medical: true },
  { name: "مهندسی کامپیوتر", nameEn: "Computer Engineering", faculty: "دانشکده مهندسی", degree: "BACHELOR", years: 4, factor: 1.2 },
  { name: "مهندسی نرم‌افزار", nameEn: "Software Engineering", faculty: "دانشکده مهندسی", degree: "BACHELOR", years: 4, factor: 1.2 },
  { name: "مهندسی هوش مصنوعی", nameEn: "Artificial Intelligence Engineering", faculty: "دانشکده مهندسی", degree: "BACHELOR", years: 4, factor: 1.3 },
  { name: "مهندسی برق و الکترونیک", nameEn: "Electrical & Electronics Engineering", faculty: "دانشکده مهندسی", degree: "BACHELOR", years: 4, factor: 1.1 },
  { name: "مهندسی صنایع", nameEn: "Industrial Engineering", faculty: "دانشکده مهندسی", degree: "BACHELOR", years: 4, factor: 1.0 },
  { name: "معماری", nameEn: "Architecture", faculty: "دانشکده معماری و طراحی", degree: "BACHELOR", years: 4, factor: 1.1 },
  { name: "طراحی داخلی", nameEn: "Interior Design", faculty: "دانشکده معماری و طراحی", degree: "BACHELOR", years: 4, factor: 0.9 },
  { name: "مدیریت بازرگانی", nameEn: "Business Administration", faculty: "دانشکده اقتصاد و مدیریت", degree: "BACHELOR", years: 4, factor: 0.9 },
  { name: "تجارت بین‌الملل", nameEn: "International Trade", faculty: "دانشکده اقتصاد و مدیریت", degree: "BACHELOR", years: 4, factor: 0.85 },
  { name: "روانشناسی", nameEn: "Psychology", faculty: "دانشکده علوم انسانی", degree: "BACHELOR", years: 4, factor: 1.0 },
  { name: "حقوق", nameEn: "Law", faculty: "دانشکده حقوق", degree: "BACHELOR", years: 4, factor: 1.2 },
  { name: "برنامه‌نویسی کامپیوتر", nameEn: "Computer Programming", faculty: "آموزشکده فنی", degree: "ASSOCIATE", years: 2, factor: 0.5 },
  { name: "تصویربرداری پزشکی", nameEn: "Medical Imaging", faculty: "آموزشکده علوم سلامت", degree: "ASSOCIATE", years: 2, factor: 0.55, medical: true },
  { name: "پروتز دندان", nameEn: "Dental Prosthetics", faculty: "آموزشکده علوم سلامت", degree: "ASSOCIATE", years: 2, factor: 0.55, medical: true },
  { name: "مدیریت کسب‌وکار (MBA)", nameEn: "MBA", faculty: "تحصیلات تکمیلی", degree: "MASTER", years: 2, factor: 0.75 },
  { name: "مهندسی کامپیوتر (ارشد)", nameEn: "Computer Engineering (MSc)", faculty: "تحصیلات تکمیلی", degree: "MASTER", years: 2, factor: 0.8 },
  { name: "روانشناسی بالینی (ارشد)", nameEn: "Clinical Psychology (MSc)", faculty: "تحصیلات تکمیلی", degree: "MASTER", years: 2, factor: 0.8 },
  { name: "مدیریت (دکتری)", nameEn: "Management (PhD)", faculty: "تحصیلات تکمیلی", degree: "PHD", years: 4, factor: 0.9 },
];

// Universities that already offer their own merit scholarships don't get Pasha scholarship seats.
const NO_PASHA_SEATS = new Set(["koc-university", "sabanci-university", "bilkent-university"]);
const ENGLISH_ONLY = new Set(["koc-university", "sabanci-university", "bilkent-university"]);
const MEDICAL = new Set(["istanbul-medipol-university", "istinye-university", "altinbas-university", "yeditepe-university", "koc-university", "bahcesehir-university"]);

const round50 = (n: number) => Math.round(n / 50) * 50;

function samplePrograms(u: { slug: string; tuitionFrom: number | null }) {
  const base = Math.max(u.tuitionFrom ?? 5000, 3000);
  const rows = [];
  let i = 0;
  for (const c of CATALOG) {
    if (c.medical && !MEDICAL.has(u.slug)) continue;
    for (const language of ENGLISH_ONLY.has(u.slug) ? ["EN"] : ["EN", "TR"]) {
      i++;
      const tuition = round50(base * c.factor * (language === "TR" ? 0.85 : 1));
      const prepFee = round50(base * 0.6);
      const termTotal = tuition * c.years + prepFee;
      rows.push({
        name: `${c.name} (${language === "EN" ? "انگلیسی" : "ترکی"})`,
        nameEn: c.nameEn,
        faculty: c.faculty,
        degree: c.degree,
        language,
        durationYears: c.years,
        tuition,
        cashTotal: round50(termTotal * 0.85),
        deposit: 1000,
        prepFee,
        // Roughly every other program gets a Pasha 100% scholarship seat (about 60% cheaper overall).
        scholarshipPrice: !NO_PASHA_SEATS.has(u.slug) && i % 2 === 0 ? round50(termTotal * 0.4) : null,
        sample: true,
      });
    }
  }
  return rows;
}

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
