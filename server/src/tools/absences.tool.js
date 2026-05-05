// ==============================================
// SARA — Absences Tools
// Student: own absences grouped by course.
// Faculty: students exceeding an absence threshold
//          across the faculty member's own courses.
// ==============================================

import {
  getStudentAbsences,
  getExcessiveAbsences,
} from "../services/absence.service.js";

export const getStudentAbsencesTool = {
  name: "get_student_absences",
  description:
    "Retrieves the authenticated student's OWN absence records grouped by course (total per course + dated entries). Call this for ANY question about the student's attendance, missed classes, absence warnings, whether they're at risk of being barred (حرمان), or which courses they have been absent from. IMPORTANT: If the user asks about 'غايب' (absent), 'اغيب' (being absent), 'المواد اللي غايب فيها' (courses I'm absent in), 'كم مره اغيب' (how many times absent), these ALL refer to absences — NOT grades or schedule. Example phrasings: 'كم مرة غبت', 'وش غيابي', 'غيابي', 'عطني الغياب', 'كم غيابي', 'هل أنا محروم', 'هل انحرمت', 'غيابي في المادة', 'حضوري', 'وش المواد اللي غايب فيها', 'توريني غيابي', 'وريني غيابي', 'كم مره اغيب', 'absences', 'attendance', 'am I absent a lot', 'which courses am I absent from', 'show my absences'.",
  roles: ["student"],
  parameters: {
    type: "object",
    properties: {
      courseCode: {
        type: "string",
        description:
          "Optional course code to filter results to a single course.",
      },
    },
    required: [],
  },
  handler: async (args, user) => {
    const all = await getStudentAbsences(user.id);
    if (!args?.courseCode) return all;
    return all.filter(
      (c) => c.courseCode.toLowerCase() === args.courseCode.toLowerCase()
    );
  },
};

export const getExcessiveAbsencesTool = {
  name: "get_excessive_absences",
  description:
    "For faculty: returns the list of students across the faculty member's own courses who exceeded an absence threshold (default 4). Call this for ANY question about students at risk, excessive absences, warning list, who should be barred. Example phrasings: 'الطلاب المتجاوزين في الغياب', 'مين عنده غياب كثير', 'طلاب كثير غيابهم', 'تقرير الغياب', 'مين حراموا', 'students at risk', 'excessive absences'.",
  roles: ["faculty"],
  parameters: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Absence threshold. Defaults to 4 if not provided.",
      },
    },
    required: [],
  },
  handler: async (args, user) => {
    const limit = typeof args?.limit === "number" ? args.limit : 4;
    return await getExcessiveAbsences(user.id, limit);
  },
};
