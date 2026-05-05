// ==============================================
// SARA — Grades Tool
// Proof-of-concept conversion of grade.service to a tool.
// ==============================================

import { getStudentGrades, getStudentGPA } from "../services/grade.service.js";

export const getGradesTool = {
  name: "get_student_grades",
  description:
    "Retrieves the authenticated student's OWN grades (midterm, final, assignments, total, letter grade per course) plus cumulative GPA on a 4.0 scale. Call this for ANY question about the student's academic performance: grades, marks, scores, GPA, average, pass/fail status, how they did in a specific subject, whether they passed, or how close they are to a grade threshold. Example phrasings (all map to THIS tool): 'وش درجاتي', 'درجاتي', 'ابي اشوف علاماتي', 'علاماتي', 'عطني درجاتي', 'كم معدلي', 'وش معدلي', 'معدلي', 'كم جبت في المادة', 'كم حصلت', 'نجحت ولا لا', 'هل أنا راسب', 'تقديري', 'my grades', 'my GPA', 'what did I get'. If the user names a specific course (e.g. 'وش درجتي في CS101'), pass `courseCode`.",
  roles: ["student"],
  parameters: {
    type: "object",
    properties: {
      courseCode: {
        type: "string",
        description:
          "Optional course code to filter by (e.g. 'CS301'). Omit to return all courses.",
      },
    },
    required: [],
  },
  handler: async (args, user) => {
    const grades = await getStudentGrades(user.id);
    const gpa = await getStudentGPA(user.id);

    const filtered = args?.courseCode
      ? grades.filter(
          (g) => g.courseCode.toLowerCase() === args.courseCode.toLowerCase()
        )
      : grades;

    return { grades: filtered, gpa };
  },
};
