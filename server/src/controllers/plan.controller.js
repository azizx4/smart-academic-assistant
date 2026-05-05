// ==============================================
// SARA — Plan Controller
// ==============================================

import { getStudentPlan } from "../services/plan.service.js";

/** GET /api/plan */
export async function handleGetPlan(req, res, next) {
  try {
    const plan = await getStudentPlan(req.user.id);
    res.json(plan);
  } catch (err) {
    next(err);
  }
}
