// ==============================================
// SARA — Alert Routes
// GET /api/alerts — student only
// ==============================================

import { Router } from "express";
import { handleGetAlerts } from "../controllers/alert.controller.js";
import { roleGuard } from "../middleware/index.js";

const router = Router();

router.get("/", roleGuard("student"), handleGetAlerts);

export default router;
