// ==============================================
// SARA — Academic Plan Tool
// Student's degree plan: completed / in-progress / remaining.
// ==============================================

import { getStudentPlan } from "../services/plan.service.js";

export const getStudentPlanTool = {
  name: "get_student_plan",
  description:
    "Retrieves the authenticated student's full degree plan, split into completed, in-progress, and remaining courses — with a numeric summary for each bucket. Call this for ANY question about graduation progress, what's finished, what's left, percentage complete, graduation readiness. Example phrasings: 'خطتي', 'خطتي الدراسية', 'كم باقي على تخرجي', 'متى أتخرج', 'وش خلصت', 'المواد اللي خلصتها', 'شكثر باقي', 'كم نسبة إنجازي', 'degree plan', 'graduation', 'what courses are left'.",
  roles: ["student"],
  parameters: {
    type: "object",
    properties: {
      status: {
        type: "string",
        description:
          "Optional filter: 'completed' | 'in_progress' | 'remaining'. Omit for full plan.",
      },
    },
    required: [],
  },
  handler: async (args, user) => {
    const plan = await getStudentPlan(user.id);
    if (!args?.status) return plan;

    const statusMap = {
      completed: { summary: plan.summary, completed: plan.completed },
      in_progress: { summary: plan.summary, inProgress: plan.inProgress },
      remaining: { summary: plan.summary, remaining: plan.remaining },
    };
    return statusMap[args.status] || plan;
  },
};
