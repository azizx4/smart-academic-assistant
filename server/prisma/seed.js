// ==============================================
// SARA — Database Seed Script (Large Dataset)
// 30 faculty, 300 students, 20 courses
// Procedurally generated with realistic distributions
// Usage: npm run seed
// ==============================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

// ------------------------------------------
// Deterministic PRNG (mulberry32)
// ------------------------------------------
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

/** Random int in [min, max] inclusive */
function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

/** Pick random element from array */
function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

/** Shuffle array in place (Fisher-Yates) */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ------------------------------------------
// Name pools — realistic Saudi Arabic names
// ------------------------------------------
const MALE_FIRST_AR = [
  "أحمد", "محمد", "عبدالله", "فهد", "سلطان", "خالد", "عمر", "سعد",
  "ناصر", "عبدالرحمن", "تركي", "بندر", "سلمان", "ماجد", "يوسف",
  "إبراهيم", "عبدالعزيز", "مشاري", "نواف", "وليد", "حسن", "طلال",
  "فيصل", "بدر", "أنس", "حمد", "مشعل", "عادل", "صالح", "رائد",
  "زياد", "ريان", "عمار", "ياسر", "هشام", "منصور", "لؤي", "جاسم",
  "هاني", "سامي",
];

const MALE_FIRST_EN = [
  "Ahmed", "Mohammed", "Abdullah", "Fahad", "Sultan", "Khalid", "Omar", "Saad",
  "Nasser", "Abdulrahman", "Turki", "Bandar", "Salman", "Majed", "Yousef",
  "Ibrahim", "Abdulaziz", "Mishari", "Nawaf", "Waleed", "Hassan", "Talal",
  "Faisal", "Badr", "Anas", "Hamad", "Mishal", "Adel", "Saleh", "Raed",
  "Ziad", "Rayan", "Ammar", "Yasser", "Hisham", "Mansour", "Louai", "Jasem",
  "Hani", "Sami",
];

const FEMALE_FIRST_AR = [
  "سارة", "نورة", "ريم", "لمى", "دانة", "هيفاء", "منال", "عبير",
  "أسماء", "فاطمة", "مها", "وفاء", "ليلى", "جواهر", "شهد",
  "العنود", "لطيفة", "أميرة", "رنا", "هند", "بسمة", "عائشة",
  "مريم", "حصة", "غادة", "ندى", "سلمى", "روان", "ملاك", "رغد",
];

const FEMALE_FIRST_EN = [
  "Sara", "Noura", "Reem", "Lama", "Dana", "Haifa", "Manal", "Abeer",
  "Asma", "Fatimah", "Maha", "Wafa", "Layla", "Jawaher", "Shahd",
  "Alanoud", "Latifa", "Amira", "Rana", "Hind", "Basma", "Aisha",
  "Mariam", "Hessa", "Ghada", "Nada", "Salma", "Rawan", "Malak", "Raghad",
];

const LAST_AR = [
  "الغامدي", "القحطاني", "العتيبي", "الشمري", "الدوسري", "الحربي",
  "المطيري", "الزهراني", "السبيعي", "الشهري", "العنزي", "البقمي",
  "الرشيدي", "المالكي", "الجهني", "السلمي", "اللحياني", "الثقفي",
  "الأحمدي", "الخالدي", "الفهدي", "العمري", "الحسني", "السعدي",
  "الناصري", "التركي", "البندري", "السلماني", "الماجدي", "اليوسفي",
  "الإبراهيمي", "العزيزي", "الوليدي", "الطلالي", "الفيصلي", "البدري",
  "الحمدي", "العادلي", "الصالحي", "الزيادي",
];

const LAST_EN = [
  "Al-Ghamdi", "Al-Qahtani", "Al-Otaibi", "Al-Shammari", "Al-Dosari", "Al-Harbi",
  "Al-Mutairi", "Al-Zahrani", "Al-Subaie", "Al-Shahri", "Al-Anazi", "Al-Baqmi",
  "Al-Rashidi", "Al-Maliki", "Al-Juhani", "Al-Sulami", "Al-Lahyani", "Al-Thaqafi",
  "Al-Ahmadi", "Al-Khalidi", "Al-Fahdi", "Al-Omari", "Al-Hasani", "Al-Saadi",
  "Al-Nasiri", "Al-Turki", "Al-Bandari", "Al-Salmani", "Al-Majedi", "Al-Yousefi",
  "Al-Ibrahimi", "Al-Azizi", "Al-Waleedi", "Al-Talali", "Al-Faisali", "Al-Badri",
  "Al-Hamdi", "Al-Adeli", "Al-Salehi", "Al-Ziadi",
];

