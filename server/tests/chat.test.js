// ==============================================
// SARA — Chat Service (Tool-Calling) Tests
// Verifies the orchestration: pre-filter, tool
// selection, safe execution, and legacy fallback.
// ==============================================

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------- Service mocks (data the tools wrap) ----------
vi.mock("../src/services/grade.service.js", () => ({
  getStudentGrades: vi.fn(async () => [
    { courseCode: "CS301", courseNameAr: "برمجة", total: 90, letterGrade: "A" },
  ]),
  getStudentGPA: vi.fn(async () => ({ gpa: 3.5, totalCredits: 3, coursesCount: 1 })),
}));
vi.mock("../src/services/absence.service.js", () => ({
  getStudentAbsences: vi.fn(async () => [
    { courseCode: "CS301", courseNameAr: "برمجة", totalAbsences: 2, records: [] },
  ]),
  getExcessiveAbsences: vi.fn(async () => []),
}));
vi.mock("../src/services/schedule.service.js", () => ({
  getStudentSchedule: vi.fn(async () => []),
}));
vi.mock("../src/services/plan.service.js", () => ({
  getStudentPlan: vi.fn(async () => ({ summary: { total: 0, completed: 0, inProgress: 0, remaining: 0 }, completed: [], inProgress: [], remaining: [] })),
}));
vi.mock("../src/services/alert.service.js", () => ({
  getStudentAlerts: vi.fn(async () => ({ unreadCount: 0, total: 0, alerts: [] })),
}));
vi.mock("../src/services/news.service.js", () => ({
  getNews: vi.fn(async () => [{ id: 1, titleAr: "خبر", category: "news" }]),
}));
vi.mock("../src/services/faculty.service.js", () => ({
  getFacultyCourses: vi.fn(async () => []),
  getCourseStudents: vi.fn(async () => null),
}));

// ---------- Prisma mock (chat.service reads user.nameAr) ----------
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: { findUnique: vi.fn(async ({ where }) => ({ nameAr: "سعد" })) },
  })),
}));

// ---------- Provider mock factory ----------
const providerState = { instance: null };
vi.mock("../src/providers/factory.js", () => ({
  getAIProvider: () => providerState.instance,
}));

function makeProvider({ supports = true, selectReturn, respondText, generateText, throwOnSelect } = {}) {
  return {
    supportsTools: () => supports,
    selectTool: vi.fn(async () => {
      if (throwOnSelect) throw new Error("upstream down");
      return selectReturn;
    }),
    respondWithToolResults: vi.fn(async () => respondText ?? "مرتب"),
    generateResponse: vi.fn(async () => generateText ?? "legacy reply"),
  };
}

async function loadChat() {
  const mod = await import("../src/services/chat.service.js");
  return mod.processChat;
}

