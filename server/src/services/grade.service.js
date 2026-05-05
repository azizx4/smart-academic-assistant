// ==============================================
// SARA — Grade Service
// Scoped grade queries per student
// ==============================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get all grades for a specific student.
 * SCOPE: student can only see their own grades.
 */
export async function getStudentGrades(studentId) {
  const grades = await prisma.grade.findMany({
    where: { studentId },
    include: {
      course: {
        select: { code: true, nameAr: true, nameEn: true, creditHrs: true },
      },
    },
  });

  return grades.map((g) => ({
    courseCode: g.course.code,
    courseNameAr: g.course.nameAr,
    courseNameEn: g.course.nameEn,
    creditHours: g.course.creditHrs,
    midterm: g.midterm,
    final: g.final,
    assignments: g.assignments,
    total: g.total,
    letterGrade: g.letterGrade,
  }));
}

/**
 * Calculate GPA for a student.
 * Simple weighted GPA based on letter grades and credit hours.
 */
export async function getStudentGPA(studentId) {
  const grades = await prisma.grade.findMany({
    where: { studentId },
    include: {
      course: { select: { creditHrs: true } },
    },
  });

  const gradePoints = {
    "A+": 4.0, "A": 3.75, "B+": 3.5, "B": 3.0,
    "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0.0,
  };

  let totalPoints = 0;
  let totalCredits = 0;

  for (const g of grades) {
    if (g.letterGrade && gradePoints[g.letterGrade] !== undefined) {
      totalPoints += gradePoints[g.letterGrade] * g.course.creditHrs;
      totalCredits += g.course.creditHrs;
    }
  }

  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

  return {
    gpa: parseFloat(gpa),
    totalCredits,
    coursesCount: grades.length,
  };
}
