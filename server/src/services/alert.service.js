// ==============================================
// SARA — Alert Service
// Scoped alert queries per student
// ==============================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get alerts for a specific student.
 * SCOPE: student sees only their own alerts.
 */
export async function getStudentAlerts(studentId) {
  const alerts = await prisma.alert.findMany({
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
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return {
    unreadCount,
    total: alerts.length,
    alerts,
  };
}