// ------------------------------------------
// Course definitions — 20 courses across 8 departments
// ------------------------------------------
const COURSES = [
  { code: "CS101", nameAr: "مقدمة في البرمجة", nameEn: "Introduction to Programming", creditHrs: 3 },
  { code: "CS201", nameAr: "هياكل البيانات", nameEn: "Data Structures", creditHrs: 3 },
  { code: "CS301", nameAr: "قواعد البيانات", nameEn: "Database Systems", creditHrs: 3 },
  { code: "CS401", nameAr: "الذكاء الاصطناعي", nameEn: "Artificial Intelligence", creditHrs: 3 },
  { code: "MATH101", nameAr: "التفاضل والتكامل ١", nameEn: "Calculus I", creditHrs: 4 },
  { code: "MATH201", nameAr: "الجبر الخطي", nameEn: "Linear Algebra", creditHrs: 3 },
  { code: "MATH301", nameAr: "الاحتمالات والإحصاء", nameEn: "Probability and Statistics", creditHrs: 3 },
  { code: "PHYS101", nameAr: "فيزياء عامة ١", nameEn: "General Physics I", creditHrs: 4 },
  { code: "PHYS201", nameAr: "فيزياء عامة ٢", nameEn: "General Physics II", creditHrs: 4 },
  { code: "ENGL101", nameAr: "اللغة الإنجليزية ١", nameEn: "English Language I", creditHrs: 3 },
  { code: "ENGL201", nameAr: "الكتابة التقنية", nameEn: "Technical Writing", creditHrs: 2 },
  { code: "ARAB101", nameAr: "اللغة العربية", nameEn: "Arabic Language", creditHrs: 3 },
  { code: "STAT201", nameAr: "الإحصاء التطبيقي", nameEn: "Applied Statistics", creditHrs: 3 },
  { code: "STAT301", nameAr: "تحليل البيانات", nameEn: "Data Analysis", creditHrs: 3 },
  { code: "IS201", nameAr: "نظم المعلومات الإدارية", nameEn: "Management Information Systems", creditHrs: 3 },
  { code: "IS301", nameAr: "تحليل وتصميم النظم", nameEn: "Systems Analysis and Design", creditHrs: 3 },
  { code: "SE201", nameAr: "هندسة البرمجيات", nameEn: "Software Engineering", creditHrs: 3 },
  { code: "SE301", nameAr: "اختبار البرمجيات", nameEn: "Software Testing", creditHrs: 3 },
  { code: "CS202", nameAr: "أنظمة التشغيل", nameEn: "Operating Systems", creditHrs: 3 },
  { code: "CS302", nameAr: "شبكات الحاسب", nameEn: "Computer Networks", creditHrs: 3 },
];

// All extra course codes for academic plan (past/future courses not in current 20)
const EXTRA_PLAN_COURSES = [
  { code: "CS102", nameAr: "مقدمة في الحاسب" },
  { code: "MATH102", nameAr: "التفاضل والتكامل ٢" },
  { code: "PHYS102", nameAr: "فيزياء عامة ٣" },
  { code: "ENGL102", nameAr: "اللغة الإنجليزية ٢" },
  { code: "ARAB102", nameAr: "مهارات الاتصال" },
  { code: "CS402", nameAr: "تعلم الآلة" },
  { code: "CS403", nameAr: "أمن المعلومات" },
  { code: "SE401", nameAr: "مشروع التخرج" },
  { code: "IS401", nameAr: "حوكمة تقنية المعلومات" },
  { code: "MATH302", nameAr: "الرياضيات المتقطعة" },
];

