import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// Only private (foundation) universities are offered.
// Tuition figures are approximate starting prices (USD / year) for international students
// and should be reviewed by the Pasha Academy team each academic year.
const universities = [
  {
    slug: "bilkent-university",
    name: "دانشگاه بیلکنت",
    nameEn: "Bilkent University",
    city: "آنکارا",
    type: "PRIVATE",
    founded: 1984,
    students: 13000,
    tuitionFrom: 12000,
    languages: "انگلیسی",
    programs: "مهندسی کامپیوتر,مهندسی برق,اقتصاد,مدیریت,معماری,موسیقی,حقوق",
    summary: "نخستین دانشگاه خصوصی (وقفی) ترکیه با آموزش تمام انگلیسی و بورسیه‌های سخاوتمندانه.",
    description:
      "دانشگاه بیلکنت نخستین دانشگاه غیرانتفاعی (وقفی) ترکیه است و در پژوهش و رتبه‌بندی‌های جهانی عملکرد درخشانی دارد.\n\nآموزش تمام انگلیسی است و دانشجویان ممتاز می‌توانند از بورسیه کامل شهریه و حتی کمک‌هزینه ماهانه بهره‌مند شوند.",
    website: "https://w3.bilkent.edu.tr",
    color: "#0b2340",
    featured: true,
  },
  {
    slug: "koc-university",
    name: "دانشگاه کوچ",
    nameEn: "Koç University",
    city: "استانبول",
    type: "PRIVATE",
    founded: 1993,
    students: 8000,
    tuitionFrom: 20000,
    languages: "انگلیسی",
    programs: "پزشکی,حقوق,مهندسی,اقتصاد,مدیریت,علوم انسانی,پرستاری",
    summary: "دانشگاه خصوصی برتر ترکیه در رتبه‌بندی‌های جهانی با پردیس مدرن در سارییر.",
    description:
      "دانشگاه کوچ با حمایت بنیاد خانواده کوچ تاسیس شده و از نظر کیفیت آموزش و پژوهش در صدر دانشگاه‌های خصوصی ترکیه قرار دارد.\n\nپردیس روملی‌فنری آن در شمال استانبول قرار دارد و بورسیه‌های متنوعی برای دانشجویان بین‌المللی ارائه می‌کند.",
    website: "https://www.ku.edu.tr",
    color: "#1c2b4b",
    featured: true,
  },
  {
    slug: "sabanci-university",
    name: "دانشگاه سابانجی",
    nameEn: "Sabancı University",
    city: "استانبول",
    type: "PRIVATE",
    founded: 1994,
    students: 5000,
    tuitionFrom: 18000,
    languages: "انگلیسی",
    programs: "مهندسی کامپیوتر,مهندسی مکاترونیک,مهندسی مواد,مدیریت,اقتصاد,علوم اجتماعی",
    summary: "دانشگاهی میان‌رشته‌ای و پژوهش‌محور با آموزش تمام انگلیسی.",
    description:
      "دانشگاه سابانجی با رویکرد آموزشی میان‌رشته‌ای شناخته می‌شود؛ دانشجویان سال اول را به صورت عمومی گذرانده و سپس رشته خود را انتخاب می‌کنند.\n\nپردیس توزلا در بخش آسیایی استانبول قرار دارد.",
    website: "https://www.sabanciuniv.edu",
    color: "#10335c",
    featured: false,
  },
  {
    slug: "istanbul-medipol-university",
    name: "دانشگاه مدیپل استانبول",
    nameEn: "Istanbul Medipol University",
    city: "استانبول",
    type: "PRIVATE",
    founded: 2009,
    students: 35000,
    tuitionFrom: 5000,
    languages: "ترکی,انگلیسی",
    programs: "پزشکی,دندانپزشکی,داروسازی,فیزیوتراپی,پرستاری,مهندسی,حقوق",
    summary: "دانشگاه خصوصی متمرکز بر علوم پزشکی با شبکه بیمارستان‌های مدیپل.",
    description:
      "دانشگاه مدیپل با پشتوانه گروه بیمارستانی مدیپل، در رشته‌های پزشکی، دندانپزشکی و علوم سلامت شناخته شده است.\n\nپذیرش بدون آزمون ورودی و بر اساس سوابق تحصیلی انجام می‌شود و بورسیه‌های ابتدای ثبت‌نام قابل دریافت است.",
    website: "https://www.medipol.edu.tr",
    color: "#003b71",
    featured: true,
  },
  {
    slug: "bahcesehir-university",
    name: "دانشگاه باهچه‌شهیر",
    nameEn: "Bahçeşehir University",
    city: "استانبول",
    type: "PRIVATE",
    founded: 1998,
    students: 25000,
    tuitionFrom: 6000,
    languages: "انگلیسی,ترکی",
    programs: "مهندسی نرم‌افزار,معماری,طراحی داخلی,مدیریت بازرگانی,روانشناسی,پزشکی,ارتباطات",
    summary: "دانشگاه خصوصی بین‌المللی در سواحل بسفر با شعب در چند کشور.",
    description:
      "دانشگاه باهچه‌شهیر (BAU) پردیس اصلی خود را در بشیکتاش و در ساحل بسفر دارد و با دانشگاه‌های متعدد اروپایی و آمریکایی برنامه تبادل دانشجو اجرا می‌کند.\n\nبرنامه‌های انگلیسی زبان متنوع و بورسیه ورودی از مزایای آن است.",
    website: "https://bau.edu.tr",
    color: "#004a8f",
    featured: false,
  },
  {
    slug: "yeditepe-university",
    name: "دانشگاه یدی‌تپه",
    nameEn: "Yeditepe University",
    city: "استانبول",
    type: "PRIVATE",
    founded: 1996,
    students: 20000,
    tuitionFrom: 7000,
    languages: "انگلیسی,ترکی",
    programs: "پزشکی,دندانپزشکی,داروسازی,مهندسی,حقوق,هنرهای زیبا,اقتصاد",
    summary: "دانشگاه خصوصی با پردیس بزرگ در بخش آسیایی استانبول و دانشکده‌های پزشکی معتبر.",
    description:
      "دانشگاه یدی‌تپه در منطقه آتاشهیر استانبول قرار دارد و به‌خصوص در رشته‌های پزشکی و دندانپزشکی برای دانشجویان ایرانی محبوب است.\n\nپردیس بزرگ و امکانات ورزشی و رفاهی از ویژگی‌های آن است.",
    website: "https://yeditepe.edu.tr",
    color: "#0a4d8c",
    featured: false,
  },
  {
    slug: "altinbas-university",
    name: "دانشگاه آلتین‌باش",
    nameEn: "Altınbaş University",
    city: "استانبول",
    type: "PRIVATE",
    founded: 2008,
    students: 12000,
    tuitionFrom: 4500,
    languages: "انگلیسی,ترکی",
    programs: "دندانپزشکی,داروسازی,مهندسی کامپیوتر,حقوق,مدیریت,معماری",
    summary: "دانشگاه خصوصی با شهریه مناسب و بورسیه‌های گسترده برای دانشجویان خارجی.",
    description:
      "دانشگاه آلتین‌باش در منطقه باغجلار و مجیدیه‌کوی استانبول پردیس دارد و گزینه‌ای اقتصادی برای رشته‌های مهندسی و علوم پزشکی است.\n\nبرنامه‌های انگلیسی زبان و تخفیف‌های شهریه برای دانشجویان بین‌المللی ارائه می‌کند.",
    website: "https://www.altinbas.edu.tr",
    color: "#8a1c24",
    featured: false,
  },
  {
    slug: "istinye-university",
    name: "دانشگاه ایستینیه",
    nameEn: "İstinye University",
    city: "استانبول",
    type: "PRIVATE",
    founded: 2015,
    students: 15000,
    tuitionFrom: 5500,
    languages: "انگلیسی,ترکی",
    programs: "پزشکی,دندانپزشکی,داروسازی,پرستاری,مهندسی,روانشناسی",
    summary: "دانشگاه جوان و پویا با تمرکز بر علوم سلامت و بیمارستان‌های آموزشی لیو.",
    description:
      "دانشگاه ایستینیه با پشتوانه گروه بیمارستان‌های MLP Care (Liv و Medical Park) فرصت‌های کارآموزی بالینی گسترده‌ای فراهم می‌کند.\n\nپذیرش بر اساس معدل و بدون آزمون ورودی انجام می‌شود.",
    website: "https://www.istinye.edu.tr",
    color: "#1b5e7a",
    featured: false,
  },
];

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
    const saved = await db.university.upsert({ where: { slug: u.slug }, update: u, create: u });
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
