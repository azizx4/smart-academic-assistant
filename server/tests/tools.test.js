// ==============================================
// SARA — Tool Registry + Executor Tests
// Verifies: registration, role-whitelisting, arg
// validation, handler dispatch, and per-tool behavior.
// ==============================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ToolRegistry } from "../src/tools/tool-registry.js";
import { ToolError } from "../src/tools/tool-executor.js";

// ---------- Service mocks ----------
vi.mock("../src/services/grade.service.js", () => ({
  getStudentGrades: vi.fn(async () => [
    { courseCode: "CS301", courseNameAr: "برمجة", total: 90, letterGrade: "A" },
    { courseCode: "MATH201", courseNameAr: "رياضيات", total: 75, letterGrade: "B" },
  ]),
  getStudentGPA: vi.fn(async () => ({ gpa: 3.5, totalCredits: 6, coursesCount: 2 })),
}));

vi.mock("../src/services/absence.service.js", () => ({
  getStudentAbsences: vi.fn(async () => [
    { courseCode: "CS301", courseNameAr: "برمجة", totalAbsences: 2, records: [] },
    { courseCode: "MATH201", courseNameAr: "رياضيات", totalAbsences: 5, records: [] },
  ]),
  getExcessiveAbsences: vi.fn(async (facultyId, limit) => [
    { student: { nameAr: "سالم" }, course: { code: "CS301" }, absenceCount: limit + 1, limit, exceeded: true },
  ]),
}));

vi.mock("../src/services/schedule.service.js", () => ({
  getStudentSchedule: vi.fn(async () => [
    { courseCode: "CS301", dayOfWeek: "Sunday", startTime: "08:00", endTime: "09:30", room: "A1" },
    { courseCode: "MATH201", dayOfWeek: "Monday", startTime: "10:00", endTime: "11:30", room: "B2" },
  ]),
}));

vi.mock("../src/services/plan.service.js", () => ({
  getStudentPlan: vi.fn(async () => ({
    summary: { total: 30, completed: 20, inProgress: 5, remaining: 5 },
    completed: [{ courseCode: "CS101" }],
    inProgress: [{ courseCode: "CS301" }],
    remaining: [{ courseCode: "CS499" }],
  })),
}));

vi.mock("../src/services/alert.service.js", () => ({
  getStudentAlerts: vi.fn(async () => ({
    unreadCount: 1,
    total: 2,
    alerts: [
      { id: 1, title: "تنبيه غياب", type: "warning", isRead: false },
      { id: 2, title: "إعلان", type: "info", isRead: true },
    ],
  })),
}));

vi.mock("../src/services/news.service.js", () => ({
  getNews: vi.fn(async (category) => [
    { id: 1, titleAr: "خبر 1", category: category || "news" },
  ]),
}));

vi.mock("../src/services/faculty.service.js", () => ({
  getFacultyCourses: vi.fn(async () => [
    { code: "CS301", nameAr: "برمجة", enrolledStudents: 30 },
  ]),
  getCourseStudents: vi.fn(async (facultyId, code) =>
    code === "CS301"
      ? { course: { code: "CS301" }, students: [{ studentId: "u1", absences: 2 }] }
      : null
  ),
}));

// ---------- Registry unit tests ----------
describe("ToolRegistry", () => {
  let registry;
  beforeEach(() => { registry = new ToolRegistry(); });

  it("registers a valid tool", () => {
    registry.register({ name: "dummy", description: "d", roles: ["student"], handler: async () => ({}) });
    expect(registry.has("dummy")).toBe(true);
  });

  it("rejects tool without roles", () => {
    expect(() =>
      registry.register({ name: "bad", description: "d", roles: [], handler: async () => {} })
    ).toThrow(/role/);
  });

  it("rejects duplicate registration", () => {
    const t = { name: "x", description: "d", roles: ["student"], handler: async () => {} };
    registry.register(t);
    expect(() => registry.register(t)).toThrow(/already registered/);
  });

  it("lists tools filtered by role", () => {
    registry.register({ name: "s-only", description: "d", roles: ["student"], handler: async () => {} });
    registry.register({ name: "f-only", description: "d", roles: ["faculty"], handler: async () => {} });
    registry.register({ name: "both", description: "d", roles: ["student", "faculty"], handler: async () => {} });
    expect(registry.listForRole("student").map((t) => t.name).sort()).toEqual(["both", "s-only"]);
    expect(registry.listForRole("faculty").map((t) => t.name).sort()).toEqual(["both", "f-only"]);
  });

  it("exports Gemini schema without leaking handler", () => {
    registry.register({
      name: "t", description: "d", roles: ["student"],
      parameters: { type: "object", properties: { x: { type: "string" } } },
      handler: async () => {},
    });
    const schema = registry.toGeminiSchema("student");
    expect(schema[0].handler).toBeUndefined();
    expect(schema[0]).toHaveProperty("parameters");
  });

  it("exports OpenAI schema in function-calling shape", () => {
    registry.register({
      name: "t", description: "d", roles: ["student"],
      handler: async () => {},
    });
    const schema = registry.toOpenAISchema("student");
    expect(schema[0].type).toBe("function");
    expect(schema[0].function.name).toBe("t");
  });
});