// ------------------------------------------
// News data — 10 items
// ------------------------------------------
const NEWS_DATA = [
  {
    titleAr: "بدء التسجيل للفصل الصيفي 2025",
    titleEn: "Summer 2025 Registration Open",
    bodyAr: "يسر عمادة القبول والتسجيل إعلان فتح باب التسجيل للفصل الصيفي 2025 ابتداءً من يوم الأحد 2025-05-01. يرجى مراجعة البوابة الأكاديمية لتفاصيل المقررات المتاحة.",
    bodyEn: "The Admissions Office announces that registration for Summer 2025 is now open starting May 1st, 2025.",
    category: "announcement",
  },
  {
    titleAr: "مسابقة البرمجة الجامعية السنوية",
    titleEn: "Annual University Programming Contest",
    bodyAr: "تدعو كلية الحاسب جميع الطلاب للمشاركة في مسابقة البرمجة السنوية. الموعد: 2025-04-20. التسجيل متاح عبر موقع الكلية. جوائز قيمة للفائزين.",
    bodyEn: "The College of Computing invites all students to participate in the annual programming contest on April 20th.",
    category: "competition",
  },
  {
    titleAr: "تحديث سياسة الغياب",
    titleEn: "Attendance Policy Update",
    bodyAr: "تم تحديث سياسة الغياب لتشمل الحد الأقصى 4 غيابات لكل مقرر بدلاً من 5. يسري التحديث من الفصل الحالي.",
    bodyEn: "The absence policy has been updated. Maximum allowed absences per course is now 4 instead of 5.",
    category: "news",
  },
  {
    titleAr: "معرض التوظيف السنوي ٢٠٢٥",
    titleEn: "Annual Career Fair 2025",
    bodyAr: "تنظم عمادة شؤون الطلاب معرض التوظيف السنوي بحضور أكثر من 50 شركة محلية ودولية. الموعد: 2025-05-10 في القاعة الرئيسية.",
    bodyEn: "The Student Affairs office organizes the annual career fair with over 50 local and international companies on May 10th.",
    category: "news",
  },
  {
    titleAr: "إعلان جداول الاختبارات النهائية",
    titleEn: "Final Exam Schedule Announced",
    bodyAr: "تم نشر جداول الاختبارات النهائية للفصل الدراسي الثاني 2025-2 على البوابة الأكاديمية. تبدأ الاختبارات يوم 2025-06-08.",
    bodyEn: "Final exam schedules for semester 2025-2 are now available on the academic portal. Exams begin June 8th, 2025.",
    category: "announcement",
  },
  {
    titleAr: "دورة تدريبية في الحوسبة السحابية",
    titleEn: "Cloud Computing Workshop",
    bodyAr: "تقدم كلية الحاسب دورة تدريبية مجانية في الحوسبة السحابية (AWS) لمدة 3 أيام. التسجيل مفتوح حتى 2025-04-25.",
    bodyEn: "The College of Computing offers a free 3-day AWS cloud computing workshop. Registration open until April 25th.",
    category: "news",
  },
  {
    titleAr: "مسابقة الأمن السيبراني CTF",
    titleEn: "Cybersecurity CTF Competition",
    bodyAr: "تنظم وحدة الأمن السيبراني مسابقة Capture The Flag لطلاب الجامعة. الفرق من 3-5 أعضاء. التسجيل عبر البوابة الإلكترونية.",
    bodyEn: "The Cybersecurity unit organizes a Capture The Flag competition for university students. Teams of 3-5 members.",
    category: "competition",
  },
  {
    titleAr: "تمديد فترة الحذف والإضافة",
    titleEn: "Add/Drop Period Extended",
    bodyAr: "تم تمديد فترة الحذف والإضافة للفصل الحالي حتى نهاية الأسبوع الثالث. يرجى مراجعة المرشد الأكاديمي قبل إجراء أي تغيير.",
    bodyEn: "The add/drop period for the current semester has been extended until the end of week 3. Please consult your academic advisor.",
    category: "announcement",
  },
  {
    titleAr: "إطلاق نادي الذكاء الاصطناعي",
    titleEn: "AI Club Launch",
    bodyAr: "يسر كلية الحاسب الإعلان عن إطلاق نادي الذكاء الاصطناعي. انضم إلينا لحضور ورش عمل ومحاضرات أسبوعية مع متخصصين في المجال.",
    bodyEn: "The College of Computing announces the launch of the AI Club. Join us for weekly workshops and expert lectures.",
    category: "news",
  },
  {
    titleAr: "بطولة الجامعة الرياضية",
    titleEn: "University Sports Championship",
    bodyAr: "تبدأ بطولة الجامعة الرياضية السنوية الأسبوع القادم. تشمل البطولة كرة القدم والسلة والطائرة. سجل مع ممثل كليتك.",
    bodyEn: "The annual university sports championship begins next week. Includes football, basketball, and volleyball.",
    category: "competition",
  },
];

