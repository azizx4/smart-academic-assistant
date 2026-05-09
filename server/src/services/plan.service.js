// ==============================================
// SARA — Plan Service
// Scoped academic plan queries per student
// ==============================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get academic plan for a student.
 * SCOPE: student sees only their own plan.
 */
export async function getStudentPlan(studentId) {
  const [plans, courses] = await Promise.all([
    prisma.academicPlan.findMany({
      where: { studentId },
      orderBy: [{ semester: "asc" }, { courseCode: "asc" }],
    }),
    prisma.course.findMany({
      select: { code: true, nameEn: true },
    }),
  ]);

  // Build code → English name map
  // Includes extra plan-only courses not in the Course table
  const EXTRA_NAMES = {
    CS102: "Introduction to Computing", MATH102: "Calculus II",
    PHYS102: "General Physics III", ENGL102: "English Language II",
    ARAB102: "Communication Skills", CS402: "Machine Learning",
    CS403: "Information Security", SE401: "Graduation Project",
    IS401: "IT Governance", MATH302: "Discrete Mathematics",
  };
  const courseMap = { ...EXTRA_NAMES };
  for (const c of courses) courseMap[c.code] = c.nameEn;

  // Group by status
  const completed = plans.filter((p) => p.status === "completed");
  const inProgress = plans.filter((p) => p.status === "in_progress");
  const remaining = plans.filter((p) => p.status === "remaining");

  const formatItem = (p) => ({
    courseCode: p.courseCode,
    courseNameAr: p.courseNameAr,
    courseNameEn: courseMap[p.courseCode] || p.courseNameAr,
    semester: p.semester,
    status: p.status,
  });

  return {
    summary: {
      total: plans.length,
      completed: completed.length,
      inProgress: inProgress.length,
      remaining: remaining.length,
    },
    completed: completed.map(formatItem),
    inProgress: inProgress.map(formatItem),
    remaining: remaining.map(formatItem),
  };
}
