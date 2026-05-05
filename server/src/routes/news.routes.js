// ==============================================
// SARA — News Routes
// GET /api/news — all authenticated users
// ==============================================

import { Router } from "express";
import { handleGetNews } from "../controllers/news.controller.js";
import { roleGuard } from "../middleware/index.js";

const router = Router();

router.get("/", roleGuard("student", "faculty"), handleGetNews);

export default router;
