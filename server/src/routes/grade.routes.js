// ==============================================
// SARA — Grade Routes
// GET /api/grades — student only
// ==============================================

import { Router } from "express";
import { handleGetGrades } from "../controllers/grade.controller.js";
import { roleGuard } from "../middleware/index.js";

const router = Router();

router.get("/", roleGuard("student"), handleGetGrades);

export default router;
