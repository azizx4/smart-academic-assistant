// ==============================================
// SARA — Audit Log Controller
// Faculty-only access to chat audit logs
// ==============================================

import { getAuditLogs, getAuditStats } from "../services/audit-log.service.js";

export async function handleGetAuditLogs(req, res, next) {
  try {
    const { page, limit, userId, blocked, startDate, endDate } = req.query;
    const result = await getAuditLogs({
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 50, 100),
      userId: userId ? parseInt(userId) : undefined,
      blocked: blocked === "true" ? true : blocked === "false" ? false : undefined,
      startDate,
      endDate,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleGetAuditStats(req, res, next) {
  try {
    const stats = await getAuditStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
