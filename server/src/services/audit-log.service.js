// ==============================================
// SARA — Chat Audit Log Service
// Records every chat interaction for monitoring,
// security analysis, and usage statistics.
// ==============================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MAX_RESPONSE_LENGTH = 500; // truncate long AI responses

/**
 * Log a chat interaction.
 */
export async function logChatInteraction({
  userId,
  username,
  userRole,
  message,
  response,
  intent,
  toolCalled,
  blocked = false,
  blockReason,
  provider,
  responseMs,
}) {
  try {
    await prisma.chatAuditLog.create({
      data: {
        userId,
        username,
        userRole,
        message: message?.slice(0, 1000) || "",
        response: response?.slice(0, MAX_RESPONSE_LENGTH) || null,
        intent: intent || null,
        toolCalled: toolCalled || null,
        blocked,
        blockReason: blockReason || null,
        provider: provider || null,
        responseMs: responseMs || null,
      },
    });
  } catch (err) {
    // Audit logging should never break the chat flow
    console.error("[AuditLog] Failed to write:", err.message);
  }
}

/**
 * Query audit logs with filters.
 */
export async function getAuditLogs({
  page = 1,
  limit = 50,
  userId,
  blocked,
  startDate,
  endDate,
} = {}) {
  const where = {};

  if (userId) where.userId = userId;
  if (blocked !== undefined) where.blocked = blocked;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    prisma.chatAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.chatAuditLog.count({ where }),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/**
 * Get summary statistics.
 */
export async function getAuditStats() {
  const [totalMessages, blockedAttempts, uniqueUsers, last24h] =
    await Promise.all([
      prisma.chatAuditLog.count(),
      prisma.chatAuditLog.count({ where: { blocked: true } }),
      prisma.chatAuditLog.groupBy({ by: ["userId"], _count: true }).then((r) => r.length),
      prisma.chatAuditLog.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
    ]);

  return { totalMessages, blockedAttempts, uniqueUsers, messagesLast24h: last24h };
}
