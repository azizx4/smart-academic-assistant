// ==============================================
// SARA — Tools Bootstrap
// Registers every tool into the central registry.
// Adding a new tool = import + registry.register().
// ==============================================

import { registry } from "./tool-registry.js";
import { getGradesTool } from "./grades.tool.js";
import {
  getStudentAbsencesTool,
  getExcessiveAbsencesTool,
} from "./absences.tool.js";
import { getStudentScheduleTool } from "./schedule.tool.js";
import { getStudentPlanTool } from "./plan.tool.js";
import { getStudentAlertsTool } from "./alerts.tool.js";
import { getNewsTool } from "./news.tool.js";
import {
  getFacultyCoursesTool,
  getCourseStudentsTool,
} from "./faculty.tool.js";

let initialized = false;

export function initializeTools() {
  if (initialized) return registry;

  registry.register(getGradesTool);
  registry.register(getStudentAbsencesTool);
  registry.register(getStudentScheduleTool);
  registry.register(getStudentPlanTool);
  registry.register(getStudentAlertsTool);
  registry.register(getNewsTool);

  registry.register(getExcessiveAbsencesTool);
  registry.register(getFacultyCoursesTool);
  registry.register(getCourseStudentsTool);

  initialized = true;
  return registry;
}

export { registry };
