// ==============================================
// SARA — OpenAI Provider
// Connects to OpenAI API (GPT-4o-mini, etc.)
// ==============================================

import { BaseAIProvider } from "./base.provider.js";
import config from "../config/index.js";

export class OpenAIProvider extends BaseAIProvider {
  constructor() {
    super("OpenAI");
    this.apiKey = config.openaiApiKey;
    this.model = config.openaiModel;
    this.baseUrl = "https://api.openai.com/v1/chat/completions";
  }

  async generateResponse(userMessage, context, systemPrompt) {
    if (!this.apiKey || this.apiKey === "sk-your-api-key-here") {
      throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY in .env");
    }

    const contextMessage = this._buildContextMessage(context);

    const body = {
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${contextMessage}\n\nUser question: ${userMessage}` },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    };

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error ${response.status}: ${err.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Unable to generate a response.";
  }

  _buildContextMessage(context) {
    const parts = [
      `Role: ${context.role === "student" ? "student" : "faculty"}`,
      `Name: ${context.userName}`,
      `Data type: ${context.dataType}`,
      `Available data:\n${JSON.stringify(context.data, null, 2)}`,
    ];
    return parts.join("\n");
  }
}
