// ==============================================
// SARA — English Response Tests
// Verifies: all responses are in English regardless
// of input language (Arabic or English).
// ==============================================

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------- Service mocks ----------
vi.mock("../src/services/grade.service.js", () => ({
  getStudentGrades: vi.fn(async () => [
    { courseCode: "CS301", courseNameAr: "برمجة", courseNameEn: "Programming", total: 90, letterGrade: "A" },
  ]),
  getStudentGPA: vi.fn(async () => ({ gpa: 3.5, totalCredits: 3, coursesCount: 1 })),
}));
vi.mock("../src/services/absence.service.js", () => ({
  getStudentAbsences: vi.fn(async () => [
    { courseCode: "CS301", courseNameAr: "برمجة", courseNameEn: "Programming", totalAbsences: 2, records: [] },
  ]),
  getExcessiveAbsences: vi.fn(async () => [
    {
      student: { nameAr: "سالم", nameEn: "Salem" },
      course: { code: "CS301", nameAr: "برمجة", nameEn: "Programming" },
      absenceCount: 5,
    },
  ]),
}));
vi.mock("../src/services/schedule.service.js", () => ({
  getStudentSchedule: vi.fn(async () => [
    { courseCode: "CS301", courseNameAr: "برمجة", courseNameEn: "Programming", dayOfWeek: "Sunday", startTime: "08:00", endTime: "09:30", room: "A1" },
  ]),
}));
vi.mock("../src/services/plan.service.js", () => ({
  getStudentPlan: vi.fn(async () => ({
    summary: { total: 10, completed: 5, inProgress: 3, remaining: 2 },
    completed: [], inProgress: [], remaining: [],
  })),
}));
vi.mock("../src/services/alert.service.js", () => ({
  getStudentAlerts: vi.fn(async () => ({
    unreadCount: 1, total: 1,
    alerts: [{ id: 1, title: "تنبيه غياب", body: "لديك 3 غيابات في مقرر برمجة (CS301). الحد الأقصى المسموح 4 غيابات.", type: "warning", isRead: false }],
  })),
}));
vi.mock("../src/services/news.service.js", () => ({
  getNews: vi.fn(async () => [
    { id: 1, titleAr: "خبر الجامعة", titleEn: "University News", category: "news" },
  ]),
}));
vi.mock("../src/services/faculty.service.js", () => ({
  getFacultyCourses: vi.fn(async () => [
    { code: "CS301", nameAr: "برمجة", nameEn: "Programming", enrolledStudents: 30 },
  ]),
  getCourseStudents: vi.fn(async () => null),
}));

// ---------- Prisma mock ----------
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: { findUnique: vi.fn(async () => ({ nameEn: "Ahmed", nameAr: "أحمد" })) },
  })),
}));

// ---------- Provider mock ----------
const providerState = { instance: null };
vi.mock("../src/providers/factory.js", () => ({
  getAIProvider: () => providerState.instance,
}));

function makeProvider({ supports = true } = {}) {
  return {
    supportsTools: () => supports,
    selectTool: vi.fn(async () => ({ type: "text", text: "" })),
    respondWithToolResults: vi.fn(async () => "AI reply"),
    generateResponse: vi.fn(async () => { throw new Error("force fallback"); }),
  };
}

async function loadChat() {
  const mod = await import("../src/services/chat.service.js");
  return mod.processChat;
}

