import { BaseAIProvider } from "./base.provider.js";
import config from "../config/index.js";

export class GeminiProvider extends BaseAIProvider {
  constructor() {
    super("Gemini");
    this.apiKey = config.geminiApiKey;
    this.model = config.geminiModel || "gemini-2.5-flash";
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
  }

  supportsTools() {
    return true;
  }

  async generateResponse(userMessage, context, systemPrompt) {
    if (!this.apiKey) throw new Error("Gemini API key not configured. Set GEMINI_API_KEY in .env");

    const contextMessage = this._buildContextMessage(context);
    const body = {
      contents: [{
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n---\n\n${contextMessage}\n\n${userMessage}` }],
      }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024, topP: 0.8, topK: 40 },
      safetySettings: this._safetySettings(),
    };

    const data = await this._post(body);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    if (!text) {
      if (data.candidates?.[0]?.finishReason === "SAFETY") return "Sorry, cannot process this request.";
      throw new Error("Gemini returned empty response");
    }
    return text;
  }

  async selectTool(userMessage, toolSchemas, context, systemPrompt) {
    if (!this.apiKey) throw new Error("Gemini API key not configured. Set GEMINI_API_KEY in .env");

    const header = this._buildRoleHeader(context);
    const historyTurns = this._historyToContents(context.history);
    const body = {
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\n${header}` }] },
        { role: "model", parts: [{ text: "Understood. Ready." }] },
        ...historyTurns,
        { role: "user", parts: [{ text: userMessage }] },
      ],
      tools: [{ functionDeclarations: toolSchemas }],
      toolConfig: { functionCallingConfig: { mode: "AUTO" } },
      generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
      safetySettings: this._safetySettings(),
    };

    const data = await this._post(body);
    const parts = data.candidates?.[0]?.content?.parts || [];

    const calls = parts
      .filter((p) => p.functionCall)
      .map((p) => ({ name: p.functionCall.name, args: p.functionCall.args || {} }));

    if (calls.length > 0) return { type: "call", calls };

    const text = parts.find((p) => p.text)?.text;
    if (text) return { type: "text", text };

    return { type: "text", text: "" };
  }

  async respondWithToolResults(userMessage, toolCalls, toolResults, context, systemPrompt) {
    const header = this._buildRoleHeader(context);
    const historyTurns = this._historyToContents(context.history);

    const modelParts = toolCalls.map((c) => ({
      functionCall: { name: c.name, args: c.args },
    }));
    const resultParts = toolCalls.map((c, i) => ({
      functionResponse: {
        name: c.name,
        response: { result: toolResults[i] },
      },
    }));

    const body = {
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\n${header}` }] },
        { role: "model", parts: [{ text: "Understood. Ready." }] },
        ...historyTurns,
        { role: "user", parts: [{ text: userMessage }] },
        { role: "model", parts: modelParts },
        { role: "user", parts: resultParts },
      ],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
      safetySettings: this._safetySettings(),
    };

    const data = await this._post(body);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    if (!text) {
      if (data.candidates?.[0]?.finishReason === "SAFETY") return "Sorry, cannot process this request.";
      throw new Error("Gemini returned empty response after tool call");
    }
    return text;
  }

  async _post(body) {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new Error("Cannot connect to Gemini: " + err.message);
    }
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error("Gemini error: " + (errData.error?.message || response.status));
    }
    return await response.json();
  }

  _safetySettings() {
    return [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ];
  }

  _buildRoleHeader(context) {
    return [
      "Role: " + (context.role === "student" ? "student" : "faculty"),
      "Name: " + context.userName,
      "IMPORTANT: Reply in the same language the user writes in. Arabic question → Arabic answer. English question → English answer.",
    ].join("\n");
  }

  _historyToContents(history) {
    if (!Array.isArray(history) || history.length === 0) return [];
    const out = [];
    for (const turn of history) {
      if (turn.user) out.push({ role: "user", parts: [{ text: turn.user }] });
      if (turn.assistant) out.push({ role: "model", parts: [{ text: turn.assistant }] });
    }
    return out;
  }

  _buildContextMessage(context) {
    return [
      context.role === "student" ? "Role: student" : "Role: faculty",
      "Name: " + context.userName,
      "Data type: " + context.dataType,
      "IMPORTANT: Reply in the same language the user writes in. Arabic question → Arabic answer. English question → English answer.",
      "Available data:\n" + JSON.stringify(context.data, null, 2),
    ].join("\n");
  }
}
