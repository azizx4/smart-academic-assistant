// ==============================================
// SARA — Chat Routes
// POST /api/chat — authenticated users only
// ==============================================

import { Router } from "express";
import { handleChat } from "../controllers/chat.controller.js";
import { roleGuard } from "../middleware/index.js";

const router = Router();

router.post("/", roleGuard("student", "faculty"), handleChat);

export default router;
