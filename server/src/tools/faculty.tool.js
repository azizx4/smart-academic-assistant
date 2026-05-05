// ==============================================
// SARA — Faculty Tools
// Faculty's own courses and per-course student rosters.
// ==============================================

import {
  getFacultyCourses,
  getCourseStudents,
} from "../services/faculty.service.js";

async function getAllCoursesRosters(facultyId) {
  const courses = await getFacultyCourses(facultyId);
  const rosters = [];
  for (const c of courses) {
    const roster = await getCourseStudents(facultyId, c.code);
    if (roster) rosters.push(roster);
  }
  return rosters;
}

export const getFacultyCoursesTool = {
  name: "get_faculty_courses",
  description:
    "For faculty: returns the courses the authenticated instructor teaches — code, name, credit hours, semester, enrollment count (number), schedule (day/time/room). NOTE: this returns the COUNT of students, not their names. For student names/roster, use `get_course_students`. Example phrasings: 'وش مقرراتي', 'مقرراتي', 'موادي', 'وش عندي هالترم', 'جدولي', 'كم طالب عندي', 'كم طالب مسجل', 'my courses', 'teaching load'.",
  roles: ["faculty"],
  parameters: { type: "object", properties: {}, required: [] },
  handler: async (_args, user) => {
    return await getFacultyCourses(user.id);
  },
};

export const getCourseStudentsTool = {
  name: "get_course_students",
  description:
    "For faculty: retrieves student rosters. If `courseCode` is provided, returns that single course's roster (name, score, letter grade, absence count per student). If `courseCode` is OMITTED, returns rosters for ALL of the faculty member's courses in one call — use this for broad questions like 'وش اسامي طلابي', 'عطني طلابي', 'طلاب مقرراتي', 'مين عندي', 'اسامي الطلاب', 'قائمة الطلاب'. Authorization is scoped to the authenticated faculty only.",
  roles: ["faculty"],
  parameters: {
    type: "object",
    properties: {
      courseCode: {
        type: "string",
        description:
          "Optional course code (e.g. 'CS301'). Omit to get rosters for every course the faculty teaches.",
      },
    },
    required: [],
  },
  handler: async (args, user) => {
    if (args?.courseCode) {
      return await getCourseStudents(user.id, args.courseCode);
    }
    return await getAllCoursesRosters(user.id);
  },
};
