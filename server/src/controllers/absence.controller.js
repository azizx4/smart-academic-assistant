// ==============================================
// SARA — Absence Controller
// ==============================================

import { getStudentAbsences, getExcessiveAbsences } from "../services/absence.service.js";

/** GET /api/absences — student's own absences */
export async function handleGetAbsences(req, res, next) {
  try {
    const absences = await getStudentAbsences(req.user.id);
    res.json({ absences });
  } catch (err) {
    next(err);
  }
}

/** GET /api/absences/excessive — faculty: students exceeding limit */
export async function handleGetExcessiveAbsences(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const results = await getExcessiveAbsences(req.user.id, limit);
    res.json({ limit, students: results });
  } catch (err) {
    next(err);
  }
}
