// ==============================================
// SARA — Absence Routes
// GET /api/absences — student only
// ==============================================

import { Router } from "express";
import { handleGetAbsences } from "../controllers/absence.controller.js";
import { roleGuard } from "../middleware/index.js";

const router = Router();

router.get("/", roleGuard("student"), handleGetAbsences);

export default router;
