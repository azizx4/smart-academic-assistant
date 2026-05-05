// ==============================================
// SARA — Schedule Service
// Scoped schedule queries per student
// ==============================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get schedule for a student based on their enrolled courses.
 * SCOPE: student sees only their own schedule.
 */
export async function getStudentSchedule(studentId) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          schedules: true,
          faculty: { select: { nameAr: true, nameEn: true } },
        },
      },
    },
  });

  const dayOrder = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };

  const schedule = [];
  for (const e of enrollments) {
    for (const s of e.course.schedules) {
      schedule.push({
        courseCode: e.course.code,
        courseNameAr: e.course.nameAr,
        courseNameEn: e.course.nameEn,
        facultyNameAr: e.course.faculty.nameAr,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        room: s.room,
      });
    }
  }

  // Sort by day then time
  schedule.sort((a, b) => {
    const dayDiff = (dayOrder[a.dayOfWeek] || 0) - (dayOrder[b.dayOfWeek] || 0);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  return schedule;
}
