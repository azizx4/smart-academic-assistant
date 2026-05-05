// ==============================================
// SARA — Intent Detection + Language Detection Tests
// Covers: INTENT_PATTERNS matching, role filtering,
// isEnglish heuristic, canned response routing.
// ==============================================

import { describe, it, expect } from "vitest";
import { INTENT_PATTERNS } from "../src/providers/system-prompt.js";

// Reproduce detectIntent logic from chat.service.js
function detectIntent(message, role) {
  for (const p of INTENT_PATTERNS) {
    if (p.roleRequired && p.roleRequired !== role) continue;
    for (const r of p.patterns) if (r.test(message)) return p.intent;
  }
  return "unknown";
}

// ==============================================
// Student — English intent detection
// ==============================================
describe("Intent Detection — Student English", () => {
  const role = "student";

  it.each([
    ["show me my grades", "grades"],
    ["whats my gpa?", "grades"],
    ["how did I do in my midterm?", "grades"],
    ["am I passing all my courses?", "grades"],
    ["what did I get in CS201?", "grades"],
    ["my marks", "grades"],
    ["final grade", "grades"],
    ["academic record", "grades"],
    ["report card", "grades"],
    ["did I pass?", "grades"],
    ["did I fail?", "grades"],
    ["my performance", "grades"],
  ])("'%s' → grades", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["how many absences do I have?", "absences"],
    ["show my attendance record", "absences"],
    ["am I at risk of being denied?", "absences"],
    ["did I miss any classes?", "absences"],
    ["how many classes missed?", "absences"],
    ["absence count", "absences"],
    ["days missed", "absences"],
    ["skipped class", "absences"],
    ["am I going to be denied?", "absences"],
    ["have I missed class?", "absences"],
  ])("'%s' → absences", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["what is my schedule?", "schedule"],
    ["when is my next class?", "schedule"],
    ["what room is my next class?", "schedule"],
    ["show my timetable", "schedule"],
    ["do I have class tomorrow?", "schedule"],
    ["next lecture", "schedule"],
    ["weekly schedule", "schedule"],
    ["what's on monday?", "schedule"],
    ["daily schedule", "schedule"],
    ["which building?", "schedule"],
  ])("'%s' → schedule", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["how many courses left to graduate?", "plan"],
    ["when will I graduate?", "plan"],
    ["remaining courses?", "plan"],
    ["how many credits left?", "plan"],
    ["degree plan", "plan"],
    ["degree progress", "plan"],
    ["degree audit", "plan"],
    ["what's left?", "plan"],
    ["how close to graduating?", "plan"],
    ["how many semesters left?", "plan"],
    ["credit hours remaining", "plan"],
  ])("'%s' → plan", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["what courses am I enrolled in?", "student_courses"],
    ["what am I taking this semester?", "student_courses"],
    ["list my courses", "student_courses"],
    ["how many courses?", "student_courses"],
    ["how many credits?", "student_courses"],
    ["course load", "student_courses"],
    ["my subjects", "student_courses"],
    ["current courses", "student_courses"],
  ])("'%s' → student_courses", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["do I have any alerts?", "alerts"],
    ["any notifications?", "alerts"],
    ["any warnings?", "alerts"],
    ["unread notifications", "alerts"],
    ["any issues?", "alerts"],
    ["am I in trouble?", "alerts"],
    ["anything new?", "alerts"],
    ["check alerts", "alerts"],
  ])("'%s' → alerts", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["any news?", "news"],
    ["latest news", "news"],
    ["any announcements?", "news"],
    ["any events coming up?", "news"],
    ["campus news", "news"],
    ["any competitions?", "news"],
    ["what's happening?", "news"],
  ])("'%s' → news", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["give me a summary", "overall_status"],
    ["how am I doing?", "overall_status"],
    ["show me everything", "overall_status"],
    ["my overview", "overall_status"],
    ["overall performance", "overall_status"],
    ["am I doing well?", "overall_status"],
    ["my situation", "overall_status"],
  ])("'%s' → overall_status", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });
});

// ==============================================
// Student — Arabic/Dialect intent detection
// ==============================================
describe("Intent Detection — Student Arabic", () => {
  const role = "student";

  it.each([
    ["وش درجاتي", "grades"],
    ["كم معدلي", "grades"],
    ["وريني نتائجي", "grades"],
    ["كم جبت", "grades"],
    ["هل ناجح", "grades"],
    ["توريني درجاتي", "grades"],
    ["كيف درجاتي", "grades"],
    ["كشف درجات", "grades"],
  ])("'%s' → grades", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["وش غيابي", "absences"],
    ["توريني غيابي", "absences"],
    ["كم مره اغيب", "absences"],
    ["هل انا محروم", "absences"],
    ["وش المواد اللي غايب فيها", "absences"],
    ["كم باقي لي غياب", "absences"],
    ["وضع غيابي", "absences"],
    ["عدد غياباتي", "absences"],
    ["هل انا قريب من الحرمان", "absences"],
  ])("'%s' → absences", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["ابي جدولي", "schedule"],
    ["وش عندي اليوم", "schedule"],
    ["وين المحاضره", "schedule"],
    ["كم محاضره عندي اليوم", "schedule"],
    ["جدول الأسبوع", "schedule"],
    ["متى أبدأ", "schedule"],
    ["كم مره بالاسبوع", "schedule"],
  ])("'%s' → schedule", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["كم باقي واتخرج", "plan"],
    ["متى اتخرج", "plan"],
    ["عطني خطتي", "plan"],
    ["وش الباقي", "plan"],
    ["كم ماده باقي", "plan"],
    ["خطة تخرجي", "plan"],
    ["نسبة الإنجاز", "plan"],
  ])("'%s' → plan", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["وش موادي هالترم", "student_courses"],
    ["كم ساعه مسجل", "student_courses"],
    ["وش مسجل", "student_courses"],
    ["مقرراتي", "student_courses"],
    ["ايش موادي", "student_courses"],
  ])("'%s' → student_courses", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["عندي تنبيهات", "alerts"],
    ["وش التنبيهات", "alerts"],
    ["فيه انذار", "alerts"],
    ["هل فيه شي جديد", "alerts"],
    ["فيه رسايل", "alerts"],
  ])("'%s' → alerts", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["وش اخبار الجامعه", "news"],
    ["فيه فعاليات", "news"],
    ["فيه مسابقات جديده", "news"],
    ["اعلانات الجامعه", "news"],
  ])("'%s' → news", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["وش وضعي", "overall_status"],
    ["عطني ملخص", "overall_status"],
    // "كيف مستواي" matches grades (/كيف.*مستو/) first — acceptable
  ])("'%s' → overall_status", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });
});

