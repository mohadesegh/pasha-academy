import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// Tuition figures are approximate starting prices (USD / year) for international students
// and should be reviewed by the Pasha Academy team each academic year.
const universities = [
  {
    slug: "istanbul-university",
    name: "دانشگاه استانبول",
    nameEn: "Istanbul University",
    city: "استانبول",
    type: "PUBLIC",
    founded: 1453,
    students: 70000,
    tuitionFrom: 700,
    languages: "ترکی,انگلیسی",
    programs: "پزشکی,دندانپزشکی,حقوق,اقتصاد,مهندسی,ادبیات,علوم سیاسی,داروسازی",
    summary: "قدیمی‌ترین و یکی از معتبرترین دانشگاه‌های دولتی ترکیه در قلب تاریخی استانبول.",
    description:
      "دانشگاه استانبول ریشه در مدرسه‌ای دارد که پس از فتح استانبول در سال ۱۴۵۳ تاسیس شد و امروز یکی از بزرگ‌ترین مراکز علمی ترکیه است. پردیس اصلی آن در منطقه بایزید و در کنار بازار بزرگ قرار دارد.\n\nدانشکده‌های پزشکی Cerrahpaşa و Çapa از شناخته‌شده‌ترین دانشکده‌های پزشکی منطقه هستند. پذیرش در این دانشگاه برای دانشجویان خارجی عمدتا از طریق آزمون YÖS یا مدارک معادل مانند SAT انجام می‌شود.",
    website: "https://www.istanbul.edu.tr",
    color: "#7a1f2b",
    featured: true,
  },
  {
    slug: "istanbul-technical-university",
    name: "دانشگاه فنی استانبول (ITU)",
    nameEn: "Istanbul Technical University",
    city: "استانبول",
    type: "PUBLIC",
    founded: 1773,
    students: 40000,
    tuitionFrom: 900,
    languages: "انگلیسی,ترکی",
    programs: "مهندسی عمران,معماری,مهندسی کامپیوتر,مهندسی برق,مهندسی مکانیک,مهندسی هوافضا,مهندسی کشتی",
    summary: "برترین دانشگاه فنی و مهندسی ترکیه با سابقه‌ای بیش از دو قرن.",
    description:
      "دانشگاه فنی استانبول (İTÜ) از قدیمی‌ترین دانشگاه‌های فنی جهان است و در رشته‌های مهندسی و معماری جایگاه ممتازی دارد. پردیس اصلی Ayazağa در منطقه مسلک قرار دارد.\n\nبسیاری از برنامه‌های این دانشگاه به زبان انگلیسی یا ۳۰٪ انگلیسی ارائه می‌شوند و فارغ‌التحصیلان آن در صنایع بزرگ ترکیه و اروپا جذب می‌شوند.",
    website: "https://www.itu.edu.tr",
    color: "#1b3f8f",
    featured: true,
  },
  {
    slug: "middle-east-technical-university",
    name: "دانشگاه فنی خاورمیانه (ODTÜ)",
    nameEn: "Middle East Technical University",
    city: "آنکارا",
    type: "PUBLIC",
    founded: 1956,
    students: 30000,
    tuitionFrom: 900,
    languages: "انگلیسی",
    programs: "مهندسی کامپیوتر,مهندسی برق,مهندسی شیمی,معماری,فیزیک,اقتصاد,مدیریت",
    summary: "دانشگاه تمام انگلیسی زبان در آنکارا و یکی از بهترین دانشگاه‌های پژوهشی منطقه.",
    description:
      "دانشگاه فنی خاورمیانه (METU / ODTÜ) با زبان آموزشی تمام انگلیسی و پردیس بسیار بزرگ و سرسبز در آنکارا شناخته می‌شود. این دانشگاه در رتبه‌بندی‌های جهانی همواره جزو بهترین دانشگاه‌های ترکیه است.\n\nپذیرش دانشجویان خارجی بر اساس آزمون‌های بین‌المللی مانند SAT و مدرک زبان انجام می‌شود.",
    website: "https://www.metu.edu.tr",
    color: "#b01e2d",
    featured: true,
  },
  {
    slug: "bogazici-university",
    name: "دانشگاه بغازیچی",
    nameEn: "Boğaziçi University",
    city: "استانبول",
    type: "PUBLIC",
    founded: 1863,
    students: 16000,
    tuitionFrom: 900,
    languages: "انگلیسی",
    programs: "مهندسی صنایع,مهندسی کامپیوتر,اقتصاد,مدیریت,روانشناسی,زبان‌شناسی,ریاضی",
    summary: "دانشگاهی با پردیس رویایی مشرف به تنگه بسفر و آموزش تمام انگلیسی.",
    description:
      "دانشگاه بغازیچی بر پایه کالج رابرت، نخستین کالج آمریکایی خارج از آمریکا، بنا شده است. پردیس جنوبی آن با چشم‌انداز تنگه بسفر یکی از زیباترین پردیس‌های دانشگاهی جهان است.\n\nآموزش در تمام رشته‌ها به زبان انگلیسی است و رقابت برای پذیرش بسیار بالاست.",
    website: "https://www.bogazici.edu.tr",
    color: "#0f5c8c",
    featured: true,
  },
  {
    slug: "hacettepe-university",
    name: "دانشگاه حاجت‌تپه",
    nameEn: "Hacettepe University",
    city: "آنکارا",
    type: "PUBLIC",
    founded: 1967,
    students: 50000,
    tuitionFrom: 800,
    languages: "ترکی,انگلیسی",
    programs: "پزشکی,دندانپزشکی,داروسازی,پرستاری,مهندسی,علوم پایه,هنرهای زیبا",
    summary: "قطب علوم پزشکی و سلامت ترکیه با بیمارستان‌های آموزشی مجهز.",
    description:
      "دانشگاه حاجت‌تپه در آنکارا به‌ویژه در رشته‌های پزشکی و علوم سلامت شناخته‌شده است و مجموعه بیمارستانی بزرگی در اختیار دارد.\n\nدانشکده پزشکی انگلیسی زبان این دانشگاه یکی از مقاصد محبوب دانشجویان بین‌المللی است.",
    website: "https://www.hacettepe.edu.tr",
    color: "#5b1a6e",
    featured: false,
  },
  {
    slug: "ankara-university",
    name: "دانشگاه آنکارا",
    nameEn: "Ankara University",
    city: "آنکارا",
    type: "PUBLIC",
    founded: 1946,
    students: 60000,
    tuitionFrom: 700,
    languages: "ترکی",
    programs: "حقوق,علوم سیاسی,پزشکی,دامپزشکی,زبان و ادبیات,کشاورزی,داروسازی",
    summary: "نخستین دانشگاه جمهوری ترکیه و مرکز آموزش زبان ترکی تومر.",
    description:
      "دانشگاه آنکارا نخستین دانشگاهی است که پس از تاسیس جمهوری ترکیه ایجاد شد. مرکز TÖMER این دانشگاه از مراکز شناخته‌شده آموزش زبان ترکی برای خارجیان است.\n\nدانشکده‌های حقوق و علوم سیاسی آن سابقه‌ای طولانی در تربیت نخبگان ترکیه دارند.",
    website: "https://www.ankara.edu.tr",
    color: "#1f4e79",
    featured: false,
  },
  {
    slug: "ege-university",
    name: "دانشگاه اژه",
    nameEn: "Ege University",
    city: "ازمیر",
    type: "PUBLIC",
    founded: 1955,
    students: 55000,
    tuitionFrom: 600,
    languages: "ترکی,انگلیسی",
    programs: "پزشکی,دندانپزشکی,مهندسی,کشاورزی,ارتباطات,علوم پایه",
    summary: "بزرگ‌ترین دانشگاه دولتی ازمیر در ساحل دریای اژه.",
    description:
      "دانشگاه اژه در شهر ساحلی و زیبای ازمیر قرار دارد و از دانشگاه‌های قدیمی و پرجمعیت ترکیه است. هزینه زندگی در ازمیر نسبت به استانبول پایین‌تر است.\n\nدانشکده پزشکی و بیمارستان این دانشگاه از مراکز درمانی مهم منطقه اژه است.",
    website: "https://ege.edu.tr",
    color: "#0e6f77",
    featured: false,
  },
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

  for (const u of universities) {
    await db.university.upsert({ where: { slug: u.slug }, update: u, create: u });
  }

  console.log(`Seeded admin (${adminEmail}), demo agent, demo student and ${universities.length} universities.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
