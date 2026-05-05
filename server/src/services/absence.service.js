// ==============================================
// SARA — Absence Service
// Scoped absence queries per student/faculty
// ==============================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get absence records for a specific student.
 * SCOPE: student sees only their own absences.
 */
export async function getStudentAbsences(studentId) {
  const absences = await prisma.absence.findMany({
    where: { studentId },
    include: {
      course: {
        select: { code: true, nameAr: true, nameEn: true },
      },
    },
    orderBy: { date: "desc" },
  });

  // Group by course
  const byCourse = {};
  for (const a of absences) {
    const key = a.course.code;
    if (!byCourse[key]) {
      byCourse[key] = {
        courseCode: a.course.code,
        courseNameAr: a.course.nameAr,
        courseNameEn: a.course.nameEn,
        totalAbsences: 0,
        records: [],
      };
    }
    byCourse[key].totalAbsences++;
    byCourse[key].records.push({
      date: a.date.toISOString().split("T")[0],
      reason: a.reason,
    });
  }

  return Object.values(byCourse);
}

/**
 * Get students exceeding absence limit for a faculty member's courses.
 * SCOPE: faculty sees only students in their own courses.
 *
 * @param {number} facultyId - The faculty user ID
 * @param {number} limit - Absence threshold (default: 4)
 */
export async function getExcessiveAbsences(facultyId, limit = 4) {
  // Get faculty's courses
  const courses = await prisma.course.findMany({
    where: { facultyId },
    select: { id: true, code: true, nameAr: true, nameEn: true },
  });

  const courseIds = courses.map((c) => c.id);

  if (courseIds.length === 0) return [];

  // Get absences grouped by student+course
  const absences = await prisma.absence.groupBy({
    by: ["studentId", "courseId"],
    where: { courseId: { in: courseIds } },
    _count: { id: true },
    having: { id: { _count: { gte: limit } } },
  });

  // Enrich with student and course details
  const results = [];
  for (const a of absences) {
    const student = await prisma.user.findUnique({
      where: { id: a.studentId },
      select: { username: true, nameAr: true, nameEn: true },
    });
    const course = courses.find((c) => c.id === a.courseId);

    results.push({
      student: {
        id: student.username,
        nameAr: student.nameAr,
        nameEn: student.nameEn,
      },
      course: {
        code: course.code,
        nameAr: course.nameAr,
        nameEn: course.nameEn,
      },
      absenceCount: a._count.id,
      limit,
      exceeded: true,
    });
  }

  return results;
}
