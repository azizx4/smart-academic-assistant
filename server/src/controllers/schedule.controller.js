// ==============================================
// SARA — Schedule Controller
// ==============================================

import { getStudentSchedule } from "../services/schedule.service.js";

/** GET /api/schedule */
export async function handleGetSchedule(req, res, next) {
  try {
    const schedule = await getStudentSchedule(req.user.id);
    res.json({ schedule });
  } catch (err) {
    next(err);
  }
}
