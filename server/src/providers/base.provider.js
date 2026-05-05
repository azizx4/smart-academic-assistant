// ==============================================
// SARA — AI Provider Interface
// Abstract contract for all AI providers.
//
// SECURITY RULE: The provider receives ONLY pre-filtered data.
// It has NO access to the database or authorization logic.
// The provider MAY suggest which tool to call, but the backend
// is the sole authority on whether that call is permitted.
// ==============================================

export class BaseAIProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Legacy single-shot generation. Kept for backward compatibility
   * and as the fallback path when function-calling is unsupported.
   */
  async generateResponse(userMessage, context, systemPrompt) {
    throw new Error(`generateResponse() not implemented in ${this.name}`);
  }

  /**
   * Whether this provider supports tool/function calling.
   * Subclasses override to opt-in.
   */
  supportsTools() {
    return false;
  }

  /**
   * Ask the model to pick a tool (or answer directly) given the user
   * message and the role-scoped tool schemas.
   *
   * @returns {Promise<{type: "call", calls: Array<{name, args}>} | {type: "text", text: string}>}
   */
  async selectTool(userMessage, toolSchemas, context, systemPrompt) {
    throw new Error(`selectTool() not implemented in ${this.name}`);
  }

  /**
   * After a tool has been executed by the backend, pass the results
   * back to the model to produce the final natural-language reply.
   */
  async respondWithToolResults(userMessage, toolCalls, toolResults, context, systemPrompt) {
    throw new Error(`respondWithToolResults() not implemented in ${this.name}`);
  }
}
