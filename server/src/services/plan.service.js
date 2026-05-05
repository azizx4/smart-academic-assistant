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
  const plans = await prisma.academicPlan.findMany({
    where: { studentId },
    orderBy: [{ semester: "asc" }, { courseCode: "asc" }],
  });

  // Group by status
  const completed = plans.filter((p) => p.status === "completed");
  const inProgress = plans.filter((p) => p.status === "in_progress");
  const remaining = plans.filter((p) => p.status === "remaining");

  const formatItem = (p) => ({
    courseCode: p.courseCode,
    courseNameAr: p.courseNameAr,
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
