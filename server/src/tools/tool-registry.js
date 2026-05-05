// ==============================================
// SARA — Tool Registry
// Central registry for all AI-callable tools.
//
// A "tool" is a wrapper around a scoped service function.
// Each tool declares:
//   - name:        unique identifier (used by the LLM)
//   - description: natural-language hint for the LLM
//   - roles:       which user roles may invoke it
//   - parameters:  JSON Schema describing arguments
//   - handler:     async (args, user) => data
//
// SECURITY: the registry itself does NOT authorize.
// Callers (ToolExecutor) MUST enforce role checks
// before handler() runs — AI selection is advisory only.
// ==============================================

class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  register(tool) {
    if (!tool.name || typeof tool.name !== "string") {
      throw new Error("Tool must have a string name");
    }
    if (!tool.description) {
      throw new Error(`Tool ${tool.name} missing description`);
    }
    if (!Array.isArray(tool.roles) || tool.roles.length === 0) {
      throw new Error(`Tool ${tool.name} must declare at least one role`);
    }
    if (typeof tool.handler !== "function") {
      throw new Error(`Tool ${tool.name} must have an async handler`);
    }
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool ${tool.name} already registered`);
    }

    this.tools.set(tool.name, {
      name: tool.name,
      description: tool.description,
      roles: tool.roles,
      parameters: tool.parameters || { type: "object", properties: {} },
      handler: tool.handler,
    });
  }

  get(name) {
    return this.tools.get(name);
  }

  has(name) {
    return this.tools.has(name);
  }

  listForRole(role) {
    const out = [];
    for (const tool of this.tools.values()) {
      if (tool.roles.includes(role)) out.push(tool);
    }
    return out;
  }

  toGeminiSchema(role) {
    return this.listForRole(role).map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));
  }

  toOpenAISchema(role) {
    return this.listForRole(role).map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));
  }
}

export const registry = new ToolRegistry();
export { ToolRegistry };