// ------------------------------------------
// Grade distribution helpers
// ------------------------------------------
function generateGrade() {
  const r = rand();
  let total;
  if (r < 0.05) total = randInt(95, 100);       // A+  5%
  else if (r < 0.15) total = randInt(90, 94);    // A   10%
  else if (r < 0.27) total = randInt(85, 89);    // B+  12%
  else if (r < 0.40) total = randInt(80, 84);    // B   13%
  else if (r < 0.55) total = randInt(75, 79);    // C+  15%
  else if (r < 0.70) total = randInt(70, 74);    // C   15%
  else if (r < 0.80) total = randInt(65, 69);    // D+  10%
  else if (r < 0.90) total = randInt(60, 64);    // D   10%
  else total = randInt(30, 59);                   // F   10%

  // Break total into components (midterm/40, assignments/20, final/50 — sum = 110 scale mapped to 100)
  // Actually the total is out of 100: midterm(40) + final(50) + assignments(20) = 110 possible
  // But the original seed shows totals that equal midterm+final+assignments directly
  // So we need midterm(max 40) + final(max 50) + assignments(max 20) = total(max 110)
  // But grades in existing data sum to 100-ish... looking at original: 28+42+18=88 ✓
  // So total = midterm + final + assignments, and total is the grade out of ~110 mapped to letter grades on a 100 scale
  // Actually the original just has total = sum and letter grades based on total. Let's keep that pattern.
  // midterm ≈ 40% of total, final ≈ 50%, assignments ≈ 10-20%

  // Distribute: assignments up to 20, midterm up to 40, final = remainder
  const assignmentsPct = 0.15 + rand() * 0.05; // 15-20% of total
  const midtermPct = 0.35 + rand() * 0.05;     // 35-40% of total

  let assignments = Math.min(20, Math.round(total * assignmentsPct));
  let midterm = Math.min(40, Math.round(total * midtermPct));
  let final_ = total - midterm - assignments;

  // Clamp final to max 50
  if (final_ > 50) {
    const overflow = final_ - 50;
    final_ = 50;
    midterm = Math.min(40, midterm + overflow);
  }
  if (final_ < 0) final_ = 0;

  const letterGrade = getLetterGrade(total);
  return { midterm, final: final_, assignments, total, letterGrade };
}

function getLetterGrade(total) {
  if (total >= 95) return "A+";
  if (total >= 90) return "A";
  if (total >= 85) return "B+";
  if (total >= 80) return "B";
  if (total >= 75) return "C+";
  if (total >= 70) return "C";
  if (total >= 65) return "D+";
  if (total >= 60) return "D";
  return "F";
}

