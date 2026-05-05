import config from "../config/index.js";
import { OpenAIProvider } from "./openai.provider.js";
import { OllamaProvider } from "./ollama.provider.js";
import { GeminiProvider } from "./gemini.provider.js";

let providerInstance = null;

export function getAIProvider() {
  if (providerInstance) return providerInstance;
  switch (config.aiProvider) {
    case "openai": providerInstance = new OpenAIProvider(); break;
    case "ollama": providerInstance = new OllamaProvider(); break;
    case "gemini": providerInstance = new GeminiProvider(); break;
    default: throw new Error("Unknown AI provider: " + config.aiProvider);
  }
  console.log("[AI] Provider: " + providerInstance.name);
  return providerInstance;
}