// ==============================================
// SARA — Health Routes
// GET /api/health — public status check
// ==============================================

import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SARA API",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

export default router;
