// ==============================================
// SARA — Ollama Provider
// Connects to local Ollama instance
// ==============================================

import { BaseAIProvider } from "./base.provider.js";
import config from "../config/index.js";

export class OllamaProvider extends BaseAIProvider {
  constructor() {
    super("Ollama");
    this.baseUrl = config.ollamaBaseUrl;
    this.model = config.ollamaModel;
  }

  async generateResponse(userMessage, context, systemPrompt) {
    const contextMessage = this._buildContextMessage(context);

    const body = {
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${contextMessage}\n\nسؤال المستخدم: ${userMessage}` },
      ],
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 1024,
      },
    };

    let response;
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new Error(
        `Cannot connect to Ollama at ${this.baseUrl}. Is Ollama running? Error: ${err.message}`
      );
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      throw new Error(`Ollama error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.message?.content || "لم أتمكن من توليد إجابة.";
  }

  _buildContextMessage(context) {
    const parts = [
      `الدور: ${context.role === "student" ? "طالب" : "عضو هيئة تدريس"}`,
      `الاسم: ${context.userName}`,
      `نوع البيانات: ${context.dataType}`,
      `البيانات المتاحة:\n${JSON.stringify(context.data, null, 2)}`,
    ];
    return parts.join("\n");
  }
}
