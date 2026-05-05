// ==============================================
// SARA — Faculty Controller
// ==============================================

import { getFacultyCourses, getCourseStudents } from "../services/faculty.service.js";
import { getExcessiveAbsences } from "../services/absence.service.js";

/** GET /api/faculty/courses */
export async function handleGetFacultyCourses(req, res, next) {
  try {
    const courses = await getFacultyCourses(req.user.id);
    res.json({ courses });
  } catch (err) {
    next(err);
  }
}

/** GET /api/faculty/courses/:courseCode/students */
export async function handleGetCourseStudents(req, res, next) {
  try {
    const result = await getCourseStudents(req.user.id, req.params.courseCode);
    if (!result) {
      return res.status(404).json({
        error: "المقرر غير موجود أو ليس من مقرراتك",
        errorEn: "Course not found or not assigned to you",
      });
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/** GET /api/faculty/absences/excessive */
export async function handleGetExcessiveAbsences(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const results = await getExcessiveAbsences(req.user.id, limit);
    res.json({ limit, students: results });
  } catch (err) {
    next(err);
  }
}
