// ==============================================
// SARA — Audit Log Routes
// GET /api/audit-logs — faculty only
// GET /api/audit-logs/stats — faculty only
// ==============================================

import { Router } from "express";
import { handleGetAuditLogs, handleGetAuditStats } from "../controllers/audit-log.controller.js";
import { roleGuard } from "../middleware/index.js";

const router = Router();

router.get("/", roleGuard("faculty"), handleGetAuditLogs);
router.get("/stats", roleGuard("faculty"), handleGetAuditStats);

export default router;
