// ==============================================
// SARA — Tool Executor
// Safely executes a tool selected by the AI.
//
// Responsibility chain:
//   1. Verify tool exists in registry (whitelist)
//   2. Verify user's role is allowed on the tool
//   3. Validate arguments against the tool schema (shallow)
//   4. Call handler with (args, user)
//
// The AI's selection is NEVER trusted for authorization.
// ==============================================

import { registry } from "./tool-registry.js";

export class ToolError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export async function executeTool(toolName, args, user) {
  const tool = registry.get(toolName);
  if (!tool) {
    throw new ToolError("TOOL_NOT_FOUND", `Unknown tool: ${toolName}`);
  }

  if (!tool.roles.includes(user.role)) {
    throw new ToolError(
      "FORBIDDEN",
      `Role '${user.role}' cannot invoke tool '${toolName}'`
    );
  }

  const safeArgs = validateArgs(tool.parameters, args || {});

  return await tool.handler(safeArgs, user);
}

function validateArgs(schema, args) {
  if (!schema || schema.type !== "object") return {};
  const out = {};
  const props = schema.properties || {};

  for (const [key, spec] of Object.entries(props)) {
    if (args[key] === undefined) continue;
    const val = args[key];

    if (spec.type === "string" && typeof val !== "string") continue;
    if (spec.type === "number" && typeof val !== "number") continue;
    if (spec.type === "boolean" && typeof val !== "boolean") continue;

    out[key] = val;
  }

  const required = schema.required || [];
  for (const key of required) {
    if (out[key] === undefined) {
      throw new ToolError("INVALID_ARGS", `Missing required parameter: ${key}`);
    }
  }

  return out;
}