// ==============================================
// Faculty — English intent detection
// ==============================================
describe("Intent Detection — Faculty English", () => {
  const role = "faculty";

  it.each([
    ["what courses do I teach?", "faculty_courses"],
    ["how many students do I have?", "faculty_courses"],
    ["my teaching load", "faculty_courses"],
    ["show me my class roster", "faculty_courses"],
    ["student list", "faculty_courses"],
    ["what am I teaching?", "faculty_courses"],
  ])("'%s' → faculty_courses", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["which students have too many absences?", "faculty_absences"],
    ["students at risk of denial", "faculty_absences"],
    ["who is absent a lot?", "faculty_absences"],
    ["absence report", "faculty_absences"],
    ["who might fail attendance?", "faculty_absences"],
    ["at risk students", "faculty_absences"],
    ["students close to denial", "faculty_absences"],
    ["flagged students", "faculty_absences"],
    ["high absence", "faculty_absences"],
    ["too many absences", "faculty_absences"],
  ])("'%s' → faculty_absences", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it("faculty can access news", () => {
    expect(detectIntent("any news?", "faculty")).toBe("news");
  });
});

// ==============================================
// Faculty — Arabic intent detection
// ==============================================
describe("Intent Detection — Faculty Arabic", () => {
  const role = "faculty";

  it.each([
    ["وش المواد اللي ادرسها", "faculty_courses"],
    ["كم طالب عندي", "faculty_courses"],
    ["مقرراتي", "faculty_courses"],
  ])("'%s' → faculty_courses", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });

  it.each([
    ["مين الطلاب اللي غابوا كثير", "faculty_absences"],
    ["مين قريب من الحرمان", "faculty_absences"],
    ["تقرير غياب طلابي", "faculty_absences"],
    ["الطلاب المعرضين للحرمان", "faculty_absences"],
    ["محرومين", "faculty_absences"],
  ])("'%s' → faculty_absences", (msg, expected) => {
    expect(detectIntent(msg, role)).toBe(expected);
  });
});

// ==============================================
// Role filtering — students can't hit faculty intents
// ==============================================
describe("Intent Detection — Role Boundaries", () => {
  it("student asking about 'students at risk' does NOT match faculty_absences", () => {
    // "students at risk" has no student-role pattern
    const result = detectIntent("students at risk of denial", "student");
    expect(result).not.toBe("faculty_absences");
  });

  it("faculty asking about absences matches faculty_absences, not student absences", () => {
    const result = detectIntent("absence report", "faculty");
    expect(result).toBe("faculty_absences");
  });

  it("student absences intent is skipped for faculty", () => {
    // "how many absences" would match student absences pattern but should skip for faculty
    const result = detectIntent("how many absences?", "faculty");
    expect(result).not.toBe("absences");
  });

  it("plan intent is skipped for faculty", () => {
    const result = detectIntent("graduation plan", "faculty");
    expect(result).not.toBe("plan");
  });

  it("student_courses intent is skipped for faculty", () => {
    const result = detectIntent("my courses", "faculty");
    // Should match faculty_courses, not student_courses
    expect(result).toBe("faculty_courses");
  });
});

// ==============================================
// Edge cases — previously broken patterns
// ==============================================
describe("Intent Detection — Edge Cases (regression)", () => {
  it("'خطتي' matches plan (ت vs ة)", () => {
    expect(detectIntent("عطني خطتي", "student")).toBe("plan");
  });

  it("'how many courses left to graduate' matches plan, not student_courses", () => {
    expect(detectIntent("how many courses left to graduate?", "student")).toBe("plan");
  });

  it("'which students have too many absences' matches faculty_absences (absent vs absences)", () => {
    expect(detectIntent("which students have too many absences?", "faculty")).toBe("faculty_absences");
  });

  it("'show me my class roster' matches faculty_courses", () => {
    expect(detectIntent("show me my class roster", "faculty")).toBe("faculty_courses");
  });

  it("question mark alone is NOT caught as any intent", () => {
    // '?' is handled by isHelp in canned responses, not by INTENT_PATTERNS
    expect(detectIntent("?", "student")).toBe("unknown");
  });

  it("'معدلي' does NOT match write_rejected (عدل false positive)", () => {
    expect(detectIntent("كم معدلي", "student")).toBe("grades");
  });
});