// ---------- End-to-end executor tests ----------
describe("ToolExecutor — full registry", () => {
  it("registers all 9 tools without error", async () => {
    const { initializeTools } = await import("../src/tools/index.js");
    const r = initializeTools();
    expect(r.listForRole("student").length + r.listForRole("faculty").length).toBeGreaterThanOrEqual(9);
  });

  it("student can invoke grades", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_student_grades", {}, { id: 1, role: "student" });
    expect(r.grades).toHaveLength(2);
    expect(r.gpa.gpa).toBe(3.5);
  });

  it("student can filter grades by courseCode", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_student_grades", { courseCode: "CS301" }, { id: 1, role: "student" });
    expect(r.grades).toHaveLength(1);
  });

  it("student can invoke absences (all)", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_student_absences", {}, { id: 1, role: "student" });
    expect(r).toHaveLength(2);
  });

  it("student can filter absences by courseCode", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_student_absences", { courseCode: "cs301" }, { id: 1, role: "student" });
    expect(r).toHaveLength(1);
    expect(r[0].courseCode).toBe("CS301");
  });

  it("student can invoke schedule (full week)", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_student_schedule", {}, { id: 1, role: "student" });
    expect(r).toHaveLength(2);
  });

  it("student can filter schedule by day", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_student_schedule", { dayOfWeek: "Sunday" }, { id: 1, role: "student" });
    expect(r).toHaveLength(1);
    expect(r[0].dayOfWeek).toBe("Sunday");
  });

  it("student can invoke plan (full)", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_student_plan", {}, { id: 1, role: "student" });
    expect(r.summary.completed).toBe(20);
  });

  it("student can filter plan by status='remaining'", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_student_plan", { status: "remaining" }, { id: 1, role: "student" });
    expect(r.remaining).toBeDefined();
    expect(r.completed).toBeUndefined();
  });

  it("student can invoke alerts (all)", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_student_alerts", {}, { id: 1, role: "student" });
    expect(r.alerts).toHaveLength(2);
  });

  it("student can request unread-only alerts", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_student_alerts", { unreadOnly: true }, { id: 1, role: "student" });
    expect(r.alerts).toHaveLength(1);
    expect(r.alerts[0].isRead).toBe(false);
  });

  it("both roles can invoke news", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r1 = await executeTool("get_news", {}, { id: 1, role: "student" });
    const r2 = await executeTool("get_news", { category: "competition" }, { id: 9, role: "faculty" });
    expect(r1).toHaveLength(1);
    expect(r2[0].category).toBe("competition");
  });

  it("faculty can invoke their courses", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_faculty_courses", {}, { id: 9, role: "faculty" });
    expect(r[0].code).toBe("CS301");
  });

  it("faculty can list students in their own course", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_course_students", { courseCode: "CS301" }, { id: 9, role: "faculty" });
    expect(r.students).toHaveLength(1);
  });

  it("faculty gets null for a course they don't teach", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_course_students", { courseCode: "NOT-MINE" }, { id: 9, role: "faculty" });
    expect(r).toBeNull();
  });

  it("faculty can fetch excessive absences with default limit", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_excessive_absences", {}, { id: 9, role: "faculty" });
    expect(r[0].limit).toBe(4);
  });

  it("faculty can override absence limit via args", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_excessive_absences", { limit: 6 }, { id: 9, role: "faculty" });
    expect(r[0].limit).toBe(6);
  });

  it("get_course_students without courseCode returns rosters for all faculty courses", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_course_students", {}, { id: 9, role: "faculty" });
    expect(Array.isArray(r)).toBe(true);
    expect(r[0].course.code).toBe("CS301");
  });

  // ---------- Security: role boundary enforcement ----------
  it.each([
    ["get_student_grades", "faculty"],
    ["get_student_absences", "faculty"],
    ["get_student_schedule", "faculty"],
    ["get_student_plan", "faculty"],
    ["get_student_alerts", "faculty"],
    ["get_faculty_courses", "student"],
    ["get_course_students", "student"],
    ["get_excessive_absences", "student"],
  ])("FORBIDDEN: %s cannot be invoked by %s", async (tool, role) => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const args = tool === "get_course_students" ? { courseCode: "CS301" } : {};
    await expect(
      executeTool(tool, args, { id: 1, role })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects unknown tool with TOOL_NOT_FOUND", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    await expect(
      executeTool("drop_database", {}, { id: 1, role: "student" })
    ).rejects.toMatchObject({ code: "TOOL_NOT_FOUND" });
  });

  it("strips invalid-typed arguments silently", async () => {
    const { executeTool } = await import("../src/tools/tool-executor.js");
    const r = await executeTool("get_student_grades", { courseCode: 12345 }, { id: 1, role: "student" });
    expect(r.grades).toHaveLength(2);
  });
});
