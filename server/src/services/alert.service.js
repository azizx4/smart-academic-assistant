// ==============================================
// SARA — Alert Service
// Scoped alert queries per student
// ==============================================

import { PrismaClient } from "@prisma/client";
import { translateAlertTitle, translateAlertBody } from "./alert-translation.js";

const prisma = new PrismaClient();

/**
 * Get alerts for a specific student.
 * SCOPE: student sees only their own alerts.
 * Each alert includes both Arabic (title/body) and English (titleEn/bodyEn).
 */
export async function getStudentAlerts(studentId) {
  const [alerts, courses] = await Promise.all([
    prisma.alert.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        body: true,
        type: true,
        isRead: true,
        createdAt: true,
      },
    }),
    prisma.course.findMany({
      select: { code: true, nameEn: true },
    }),
  ]);

  // Build code → English name map for body translation
  const courseMap = {};
  for (const c of courses) courseMap[c.code] = c.nameEn;

  const enriched = alerts.map((a) => ({
    ...a,
    titleEn: translateAlertTitle(a.title),
    bodyEn: translateAlertBody(a.body, courseMap),
  }));

  const unreadCount = enriched.filter((a) => !a.isRead).length;

  return {
    unreadCount,
    total: enriched.length,
    alerts: enriched,
  };
}
