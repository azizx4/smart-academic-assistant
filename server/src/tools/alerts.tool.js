// ==============================================
// SARA — Alerts Tool
// Student's notifications (info / warning / urgent).
// ==============================================

import { getStudentAlerts } from "../services/alert.service.js";

export const getStudentAlertsTool = {
  name: "get_student_alerts",
  description:
    "Retrieves the authenticated student's notifications/alerts (info/warning/urgent), newest first, plus unread count. Call this for ANY question about new messages, reminders, warnings, notices, anything that needs their attention. Example phrasings: 'التنبيهات', 'الإشعارات', 'فيه شي جديد', 'وش آخر تنبيه', 'شي يحتاج انتباه', 'رسائل جديدة', 'notifications', 'alerts', 'any warnings'.",
  roles: ["student"],
  parameters: {
    type: "object",
    properties: {
      unreadOnly: {
        type: "boolean",
        description: "If true, return only unread alerts.",
      },
    },
    required: [],
  },
  handler: async (args, user) => {
    const data = await getStudentAlerts(user.id);
    if (!args?.unreadOnly) return data;
    return {
      unreadCount: data.unreadCount,
      total: data.unreadCount,
      alerts: data.alerts.filter((a) => !a.isRead),
    };
  },
};
