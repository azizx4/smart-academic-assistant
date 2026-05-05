// ==============================================
// SARA — Grade Controller
// ==============================================

import { getStudentGrades, getStudentGPA } from "../services/grade.service.js";

/** GET /api/grades */
export async function handleGetGrades(req, res, next) {
  try {
    const grades = await getStudentGrades(req.user.id);
    const gpa = await getStudentGPA(req.user.id);
    res.json({ grades, gpa });
  } catch (err) {
    next(err);
  }
}
