// ==============================================
// SARA — Schedule Routes
// GET /api/schedule — student only
// ==============================================

import { Router } from "express";
import { handleGetSchedule } from "../controllers/schedule.controller.js";
import { roleGuard } from "../middleware/index.js";

const router = Router();

router.get("/", roleGuard("student"), handleGetSchedule);

export default router;
