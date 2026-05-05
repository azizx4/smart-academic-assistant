// ==============================================
// SARA — Faculty Service
// Scoped queries for faculty members
// ==============================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get all courses taught by a faculty member.
 * SCOPE: faculty sees only their own courses.
 */
export async function getFacultyCourses(facultyId) {
  const courses = await prisma.course.findMany({
    where: { facultyId },
    include: {
      _count: { select: { enrollments: true } },
      schedules: true,
    },
  });

  return courses.map((c) => ({
    code: c.code,
    nameAr: c.nameAr,
    nameEn: c.nameEn,
    creditHours: c.creditHrs,
    semester: c.semester,
    enrolledStudents: c._count.enrollments,
    schedule: c.schedules.map((s) => ({
      day: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room,
    })),
  }));
}

/**
 * Get students enrolled in a specific course.
 * SCOPE: faculty can only query courses they teach.
 *
 * @param {number} facultyId - The faculty user ID
 * @param {string} courseCode - The course code
 */
export async function getCourseStudents(facultyId, courseCode) {
  // Verify course belongs to this faculty
  const course = await prisma.course.findFirst({
    where: { code: courseCode, facultyId },
  });

  if (!course) {
    return null; // Course not found or doesn't belong to faculty
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: course.id },
    include: {
      student: {
        select: { username: true, nameAr: true, nameEn: true, email: true },
      },
    },
  });

  // Get grades and absences for each student
  const students = [];
  for (const e of enrollments) {
    const grade = await prisma.grade.findUnique({
      where: { studentId_courseId: { studentId: e.studentId, courseId: course.id } },
    });
    const absenceCount = await prisma.absence.count({
      where: { studentId: e.studentId, courseId: course.id },
    });

    students.push({
      studentId: e.student.username,
      nameAr: e.student.nameAr,
      nameEn: e.student.nameEn,
      total: grade?.total ?? null,
      letterGrade: grade?.letterGrade ?? null,
      absences: absenceCount,
    });
  }

  return {
    course: { code: course.code, nameAr: course.nameAr, nameEn: course.nameEn },
    students,
  };
}
