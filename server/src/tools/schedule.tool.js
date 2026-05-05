// ==============================================
// SARA — Schedule Tool
// Student's weekly class schedule (sorted by day+time).
// ==============================================

import { getStudentSchedule } from "../services/schedule.service.js";

export const getStudentScheduleTool = {
  name: "get_student_schedule",
  description:
    "Retrieves the authenticated student's weekly class schedule: every enrolled course with day, start/end times, room, and instructor name — sorted chronologically. Call this for ANY question about the student's timetable, classes today/tomorrow, lecture times, room locations, which instructor teaches what. Also serves questions about enrolled/registered courses list. Example phrasings: 'جدولي', 'وش جدولي', 'وش محاضراتي اليوم', 'متى محاضرتي', 'وين القاعة', 'وش عندي اليوم', 'وش عندي بكره', 'كلاساتي', 'مواد مسجلة', 'موادي هالترم', 'المواد اللي مسجلها', 'schedule', 'timetable', 'classes today'. Pass `dayOfWeek` only if user explicitly names a day.",
  roles: ["student"],
  parameters: {
    type: "object",
    properties: {
      dayOfWeek: {
        type: "string",
        description:
          "Optional day filter — English day name (e.g. 'Sunday', 'Monday'). Omit to return the full week.",
      },
    },
    required: [],
  },
  handler: async (args, user) => {
    const full = await getStudentSchedule(user.id);
    if (!args?.dayOfWeek) return full;
    const target = args.dayOfWeek.toLowerCase();
    return full.filter((s) => s.dayOfWeek.toLowerCase() === target);
  },
};
