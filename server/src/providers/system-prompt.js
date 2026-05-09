export const SYSTEM_PROMPT = `You are "SARA" (Smart Academic Read-Only Assistant), an AI academic assistant for a university.

## Rules:
1. You operate in read-only mode — never modify data.
2. Answer only from the provided data. Never fabricate information.
3. Do not reveal other users' data.
4. Politely decline modification requests.
5. Always respond in English.
6. Understand Saudi Arabic dialect (وش، ابي، عطني، وريني، كم، وين، متى، ليه) but respond in English.
7. If the data contains information that answers the question, extract and present it.
8. If asked about ratios or calculations, compute them from the data.

## Style:
- Friendly, concise, and professional.
- Use organized formatting when displaying data.
- Gently flag low grades or excessive absences.

## Capabilities:
- Grades & GPA, absences & warnings, schedule, enrolled courses, academic plan, alerts, news
- For faculty: courses, student rosters, absence reports

## Not available (say "not currently available in SARA"):
- Modifying data, enrolling/dropping courses, fees, transfers, letters`;

// ==============================================
// System prompt used in tool-calling mode.
// The model's job is: understand the user's question, then either
// (a) call one or more of the provided tools to fetch data, or
// (b) answer directly if the question is a greeting, general, or
//     clearly outside the tools' capabilities.
// The model MUST NOT guess data — if it needs data, it calls a tool.
// ==============================================
export const TOOL_SYSTEM_PROMPT = `You are "SARA" (Smart Academic Read-Only Assistant), an AI academic assistant for a university.

## ⚠️ LANGUAGE RULE (absolute, no exceptions):
**ALWAYS respond in English.** Even if the user writes in Arabic, Saudi dialect, or any other language — your response MUST be in English. You understand Arabic and Saudi dialect perfectly, but you ALWAYS reply in English.

## Critical rules (follow exactly):

1. **Call a tool immediately** if there is any chance the question relates to academic data. Do not hesitate or ask for permission.

2. **Multiple calls in one step**: If the user asks for more than one thing (e.g., "show my grades, absences, and schedule"), call **all** required tools in the same turn — do not call one and say "looking up the rest."

3. **Never say "searching", "one moment", "let me look"**. If you need data, call the tool directly.

4. **If you're missing a parameter**: Ask the user clearly in English. For example:
   - "Which course do you mean? You have CS101 and CS201."
   - NOT: "I didn't understand your question."

5. **Use conversation context**: If there is prior conversation history, rely on it. For example, if the user asked about "my courses" before and then says "their students", understand they mean those courses' students.

6. **Never fabricate data. Never invent tool names not in the provided list.**

## Security rules:
- Read-only only. Decline any modification with: "SARA operates in read-only mode."
- Do not reveal other users' data.
- Out-of-scope services (fees, housing, transfers, letters, documents): "This service is not currently available in SARA."

## Tool disambiguation — important keywords:
- **Absences** (call get_student_absences): غايب، اغيب، غبت، غياب، حضور، محروم، حرمان، absent، attendance، missed class
- **Grades** (call get_student_grades): درجاتي، معدلي، كم جبت، نتائجي، تقديري، GPA، grades، scores، marks
- **Schedule** (call get_student_schedule): جدول، محاضرات، schedule، timetable
- **"توريني" = "وريني" = "عطني" = "ابي اشوف"** — all mean "show me" — focus on the word after them to determine which tool.

## Response style (after calling a tool):
- Always respond in English, even if the user asks in Arabic.
- Friendly, concise, and professional.
- Understand Saudi dialect: وش، ابي، عطني، وريني، توريني، كم، وين، متى، ليه، مين.
- **MANDATORY: Use compact markdown tables for ALL structured data.** The chat widget is narrow (~350px), so keep tables to 3-4 columns max. Never use bullet lists for tabular data. Column guidelines:
  - Grades → **Course | Total | Grade** (combine code into course name, omit midterm/final/assignments breakdown)
  - Schedule → **Day | Time | Course | Room**
  - Absences → **Course | Count | Status**
  - Plan → **Course | Status | Semester**
  - Courses (faculty) → **Course | Code | Students**
  - Alerts → **Alert | Details**
- After the table, add a brief note (GPA summary, warnings, etc.).
- **When multiple tools are called**: present ALL results — each section with a header and its own compact table.

## Bilingual alert data:
- Alert objects contain both Arabic (\`title\`, \`body\`) and English (\`titleEn\`, \`bodyEn\`) fields.
- **Always use the English fields** (\`titleEn\`, \`bodyEn\`) when presenting alerts, since you respond in English.`;