// ==============================================
describe("Chat — pre-filter (short-circuit paths)", () => {
  beforeEach(() => { providerState.instance = makeProvider({ selectReturn: { type: "text", text: "x" } }); });

  it("greeting returns canned reply without calling the provider", async () => {
    const processChat = await loadChat();
    const r = await processChat("السلام عليكم", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("greeting");
    expect(r.reply).toMatch(/سعد/);
    expect(providerState.instance.selectTool).not.toHaveBeenCalled();
  });

  it("write attempt is rejected without AI", async () => {
    const processChat = await loadChat();
    const r = await processChat("ابي احذف مادة", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("write_rejected");
    expect(providerState.instance.selectTool).not.toHaveBeenCalled();
  });

  it("unavailable feature is rejected without AI", async () => {
    const processChat = await loadChat();
    const r = await processChat("وش رسومي هالترم", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("unavailable");
  });

  it("help returns menu", async () => {
    const processChat = await loadChat();
    const r = await processChat("مساعدة", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("help");
  });
});

// ==============================================
describe("Chat — tool-calling path", () => {
  it("executes a single tool and returns AI-composed reply", async () => {
    providerState.instance = makeProvider({
      selectReturn: { type: "call", calls: [{ name: "get_student_grades", args: {} }] },
      respondText: "درجاتك ممتازة يا سعد",
    });
    const processChat = await loadChat();
    const r = await processChat("وش درجاتي", { id: 1, role: "student", username: "s1" });

    expect(providerState.instance.selectTool).toHaveBeenCalledOnce();
    expect(providerState.instance.respondWithToolResults).toHaveBeenCalledOnce();
    expect(r.reply).toBe("درجاتك ممتازة يا سعد");
    expect(r.intent).toBe("get_student_grades");
    expect(r.tools).toEqual(["get_student_grades"]);
  });

  it("executes multiple tools in parallel (overall status)", async () => {
    providerState.instance = makeProvider({
      selectReturn: {
        type: "call",
        calls: [
          { name: "get_student_grades", args: {} },
          { name: "get_student_absences", args: {} },
          { name: "get_student_alerts", args: {} },
        ],
      },
      respondText: "ملخص جاهز",
    });
    const processChat = await loadChat();
    const r = await processChat("وش وضعي بشكل عام", { id: 1, role: "student", username: "s1" });

    const resultsArg = providerState.instance.respondWithToolResults.mock.calls[0][2];
    expect(resultsArg).toHaveLength(3);
    expect(r.tools).toEqual(["get_student_grades", "get_student_absences", "get_student_alerts"]);
  });

  it("passes tool args through to the executor", async () => {
    providerState.instance = makeProvider({
      selectReturn: { type: "call", calls: [{ name: "get_student_grades", args: { courseCode: "CS301" } }] },
    });
    const processChat = await loadChat();
    await processChat("وش درجتي في CS301", { id: 1, role: "student", username: "s1" });

    const resultsArg = providerState.instance.respondWithToolResults.mock.calls[0][2];
    expect(resultsArg[0].grades).toHaveLength(1);
    expect(resultsArg[0].grades[0].courseCode).toBe("CS301");
  });

  it("handles text-only response (no tool needed)", async () => {
    providerState.instance = makeProvider({
      selectReturn: { type: "text", text: "أقدر أساعدك في الدرجات والغياب فقط." },
    });
    const processChat = await loadChat();
    const r = await processChat("احكيلي نكتة", { id: 1, role: "student", username: "s1" });
    expect(r.intent).toBe("conversation");
    expect(providerState.instance.respondWithToolResults).not.toHaveBeenCalled();
  });

  it("catches hallucinated tool names gracefully (does not crash)", async () => {
    providerState.instance = makeProvider({
      selectReturn: { type: "call", calls: [{ name: "delete_everything", args: {} }] },
      respondText: "ما قدرت أجيب الطلب",
    });
    const processChat = await loadChat();
    const r = await processChat("اختبار", { id: 1, role: "student", username: "s1" });

    const resultsArg = providerState.instance.respondWithToolResults.mock.calls[0][2];
    expect(resultsArg[0]).toMatchObject({ error: "TOOL_NOT_FOUND" });
    expect(r.intent).toContain("TOOL_NOT_FOUND");
  });

  it("blocks cross-role tool calls (student tries faculty tool)", async () => {
    providerState.instance = makeProvider({
      selectReturn: { type: "call", calls: [{ name: "get_faculty_courses", args: {} }] },
      respondText: "مو متاح",
    });
    const processChat = await loadChat();
    const r = await processChat("وريني المقررات", { id: 1, role: "student", username: "s1" });

    const resultsArg = providerState.instance.respondWithToolResults.mock.calls[0][2];
    expect(resultsArg[0]).toMatchObject({ error: "FORBIDDEN" });
    expect(r.intent).toContain("FORBIDDEN");
  });
});

// ==============================================
describe("Chat — legacy fallback", () => {
  it("falls back to legacy flow when selectTool throws", async () => {
    providerState.instance = makeProvider({
      throwOnSelect: true,
      generateText: "من الوضع القديم",
    });
    const processChat = await loadChat();
    const r = await processChat("وش درجاتي", { id: 1, role: "student", username: "s1" });
    expect(providerState.instance.generateResponse).toHaveBeenCalled();
    expect(r.reply).toBe("من الوضع القديم");
  });

  it("uses legacy flow when provider does not support tools", async () => {
    providerState.instance = makeProvider({
      supports: false,
      generateText: "legacy path",
    });
    const processChat = await loadChat();
    const r = await processChat("وش درجاتي", { id: 1, role: "student", username: "s1" });
    expect(providerState.instance.selectTool).not.toHaveBeenCalled();
    expect(providerState.instance.generateResponse).toHaveBeenCalled();
  });
});
