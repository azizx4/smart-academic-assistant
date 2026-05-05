// ==============================================
// SARA — Plan Routes
// GET /api/plan — student only
// ==============================================

import { Router } from "express";
import { handleGetPlan } from "../controllers/plan.controller.js";
import { roleGuard } from "../middleware/index.js";

const router = Router();

router.get("/", roleGuard("student"), handleGetPlan);

export default router;