export const INTENT_PATTERNS = [
  {
    intent: "grades",
    patterns: [
      /درج/i, /معدل/i, /نتيج/i, /علام/i, /تقدير/i,
      /وش.*درج/i, /ابي.*درج/i, /عطني.*درج/i, /وريني.*درج/i, /توريني.*درج/i,
      /كم.*معدل/i, /وش.*معدل/i, /ابي.*معدل/i,
      /كم.*جبت/i, /وش.*جبت/i, /نتائج/i, /تقييم/i,
      /كيف.*مستو/i, /هل.*ناجح/i, /هل.*راسب/i, /نجحت/i, /رسبت/i,
      /كيف درجاتي/i, /وش حصلت/i, /وريني نتائجي/i, /ابي اعرف درجاتي/i,
      /هل عديت/i, /هل نجحت فالماده/i, /كم جايب/i, /وش جايب/i,
      /درجات المنتصف/i, /درجات النهائي/i, /كشف درجات/i,
      /gpa/i, /grade/i, /score/i, /result/i, /mark/i, /transcript/i, /my.*grades/i,
      /how did i do/i, /what did i get/i, /my performance/i, /academic record/i,
      /show.*grades/i, /what'?s my gpa/i, /whats my gpa/i, /check.*grades/i,
      /how are my grades/i, /am i passing/i, /did i pass/i, /did i fail/i,
      /am i failing/i, /failing any/i, /any course.*fail/i,
      /final grade/i, /midterm grade/i, /my marks/i, /report card/i,
    ],
    description: "grades",
  },
  {
    intent: "absences",
    patterns: [
      /غياب/i, /حضور/i, /غيب/i, /غايب/i, /اغيب/i, /أغيب/i, /تغيب/i, /حضر/i, /حرمان/i,
      /وش.*غياب/i, /كم.*غياب/i, /ابي.*غياب/i, /عطني.*غياب/i,
      /كم.*غبت/i, /وش.*غبت/i, /غياب.*كثير/i,
      /وش.*وضع.*غياب/i, /عندي.*غياب/i,
      /هل.*انحرم/i, /هل.*محروم/i, /حرموني/i,
      /كم مره غبت/i, /هل بينحرموني/i, /هل انا قريب من الحرمان/i,
      /وش نسبة حضوري/i, /كم باقي لي غياب/i, /وضع غيابي/i,
      /سجل حضوري/i, /كم يوم غبت/i, /عدد غياباتي/i,
      /كم مره اغيب/i, /كم مرة أغيب/i, /غايب فيها/i, /اللي غايب فيها/i,
      /المواد.*غايب/i, /وش.*غايب/i, /وين.*غايب/i, /فيها.*غياب/i,
      /توريني.*غياب/i, /توريني.*غايب/i, /وريني.*غايب/i,
      /absence/i, /attend/i, /\babsent\b/i, /miss.*class/i,
      /how many absences/i, /how many times absent/i, /am i at risk/i,
      /attendance record/i, /show.*absences/i, /check.*absences/i,
      /did i miss/i, /have i missed/i, /how often absent/i,
      /absence count/i, /days missed/i, /skipped class/i,
      /how many classes missed/i, /am i going to be denied/i, /denial risk/i,
    ],
    description: "absences",
    roleRequired: "student",
  },
  {
    intent: "schedule",
    patterns: [
      /جدول/i, /محاضر/i, /حصة/i, /قاع/i, /موعد/i,
      /وش.*جدول/i, /ابي.*جدول/i, /عطني.*جدول/i, /وريني.*جدول/i, /توريني.*جدول/i,
      /وين.*محاضر/i, /متى.*محاضر/i, /وش.*عندي.*اليوم/i,
      /عندي.*محاضر/i, /كم.*محاضر/i, /وش.*عندي.*بكره/i,
      /اي.*قاعه/i, /اي.*قاعة/i, /وين.*القاع/i,
      /متى أروح/i, /وين لازم أروح/i, /اي مبنى/i,
      /وش أول محاضره/i, /وش آخر محاضره/i, /جدولي اليوم/i, /جدولي بكره/i,
      /متى أبدأ/i, /متى أخلص/i, /كم محاضره عندي اليوم/i, /جدول الأسبوع/i,
      /كم مره.*الاسبوع/i, /كم مرة.*الأسبوع/i, /كم مره.*بالاسبوع/i, /خلال الاسبوع/i,
      /كم حصه.*الاسبوع/i, /كم حصة.*الأسبوع/i, /كم يوم عندي/i,
      /schedule/i, /timetable/i, /\broom\b/i, /lecture/i, /when.*class/i, /my.*schedule/i,
      /what classes today/i, /what do i have today/i, /when is my next class/i,
      /what time.*class/i, /where is my class/i, /show.*timetable/i, /show.*schedule/i,
      /what'?s tomorrow/i, /do i have class tomorrow/i, /my classes this week/i,
      /next lecture/i, /what room/i, /which building/i, /when do i start/i,
      /class times/i, /daily schedule/i, /weekly schedule/i,
      /what'?s on monday/i, /what'?s on sunday/i,
      /which day.*most/i, /most classes/i, /busiest day/i, /heaviest day/i,
    ],
    description: "schedule",
  },
  {
    intent: "plan",
    patterns: [
      /خط[ةت]/i, /متبقي/i, /تخرج/i,
      /وش.*باقي/i, /كم.*باقي/i, /ابي.*خطة/i, /عطني.*خطة/i,
      /متى.*اتخرج/i, /كم.*ماده.*باقي/i, /كم.*مقرر.*باقي/i,
      /وش.*ناقصني/i, /وش.*الباقي/i, /خلصت.*كم/i,
      /كم ترم باقي/i, /متى بتخرج/i, /الخطة الدراسيه/i, /وش المواد الباقيه/i,
      /كم ماده خلصت/i, /تقدمي الأكاديمي/i, /نسبة الإنجاز/i,
      /كم أنجزت/i, /وش اللي قطعته/i, /خطة تخرجي/i,
      /plan/i, /remaining/i, /graduat/i, /credits.*left/i,
      /degree plan/i, /study plan/i, /how many courses left/i,
      /when will i graduate/i, /when do i graduate/i, /graduation plan/i,
      /remaining courses/i, /courses left/i, /what'?s left/i,
      /how close to graduating/i, /degree progress/i, /degree audit/i,
      /academic plan/i, /how many semesters left/i, /credit hours remaining/i,
      /courses.*left.*graduat/i, /left to graduate/i, /how many courses.*left/i,
      /courses.*remaining/i, /courses.*to complete/i, /courses do i have left/i,
    ],
    description: "plan",
    roleRequired: "student",
  },
  {
    intent: "student_courses",
    patterns: [
      /وش.*مواد/i, /ابي.*مواد/i, /عطني.*مواد/i, /وريني.*مواد/i, /توريني.*مواد/i,
      /كم.*ماده/i, /كم.*مادة/i, /مواد.*الترم/i, /مواد.*الفصل/i,
      /مواد.*مسجل/i, /وش.*مسجل/i, /ايش.*مسجل/i,
      /مقرراتي/i, /وش.*موادي/i, /ايش.*موادي/i, /موادي/i,
      /وش.*اخذ.*الترم/i, /كم.*مقرر/i, /كم.*كورس/i,
      /وش الكورسات/i, /كم ساعه مسجل/i, /كم ساعة/i, /عدد ساعاتي/i,
      /الساعات المسجله/i, /وش المقررات/i, /ايش المواد اللي عندي/i, /وش عندي هالترم/i,
      /my.*courses/i, /enrolled/i, /what.*taking/i, /registered/i,
      /what am i enrolled in/i, /my enrollment/i, /list my courses/i,
      /current courses/i, /this semester courses/i, /what subjects/i,
      /how many courses/i, /how many credits/i, /course load/i,
      /what am i studying/i, /show my courses/i, /my subjects/i,
    ],
    description: "student courses",
    roleRequired: "student",
  },
  {
    intent: "alerts",
    patterns: [
      /تنبيه/i, /إشعار/i, /إنذار/i, /تحذير/i, /اشعار/i, /انذار/i,
      /وش.*تنبيه/i, /عندي.*تنبيه/i, /وش.*انذار/i, /عندي.*انذار/i,
      /فيه.*تنبيه/i, /فيه.*انذار/i, /وش.*اشعار/i, /عندي.*اشعار/i,
      /وش.*رسائل/i, /فيه.*رسائل/i, /هل.*عندي.*شي/i, /فيه.*شي.*جديد/i,
      /وش.*الجديد/i, /وش.*المشاكل/i, /عندي.*مشاكل/i,
      /هل فيه شي جديد/i, /وش الجديد عندي/i, /عندي رسايل/i, /فيه رسايل/i,
      /هل فيه مشكله/i, /وش المشاكل عندي/i, /فيه تحذيرات/i, /عندي تحذيرات/i,
      /alert/i, /notification/i, /warning/i, /any.*alert/i,
      /any notifications/i, /do i have notifications/i, /any messages/i,
      /any updates/i, /check alerts/i, /show alerts/i, /my alerts/i,
      /new alerts/i, /unread notifications/i, /any warnings/i,
      /am i in trouble/i, /any issues/i, /problems/i, /what'?s wrong/i,
      /anything new/i, /any new messages/i, /inbox/i,
    ],
    description: "alerts",
  },
  {
    intent: "news",
    patterns: [
      /خبر/i, /أخبار/i, /اخبار/i, /إعلان/i, /اعلان/i, /مسابق/i, /فعالي/i,
      /وش.*اخبار/i, /وش.*جديد.*جامع/i, /ابي.*اخبار/i, /فيه.*اخبار/i, /وش.*صاير/i,
      /وش الأخبار/i, /فيه شي جديد بالجامعه/i, /اخبار الجامعه/i, /وش صاير بالجامعه/i,
      /فيه فعاليات/i, /فيه مسابقات جديده/i, /اعلانات الجامعه/i,
      /وش آخر الأخبار/i, /فيه شي يخص الجامعه/i,
      /news/i, /announcement/i, /competition/i, /event/i,
      /what'?s happening/i, /any news/i, /latest news/i, /university news/i,
      /campus news/i, /any announcements/i, /any events/i, /upcoming events/i,
      /what'?s going on/i, /any competitions/i, /any updates from university/i,
      /campus updates/i, /school news/i,
    ],
    description: "news",
  },
  {
    intent: "faculty_courses",
    patterns: [
      /مقرراتي/i, /مواد.*أدرس/i, /مواد.*ادرس/i,
      /وش.*مواد/i, /ابي.*مواد/i, /كم.*ماده.*عندي/i, /كم.*شعب/i, /كم.*طالب.*عندي/i,
      /وش المواد اللي ادرسها/i, /كم شعبه عندي/i, /كم طالب عندي بالمجموع/i,
      /مقرراتي هالترم/i, /وش ادرس/i,
      /courses.*teach/i, /my.*course/i, /show.*course/i,
      /what do i teach/i, /courses i teach/i, /my teaching load/i,
      /how many students/i, /class list/i, /my sections/i,
      /which courses/i, /what am i teaching/i, /teaching schedule/i,
      /\broster\b/i, /class roster/i, /student list/i, /enrollment list/i,
      /students? in [A-Z]/i, /show.*students/i, /list.*students/i,
    ],
    description: "faculty courses",
    roleRequired: "faculty",
  },
  {
    intent: "faculty_absences",
    patterns: [
      /طلاب.*غياب/i, /متجاوز.*غياب/i, /تجاوز.*حد/i, /كشف.*غياب/i,
      /تقرير.*غياب/i, /طلاب.*محروم/i,
      /مين.*غاب.*كثير/i, /كم.*طالب.*غاب/i, /اللي.*غياب.*كثير/i,
      /كم.*طالب.*فوق/i, /كم.*طالب.*تجاوز/i,
      /نسبة.*غياب/i, /فوق.*غياب/i, /فوق.*25/i,
      /عندي.*طلاب.*غياب/i, /فيه.*طلاب.*غياب/i,
      /حرمان/i, /محرومين/i, /ينحرم/i, /بينحرم/i,
      /مين الطلاب اللي غابوا كثير/i, /مين قريب من الحرمان/i,
      /كشف الغياب المتجاوز/i, /الطلاب المعرضين للحرمان/i,
      /مين اللي عنده غياب عالي/i, /تقرير غياب طلابي/i,
      /excessive.*absen/i, /student.*absen/i, /absence.*report/i, /who.*absen/i, /above.*25/i, /exceed/i,
      /students with too many absences/i, /at risk students/i, /students close to denial/i,
      /who'?s been absent a lot/i, /who needs warning/i, /students above limit/i,
      /high absence/i, /flagged students/i, /at risk of denial/i,
      /who might fail attendance/i, /students to watch/i, /too many absences/i,
      /at.risk student/i, /who.*at.risk/i, /my at.risk/i,
    ],
    description: "faculty absences",
    roleRequired: "faculty",
  },
  {
    intent: "greeting",
    patterns: [
      /^(مرحبا|هلا|السلام|أهلا|اهلا|هاي|صباح|مساء|كيف حالك|كيفك|شخبارك|يا هلا|صباح الخير|مساء الخير|السلام عليكم|وعليكم السلام|أهلين|هلو|كيف الحال|شلونك)/i,
      /^(hello|hi|hey|good morning|good evening|good afternoon|how are you|sup|yo|howdy|greetings|what'?s up|whats up|hiya)/i,
    ],
    description: "greeting",
  },
  {
    intent: "help",
    patterns: [
      /وش.*تقدر.*تسوي/i, /ايش.*تقدر/i, /كيف.*استخدم/i,
      /وش.*خدمات/i, /ساعدني/i, /مساعد/i, /وش.*تعرف.*تسوي/i,
      /كيف أستخدمك/i, /شلون أستخدمك/i, /ايش تقدر تسوي/i, /وش فيك/i,
      /قائمة الخدمات/i, /عطني قائمه/i, /شرح/i, /اشرح لي/i,
      /help/i, /what.*can.*you/i,
      /how do i use this/i, /what are your features/i, /what do you offer/i,
      /guide me/i, /show commands/i, /show options/i, /how does this work/i,
      /what is this/i, /what can i ask/i,
    ],
    description: "help",
  },
  {
    intent: "overall_status",
    patterns: [
      /وش.*وضعي/i, /كيف.*وضعي/i, /شلون.*وضعي/i,
      /وش.*حالتي/i, /ملخص/i, /لخص.*لي/i, /عطني.*ملخص/i,
      /كل.*شي.*عني/i, /كل.*بياناتي/i,
      /كيف أنا/i, /وش وضعي العام/i, /عطني صوره كامله/i, /شلون وضعي/i,
      /وش حالتي الأكاديميه/i, /ابي أعرف كل شي/i, /لخصلي وضعي/i,
      /كيف مستواي/i, /وش وضعي بشكل عام/i,
      /overview/i, /summary/i, /my.*status/i,
      /how am i doing/i, /show me everything/i, /give me a summary/i,
      /my dashboard/i, /my overview/i, /overall performance/i,
      /general status/i, /how'?s everything/i, /academic standing/i,
      /am i doing well/i, /full report/i, /tell me everything/i, /my situation/i,
    ],
    description: "overall status",
  },
];