// ==============================================
// Canned responses — always English
// ==============================================
describe("English-only — Canned Responses", () => {
  beforeEach(() => { providerState.instance = makeProvider(); });

  it("English greeting → English reply", async () => {
    const chat = await loadChat();
    const r = await chat("hello", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("greeting");
    expect(r.reply).toMatch(/Hi/);
    expect(r.reply).not.toMatch(/أهلاً/);
  });

  it("Arabic greeting → English reply", async () => {
    const chat = await loadChat();
    const r = await chat("هلا", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("greeting");
    expect(r.reply).toMatch(/Hi/);
    expect(r.reply).not.toMatch(/أهلاً/);
  });

  it("English help → English reply", async () => {
    const chat = await loadChat();
    const r = await chat("what can you do?", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("help");
    expect(r.reply).toMatch(/Grades/);
  });

  it("Arabic help → English reply", async () => {
    const chat = await loadChat();
    const r = await chat("وش تقدر تسوي", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("help");
    expect(r.reply).toMatch(/Grades/);
  });

  it("English write rejection → English reply", async () => {
    const chat = await loadChat();
    const r = await chat("delete my grades", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("write_rejected");
    expect(r.reply).toMatch(/read-only/);
  });

  it("Arabic write rejection → English reply", async () => {
    const chat = await loadChat();
    const r = await chat("ابي اسجل مادة", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("write_rejected");
    expect(r.reply).toMatch(/read-only/);
  });

  it("English unavailable → English reply", async () => {
    const chat = await loadChat();
    const r = await chat("tuition fees?", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("unavailable");
    expect(r.reply).toMatch(/not currently available/);
  });

  it("Arabic unavailable → English reply", async () => {
    const chat = await loadChat();
    const r = await chat("وش رسومي", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("unavailable");
    expect(r.reply).toMatch(/not currently available/);
  });

  it("Faculty English greeting mentions courses/students", async () => {
    const chat = await loadChat();
    const r = await chat("hello", { id: 1, role: "faculty", username: "f1" });
    expect(r.reply).toMatch(/courses/i);
  });

  it("Faculty Arabic greeting → English reply", async () => {
    const chat = await loadChat();
    const r = await chat("هلا", { id: 1, role: "faculty", username: "f1" });
    expect(r.reply).toMatch(/courses/i);
    expect(r.reply).not.toMatch(/مقرراتك/);
  });
});

// ==============================================
// Fallback formatter — always English
// ==============================================
describe("English-only — Fallback Formatter", () => {
  beforeEach(() => { providerState.instance = makeProvider(); });

  it("English grades → English course names + GPA", async () => {
    const chat = await loadChat();
    const r = await chat("show me my grades", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("grades");
    expect(r.fallback).toBe(true);
    expect(r.reply).toMatch(/Programming/);
    expect(r.reply).toMatch(/GPA/);
  });

  it("Arabic grades → English course names + GPA", async () => {
    const chat = await loadChat();
    const r = await chat("وش درجاتي", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("grades");
    expect(r.reply).toMatch(/Programming/);
    expect(r.reply).toMatch(/GPA/);
  });

  it("English absences → English output", async () => {
    const chat = await loadChat();
    const r = await chat("how many absences?", { id: 1, role: "student", username: "s1" });
    expect(r.reply).toMatch(/absence/i);
    expect(r.reply).toMatch(/Programming/);
  });

  it("Arabic absences → English output", async () => {
    const chat = await loadChat();
    const r = await chat("وش غيابي", { id: 1, role: "student", username: "s1" });
    expect(r.reply).toMatch(/absence/i);
    expect(r.reply).toMatch(/Programming/);
  });

  it("English schedule → English course names", async () => {
    const chat = await loadChat();
    const r = await chat("what is my schedule?", { id: 1, role: "student", username: "s1" });
    expect(r.reply).toMatch(/Programming/);
    expect(r.reply).toMatch(/Sunday/);
  });

  it("English plan → English labels", async () => {
    const chat = await loadChat();
    const r = await chat("remaining courses?", { id: 1, role: "student", username: "s1" });
    expect(r.reply).toMatch(/Completed/);
    expect(r.reply).toMatch(/Remaining/);
  });

  it("Arabic plan → English labels", async () => {
    const chat = await loadChat();
    const r = await chat("كم باقي واتخرج", { id: 1, role: "student", username: "s1" });
    expect(r.reply).toMatch(/Completed/);
    expect(r.reply).toMatch(/Remaining/);
  });

  it("English alerts → translated title + body", async () => {
    const chat = await loadChat();
    const r = await chat("do I have alerts?", { id: 1, role: "student", username: "s1" });
    expect(r.reply).toMatch(/Absence Warning/);
    expect(r.reply).toMatch(/You have 3 absences/);
  });

  it("Arabic alerts → translated title + body (English)", async () => {
    const chat = await loadChat();
    const r = await chat("عندي تنبيهات", { id: 1, role: "student", username: "s1" });
    expect(r.reply).toMatch(/Absence Warning/);
    expect(r.reply).toMatch(/You have 3 absences/);
  });

  it("English news → English titles", async () => {
    const chat = await loadChat();
    const r = await chat("any news?", { id: 1, role: "student", username: "s1" });
    expect(r.reply).toMatch(/University News/);
  });

  it("Arabic news → English titles", async () => {
    const chat = await loadChat();
    const r = await chat("وش اخبار الجامعه", { id: 1, role: "student", username: "s1" });
    expect(r.reply).toMatch(/University News/);
  });

  it("English overall status → English labels", async () => {
    const chat = await loadChat();
    const r = await chat("give me a summary", { id: 1, role: "student", username: "s1" });
    expect(r.reply).toMatch(/GPA/);
    expect(r.reply).toMatch(/Courses/);
    expect(r.reply).toMatch(/Unread alerts/);
  });

  it("Arabic overall status → English labels", async () => {
    const chat = await loadChat();
    const r = await chat("وش وضعي", { id: 1, role: "student", username: "s1" });
    expect(r.reply).toMatch(/GPA/);
    expect(r.reply).toMatch(/Unread alerts/);
  });

  it("English faculty courses → English output", async () => {
    const chat = await loadChat();
    const r = await chat("what courses do I teach?", { id: 1, role: "faculty", username: "f1" });
    expect(r.reply).toMatch(/Programming/);
    expect(r.reply).toMatch(/students/);
  });

  it("English faculty absences → English output", async () => {
    const chat = await loadChat();
    const r = await chat("who has too many absences?", { id: 1, role: "faculty", username: "f1" });
    expect(r.reply).toMatch(/Salem/);
    expect(r.reply).toMatch(/absences/);
  });

  it("Arabic faculty courses → English output", async () => {
    const chat = await loadChat();
    const r = await chat("وش المواد اللي ادرسها", { id: 1, role: "faculty", username: "f1" });
    expect(r.reply).toMatch(/Programming/);
    expect(r.reply).toMatch(/students/);
  });
});

// ==============================================
// Unknown intent — always English
// ==============================================
describe("English-only — Unknown intent", () => {
  beforeEach(() => { providerState.instance = makeProvider(); });

  it("English unknown → English fallback message", async () => {
    const chat = await loadChat();
    const r = await chat("tell me a joke", { id: 1, role: "student", username: "s1" });
    if (r.intent === "unknown") {
      expect(r.reply).toMatch(/didn't understand|help/i);
    }
  });
});
