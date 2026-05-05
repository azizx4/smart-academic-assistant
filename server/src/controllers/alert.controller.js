// ==============================================
// SARA — Alert Controller
// ==============================================

import { getStudentAlerts } from "../services/alert.service.js";

/** GET /api/alerts */
export async function handleGetAlerts(req, res, next) {
  try {
    const data = await getStudentAlerts(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