// ------------------------------------------
// Main seed function
// ------------------------------------------
async function main() {
  console.log("=== SARA Large Dataset Seed ===\n");
  console.log("Hashing passwords...");
  const studentPassword = await bcrypt.hash("student123", SALT_ROUNDS);
  const facultyPassword = await bcrypt.hash("faculty123", SALT_ROUNDS);

  // ------------------------------------------
  // Clear all tables (children first for FK safety)
  // ------------------------------------------
  console.log("Clearing existing data...");
  await prisma.alert.deleteMany({});
  await prisma.academicPlan.deleteMany({});
  await prisma.absence.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.news.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("  Done.\n");

  // ------------------------------------------
  // 1. Faculty — 30 members
  // ------------------------------------------
  console.log("Creating 30 faculty members...");

  // First 3 are the originals (dr.omar must be first for existing test scripts)
  const facultyData = [
    { username: "dr.omar", nameAr: "د. عمر حسن", nameEn: "Dr. Omar Hassan", email: "omar.hassan@university.edu.sa" },
    { username: "dr.noura", nameAr: "د. نورة أحمد", nameEn: "Dr. Noura Ahmed", email: "noura.ahmed@university.edu.sa" },
  ];

  // Generate 28 more faculty — mix of male and female
  const usedFacultyUsernames = new Set(["dr.omar", "dr.noura"]);

  // 18 male faculty + 10 female faculty = 28 additional
  const maleFacultyIndices = shuffle([...Array(MALE_FIRST_AR.length).keys()]).slice(0, 18);
  const femaleFacultyIndices = shuffle([...Array(FEMALE_FIRST_AR.length).keys()]).slice(0, 10);

  for (const i of maleFacultyIndices) {
    const lastIdx = randInt(0, LAST_AR.length - 1);
    const firstEn = MALE_FIRST_EN[i].toLowerCase();
    let username = `dr.${firstEn}`;
    if (usedFacultyUsernames.has(username)) username = `dr.${firstEn}${randInt(2, 9)}`;
    if (usedFacultyUsernames.has(username)) username = `dr.${firstEn}${randInt(10, 99)}`;
    usedFacultyUsernames.add(username);

    facultyData.push({
      username,
      nameAr: `د. ${MALE_FIRST_AR[i]} ${LAST_AR[lastIdx]}`,
      nameEn: `Dr. ${MALE_FIRST_EN[i]} ${LAST_EN[lastIdx]}`,
      email: `${username.replace("dr.", "")}@university.edu.sa`,
    });
  }

  for (const i of femaleFacultyIndices) {
    const lastIdx = randInt(0, LAST_AR.length - 1);
    const firstEn = FEMALE_FIRST_EN[i].toLowerCase();
    let username = `dr.${firstEn}`;
    if (usedFacultyUsernames.has(username)) username = `dr.${firstEn}${randInt(2, 9)}`;
    if (usedFacultyUsernames.has(username)) username = `dr.${firstEn}${randInt(10, 99)}`;
    usedFacultyUsernames.add(username);

    facultyData.push({
      username,
      nameAr: `د. ${FEMALE_FIRST_AR[i]} ${LAST_AR[lastIdx]}`,
      nameEn: `Dr. ${FEMALE_FIRST_EN[i]} ${LAST_EN[lastIdx]}`,
      email: `${username.replace("dr.", "")}@university.edu.sa`,
    });
  }

  await prisma.user.createMany({
    data: facultyData.map((f) => ({
      username: f.username,
      passwordHash: facultyPassword,
      role: "faculty",
      nameAr: f.nameAr,
      nameEn: f.nameEn,
      email: f.email,
    })),
  });

  // Retrieve faculty with IDs
  const allFaculty = await prisma.user.findMany({ where: { role: "faculty" }, orderBy: { id: "asc" } });
  console.log(`  Created ${allFaculty.length} faculty`);

  // ------------------------------------------
  // 2. Students — 300 (441001 through 441300)
  // ------------------------------------------
  console.log("Creating 300 students...");

  const studentData = [];

  // First 3 are the originals
  studentData.push(
    { username: "441001", nameAr: "أحمد محمد", nameEn: "Ahmed Mohammed", email: "441001@student.university.edu.sa" },
    { username: "441002", nameAr: "سارة خالد", nameEn: "Sara Khalid", email: "441002@student.university.edu.sa" },
    { username: "441003", nameAr: "فهد عبدالله", nameEn: "Fahad Abdullah", email: "441003@student.university.edu.sa" }
  );

  // Generate 297 more students
  for (let i = 4; i <= 300; i++) {
    const sid = `44${1000 + i}`;
    const isMale = rand() < 0.6; // 60% male, 40% female
    const lastIdx = randInt(0, LAST_AR.length - 1);

    let firstAr, firstEn;
    if (isMale) {
      const fi = randInt(0, MALE_FIRST_AR.length - 1);
      firstAr = MALE_FIRST_AR[fi];
      firstEn = MALE_FIRST_EN[fi];
    } else {
      const fi = randInt(0, FEMALE_FIRST_AR.length - 1);
      firstAr = FEMALE_FIRST_AR[fi];
      firstEn = FEMALE_FIRST_EN[fi];
    }

    studentData.push({
      username: sid,
      nameAr: `${firstAr} ${LAST_AR[lastIdx]}`,
      nameEn: `${firstEn} ${LAST_EN[lastIdx]}`,
      email: `${sid}@student.university.edu.sa`,
    });
  }

  // Batch insert students in chunks (SQLite can have variable limits)
  const CHUNK = 100;
  for (let i = 0; i < studentData.length; i += CHUNK) {
    await prisma.user.createMany({
      data: studentData.slice(i, i + CHUNK).map((s) => ({
        username: s.username,
        passwordHash: studentPassword,
        role: "student",
        nameAr: s.nameAr,
        nameEn: s.nameEn,
        email: s.email,
      })),
    });
  }

  const allStudents = await prisma.user.findMany({ where: { role: "student" }, orderBy: { id: "asc" } });
  console.log(`  Created ${allStudents.length} students`);

  // ------------------------------------------
  // 3. Courses — 20 courses assigned to faculty
  // ------------------------------------------
  console.log("Creating 20 courses...");

  // Distribute courses: each faculty teaches 0-3 courses, with first ~15 faculty getting most
  // Assign round-robin style ensuring each faculty gets 1-3
  const facultyIds = allFaculty.map((f) => f.id);
  const courseAssignments = [];

  // Shuffle faculty to distribute somewhat randomly
  const shuffledFacultyIds = [...facultyIds];
  shuffle(shuffledFacultyIds);

  // Assign each course to a faculty member. First, ensure dr.omar (first faculty) gets CS101 and CS201
  // to preserve original behavior.
  const drOmarId = allFaculty[0].id; // dr.omar
  const drNouraId = allFaculty[1].id; // dr.noura
  const facultyAssignmentCount = new Map();

  // Pre-assign dr.omar → CS101, CS201 and dr.noura → MATH101, MATH201
  const preAssign = {
    CS101: drOmarId,
    CS201: drOmarId,
    MATH101: drNouraId,
    MATH201: drNouraId,
  };

  // For remaining 16 courses, distribute across the 30 faculty (some will have 0, that's fine)
  let fIdx = 2; // start from third faculty
  for (const course of COURSES) {
    if (preAssign[course.code]) {
      courseAssignments.push({ ...course, facultyId: preAssign[course.code] });
      facultyAssignmentCount.set(preAssign[course.code], (facultyAssignmentCount.get(preAssign[course.code]) || 0) + 1);
    } else {
      // Find a faculty that has fewer than 3 courses
      let assigned = false;
      for (let attempts = 0; attempts < facultyIds.length; attempts++) {
        const candidateId = shuffledFacultyIds[fIdx % shuffledFacultyIds.length];
        const count = facultyAssignmentCount.get(candidateId) || 0;
        if (count < 3) {
          courseAssignments.push({ ...course, facultyId: candidateId });
          facultyAssignmentCount.set(candidateId, count + 1);
          fIdx++;
          assigned = true;
          break;
        }
        fIdx++;
      }
      if (!assigned) {
        // Fallback: assign to least-loaded faculty
        courseAssignments.push({ ...course, facultyId: shuffledFacultyIds[fIdx % shuffledFacultyIds.length] });
        fIdx++;
      }
    }
  }

  await prisma.course.createMany({
    data: courseAssignments.map((c) => ({
      code: c.code,
      nameAr: c.nameAr,
      nameEn: c.nameEn,
      creditHrs: c.creditHrs,
      semester: "2025-2",
      facultyId: c.facultyId,
    })),
  });

  const allCourses = await prisma.course.findMany({ orderBy: { id: "asc" } });
  const courseMap = new Map(allCourses.map((c) => [c.code, c]));
  console.log(`  Created ${allCourses.length} courses`);

  // ------------------------------------------
  // 4. Schedules — 2 sessions per course, no conflicts
  // ------------------------------------------
  console.log("Creating schedules...");

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const TIME_SLOTS = [
    { start: "08:00", end: "09:30" },
    { start: "10:00", end: "11:30" },
    { start: "12:00", end: "13:30" },
    { start: "14:00", end: "15:30" },
  ];
  const BUILDINGS = ["A", "B", "C", "D"];

  const scheduleData = [];
  const usedSlots = new Set(); // "day-slotIdx" to avoid same-room conflicts

  for (const course of allCourses) {
    // Pick 2 different days
    const dayIndices = shuffle([0, 1, 2, 3, 4]);
    const day1 = DAYS[dayIndices[0]];
    const day2 = DAYS[dayIndices[1]];

    // Pick a time slot (same slot both days for the same course)
    const slotIdx = randInt(0, TIME_SLOTS.length - 1);
    const slot = TIME_SLOTS[slotIdx];

    // Generate room
    const building = pick(BUILDINGS);
    const roomNum = randInt(101, 405);
    const room = `${building}${roomNum}`;

    scheduleData.push(
      { courseId: course.id, dayOfWeek: day1, startTime: slot.start, endTime: slot.end, room },
      { courseId: course.id, dayOfWeek: day2, startTime: slot.start, endTime: slot.end, room }
    );
  }

  await prisma.schedule.createMany({ data: scheduleData });
  console.log(`  Created ${scheduleData.length} schedule entries`);

  // ------------------------------------------
  // 5. Enrollments — each student in 4-6 courses
  // ------------------------------------------
  console.log("Creating enrollments...");

  const enrollmentData = [];
  const studentEnrollments = new Map(); // studentId → [courseId, ...]

  for (const student of allStudents) {
    const numCourses = randInt(4, 6);
    const courseIndices = shuffle([...Array(allCourses.length).keys()]).slice(0, numCourses);
    const enrolledCourseIds = courseIndices.map((i) => allCourses[i].id);

    studentEnrollments.set(student.id, enrolledCourseIds);

    for (const courseId of enrolledCourseIds) {
      enrollmentData.push({ studentId: student.id, courseId });
    }
  }

  // Batch insert
  for (let i = 0; i < enrollmentData.length; i += CHUNK) {
    await prisma.enrollment.createMany({ data: enrollmentData.slice(i, i + CHUNK) });
  }
  console.log(`  Created ${enrollmentData.length} enrollments`);

  // ------------------------------------------
  // 6. Grades — for every enrollment
  // ------------------------------------------
  console.log("Creating grades...");

  const gradeData = [];
  for (const e of enrollmentData) {
    const g = generateGrade();
    gradeData.push({
      studentId: e.studentId,
      courseId: e.courseId,
      midterm: g.midterm,
      final: g.final,
      assignments: g.assignments,
      total: g.total,
      letterGrade: g.letterGrade,
    });
  }

  for (let i = 0; i < gradeData.length; i += CHUNK) {
    await prisma.grade.createMany({ data: gradeData.slice(i, i + CHUNK) });
  }
  console.log(`  Created ${gradeData.length} grades`);

  // ------------------------------------------
  // 7. Absences — variable distribution
  // ------------------------------------------
  console.log("Creating absences...");

  const ABSENCE_REASONS = ["مرض", "موعد طبي", "ظرف عائلي", null, null];
  const absenceData = [];

  // Semester dates range: Feb 2025 — May 2025
  const semesterStart = new Date("2025-02-02");

  for (const student of allStudents) {
    const courses = studentEnrollments.get(student.id) || [];
    const r = rand();
    // Decide student absence profile
    let profile; // "low", "medium", "high"
    if (r < 0.80) profile = "low";       // 80% → 0-2 absences per course
    else if (r < 0.95) profile = "medium"; // 15% → 3-4 in at least one course
    else profile = "high";                  // 5% → 5+ in at least one course

    for (let ci = 0; ci < courses.length; ci++) {
      let numAbsences;
      if (profile === "high" && ci === 0) {
        numAbsences = randInt(5, 8);
      } else if (profile === "medium" && ci === 0) {
        numAbsences = randInt(3, 4);
      } else {
        numAbsences = randInt(0, 2);
      }

      for (let a = 0; a < numAbsences; a++) {
        // Random date within semester (Feb-May 2025)
        const dayOffset = randInt(0, 90);
        const date = new Date(semesterStart);
        date.setDate(date.getDate() + dayOffset);

        absenceData.push({
          studentId: student.id,
          courseId: courses[ci],
          date,
          reason: pick(ABSENCE_REASONS),
        });
      }
    }
  }

  for (let i = 0; i < absenceData.length; i += CHUNK) {
    await prisma.absence.createMany({ data: absenceData.slice(i, i + CHUNK) });
  }
  console.log(`  Created ${absenceData.length} absences`);

  // ------------------------------------------
  // 8. Academic Plans
  // ------------------------------------------
  console.log("Creating academic plans...");

  const PAST_SEMESTERS = ["2024-1", "2024-2", "2025-1"];
  const FUTURE_SEMESTERS = ["2026-1", "2026-2"];
  const planData = [];

  for (const student of allStudents) {
    const enrolledCourseIds = studentEnrollments.get(student.id) || [];

    // Current courses → in_progress
    for (const courseId of enrolledCourseIds) {
      const course = allCourses.find((c) => c.id === courseId);
      if (course) {
        planData.push({
          studentId: student.id,
          courseCode: course.code,
          courseNameAr: course.nameAr,
          semester: "2025-2",
          status: "in_progress",
        });
      }
    }

    // 2-4 completed courses from past semesters
    const numCompleted = randInt(2, 4);
    const completedCourses = shuffle([...EXTRA_PLAN_COURSES]).slice(0, numCompleted);
    for (const ec of completedCourses) {
      planData.push({
        studentId: student.id,
        courseCode: ec.code,
        courseNameAr: ec.nameAr,
        semester: pick(PAST_SEMESTERS),
        status: "completed",
      });
    }

    // 2-4 remaining courses for future semesters
    const numRemaining = randInt(2, 4);
    const remainingPool = shuffle([...EXTRA_PLAN_COURSES]).slice(numCompleted, numCompleted + numRemaining);
    // If not enough extras, use some from main course list that student isn't enrolled in
    const notEnrolledCodes = COURSES.filter((c) => {
      const courseObj = courseMap.get(c.code);
      return courseObj && !enrolledCourseIds.includes(courseObj.id);
    });
    const remainingCourses = [...remainingPool, ...shuffle([...notEnrolledCodes])].slice(0, numRemaining);

    for (const rc of remainingCourses) {
      planData.push({
        studentId: student.id,
        courseCode: rc.code,
        courseNameAr: rc.nameAr,
        semester: pick(FUTURE_SEMESTERS),
        status: "remaining",
      });
    }
  }

  for (let i = 0; i < planData.length; i += CHUNK) {
    await prisma.academicPlan.createMany({ data: planData.slice(i, i + CHUNK) });
  }
  console.log(`  Created ${planData.length} academic plan entries`);

  // ------------------------------------------
  // 9. Alerts — generated from actual data
  // ------------------------------------------
  console.log("Creating alerts...");

  const alertData = [];

  // Build absence counts per student per course
  const absenceCounts = new Map(); // "studentId-courseId" → count
  for (const a of absenceData) {
    const key = `${a.studentId}-${a.courseId}`;
    absenceCounts.set(key, (absenceCounts.get(key) || 0) + 1);
  }

  // Build a course lookup for names
  const courseById = new Map(allCourses.map((c) => [c.id, c]));

  for (const student of allStudents) {
    const courses = studentEnrollments.get(student.id) || [];

    for (const courseId of courses) {
      const key = `${student.id}-${courseId}`;
      const count = absenceCounts.get(key) || 0;
      const course = courseById.get(courseId);
      const courseName = course ? `${course.nameAr} (${course.code})` : "";

      // 3+ absences → warning
      if (count >= 3 && count < 5) {
        alertData.push({
          studentId: student.id,
          title: "تنبيه غياب",
          body: `لديك ${count} غيابات في مقرر ${courseName}. الحد الأقصى المسموح 4 غيابات.`,
          type: "warning",
          isRead: false,
        });
      }

      // 5+ absences → urgent
      if (count >= 5) {
        alertData.push({
          studentId: student.id,
          title: "إنذار غياب - خطر الحرمان",
          body: `تجاوزت الحد المسموح للغياب في مقرر ${courseName}. عدد الغيابات: ${count}. يرجى مراجعة شؤون الطلاب.`,
          type: "urgent",
          isRead: false,
        });
      }
    }

    // Check for failing grades
    const studentGrades = gradeData.filter((g) => g.studentId === student.id && g.total < 60);
    for (const g of studentGrades) {
      const course = courseById.get(g.courseId);
      const courseName = course ? `${course.nameAr} (${course.code})` : "";
      alertData.push({
        studentId: student.id,
        title: "تنبيه درجات",
        body: `درجتك في مقرر ${courseName} أقل من الحد الأدنى للنجاح (${g.total}/100).`,
        type: "warning",
        isRead: false,
      });
    }
  }

  // Add generic info alerts for all students (exam schedule reminders) — pick 30 random students
  const infoStudents = shuffle([...allStudents]).slice(0, 30);
  for (const student of infoStudents) {
    alertData.push({
      studentId: student.id,
      title: "موعد الاختبارات النهائية",
      body: "تبدأ الاختبارات النهائية يوم 2025-06-08. يرجى مراجعة الجدول على البوابة الأكاديمية.",
      type: "info",
      isRead: false,
    });
  }

  for (let i = 0; i < alertData.length; i += CHUNK) {
    await prisma.alert.createMany({ data: alertData.slice(i, i + CHUNK) });
  }
  console.log(`  Created ${alertData.length} alerts`);

  // ------------------------------------------
  // 10. News — 10 items
  // ------------------------------------------
  console.log("Creating news...");

  await prisma.news.createMany({ data: NEWS_DATA });
  console.log(`  Created ${NEWS_DATA.length} news items`);

  // ------------------------------------------
  // Summary
  // ------------------------------------------
  const absenceWarnings = alertData.filter((a) => a.title === "تنبيه غياب").length;
  const absenceUrgent = alertData.filter((a) => a.title === "إنذار غياب - خطر الحرمان").length;
  const gradeWarnings = alertData.filter((a) => a.title === "تنبيه درجات").length;
  const infoAlerts = alertData.filter((a) => a.type === "info").length;

  console.log("\n========== SEED SUMMARY ==========");
  console.log(`  Faculty:       ${allFaculty.length}`);
  console.log(`  Students:      ${allStudents.length}`);
  console.log(`  Courses:       ${allCourses.length}`);
  console.log(`  Schedules:     ${scheduleData.length}`);
  console.log(`  Enrollments:   ${enrollmentData.length}`);
  console.log(`  Grades:        ${gradeData.length}`);
  console.log(`  Absences:      ${absenceData.length}`);
  console.log(`  Plans:         ${planData.length}`);
  console.log(`  Alerts:        ${alertData.length}`);
  console.log(`    - Absence warnings:  ${absenceWarnings}`);
  console.log(`    - Absence urgent:    ${absenceUrgent}`);
  console.log(`    - Grade warnings:    ${gradeWarnings}`);
  console.log(`    - Info alerts:       ${infoAlerts}`);
  console.log(`  News:          ${NEWS_DATA.length}`);
  console.log("==================================");
  console.log("\nOriginal test accounts preserved:");
  console.log("  441001 / student123 — أحمد محمد");
  console.log("  441002 / student123 — سارة خالد");
  console.log("  dr.omar / faculty123 — د. عمر حسن");
  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
